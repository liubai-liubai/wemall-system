/**
 * 数据库操作辅助工具
 * 提供集成测试中的数据库操作、数据清理、事务管理等功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 数据库表名枚举
 * 定义所有需要清理的数据库表
 */
export enum DatabaseTable {
  // 系统管理表
  ADMIN_USERS = 'admin_users',
  DEPARTMENTS = 'departments',
  PERMISSIONS = 'permissions',
  ROLES = 'roles',
  ROLE_PERMISSIONS = 'role_permissions',
  ADMIN_USER_ROLES = 'admin_user_roles',
  
  // 用户相关表
  USERS = 'users',
  USER_ADDRESSES = 'user_addresses',
  USER_MEMBERS = 'user_members',
  MEMBER_LEVELS = 'member_levels',
  MEMBER_POINTS = 'member_points',
  
  // 商品相关表
  PRODUCTS = 'products',
  PRODUCT_CATEGORIES = 'product_categories',
  PRODUCT_ATTRIBUTES = 'product_attributes',
  PRODUCT_IMAGES = 'product_images',
  PRODUCT_SKUS = 'product_skus',
  PRODUCT_STOCKS = 'product_stocks',
  
  // 购物相关表
  SHOPPING_CARTS = 'shopping_carts',
  ORDERS = 'orders',
  ORDER_ITEMS = 'order_items'
}

/**
 * 数据清理配置接口
 */
export interface ICleanupConfig {
  tables?: DatabaseTable[];
  preserveSystemData?: boolean;
  resetAutoIncrement?: boolean;
}

/**
 * 数据库备份配置接口
 */
export interface IBackupConfig {
  backupPath?: string;
  includeData?: boolean;
  compressBackup?: boolean;
}

/**
 * 数据库辅助类
 * 提供测试环境下的数据库操作功能
 */
export class DatabaseHelper {
  private prisma: PrismaClient;
  private static instance: DatabaseHelper | null = null;
  
  private constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
        }
      },
      log: process.env.NODE_ENV === 'test' ? [] : ['query', 'error', 'warn']
    });
  }
  
  /**
   * 获取单例实例
   */
  static getInstance(): DatabaseHelper {
    if (!DatabaseHelper.instance) {
      DatabaseHelper.instance = new DatabaseHelper();
    }
    return DatabaseHelper.instance;
  }
  
  /**
   * 获取Prisma客户端实例
   */
  getPrismaClient(): PrismaClient {
    return this.prisma;
  }
  
  /**
   * 连接数据库
   */
  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✅ 集成测试数据库连接成功');
    } catch (error) {
      console.error('❌ 集成测试数据库连接失败:', error);
      throw error;
    }
  }
  
  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('🔌 集成测试数据库连接已断开');
    } catch (error) {
      console.error('❌ 数据库断开连接失败:', error);
    }
  }
  
  /**
   * 清理指定表的数据
   * @param tables 要清理的表名数组
   * @param resetAutoIncrement 是否重置自增ID
   */
  async cleanupTables(
    tables: DatabaseTable[] = Object.values(DatabaseTable),
    resetAutoIncrement: boolean = true
  ): Promise<void> {
    try {
      // 按依赖关系排序，先删除子表数据
      const orderedTables = this.getTableDeletionOrder(tables);
      
      // 禁用外键检查
      await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
      
      for (const table of orderedTables) {
        // 删除表数据
        await this.prisma.$executeRawUnsafe(`DELETE FROM ${table}`);
        
        // 重置自增ID
        if (resetAutoIncrement) {
          await this.prisma.$executeRawUnsafe(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        }
        
        console.log(`🧹 已清理表: ${table}`);
      }
      
      // 重新启用外键检查
      await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
      
      console.log('✅ 数据库表清理完成');
    } catch (error) {
      console.error('❌ 数据库表清理失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取表删除顺序
   * 根据外键依赖关系确定删除顺序
   */
  private getTableDeletionOrder(tables: DatabaseTable[]): string[] {
    const dependencyMap: Record<string, string[]> = {
      // 依赖关系：子表 -> [父表1, 父表2]
      [DatabaseTable.ADMIN_USER_ROLES]: [DatabaseTable.ADMIN_USERS, DatabaseTable.ROLES],
      [DatabaseTable.ROLE_PERMISSIONS]: [DatabaseTable.ROLES, DatabaseTable.PERMISSIONS],
      [DatabaseTable.USER_ADDRESSES]: [DatabaseTable.USERS],
      [DatabaseTable.USER_MEMBERS]: [DatabaseTable.USERS, DatabaseTable.MEMBER_LEVELS],
      [DatabaseTable.MEMBER_POINTS]: [DatabaseTable.USER_MEMBERS],
      [DatabaseTable.PRODUCTS]: [DatabaseTable.PRODUCT_CATEGORIES],
      [DatabaseTable.PRODUCT_ATTRIBUTES]: [DatabaseTable.PRODUCTS],
      [DatabaseTable.PRODUCT_IMAGES]: [DatabaseTable.PRODUCTS],
      [DatabaseTable.PRODUCT_SKUS]: [DatabaseTable.PRODUCTS],
      [DatabaseTable.PRODUCT_STOCKS]: [DatabaseTable.PRODUCT_SKUS],
      [DatabaseTable.SHOPPING_CARTS]: [DatabaseTable.USERS, DatabaseTable.PRODUCT_SKUS],
      [DatabaseTable.ORDER_ITEMS]: [DatabaseTable.ORDERS, DatabaseTable.PRODUCT_SKUS],
      [DatabaseTable.ORDERS]: [DatabaseTable.USERS]
    };
    
    // 拓扑排序确定删除顺序
    const result: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (table: string): void => {
      if (visiting.has(table)) {
        throw new Error(`检测到循环依赖: ${table}`);
      }
      if (visited.has(table)) {
        return;
      }
      
      visiting.add(table);
      
      // 先访问依赖的表
      const dependencies = dependencyMap[table] || [];
      dependencies.forEach(dep => {
        if (tables.includes(dep as DatabaseTable)) {
          visit(dep);
        }
      });
      
      visiting.delete(table);
      visited.add(table);
      result.unshift(table); // 逆序添加，子表在前
    };
    
    tables.forEach(table => {
      if (!visited.has(table)) {
        visit(table);
      }
    });
    
    return result;
  }
  
  /**
   * 清理所有测试数据
   * 清理除系统基础数据外的所有测试数据
   */
  async cleanupTestData(): Promise<void> {
    const config: ICleanupConfig = {
      preserveSystemData: true,
      resetAutoIncrement: true
    };
    
    await this.cleanupTables(undefined, config.resetAutoIncrement);
  }
  
  /**
   * 初始化基础测试数据
   * 创建测试所需的基础数据（权限、角色等）
   */
  async seedBasicTestData(): Promise<void> {
    try {
      // 创建基础权限数据
      await this.createBasicPermissions();
      
      // 创建基础角色数据
      await this.createBasicRoles();
      
      // 创建基础会员等级数据
      await this.createBasicMemberLevels();
      
      // 创建基础商品分类数据
      await this.createBasicProductCategories();
      
      console.log('✅ 基础测试数据初始化完成');
    } catch (error) {
      console.error('❌ 基础测试数据初始化失败:', error);
      throw error;
    }
  }
  
  /**
   * 创建基础权限数据
   */
  private async createBasicPermissions(): Promise<void> {
    const permissions = [
      {
        id: 'perm-system-001',
        name: '系统管理',
        code: 'system:manage',
        type: 'menu',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'perm-user-001',
        name: '用户管理',
        code: 'user:manage',
        type: 'menu',
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'perm-product-001',
        name: '商品管理',
        code: 'product:manage',
        type: 'menu',
        sort: 3,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    for (const permission of permissions) {
      await this.prisma.permission.upsert({
        where: { id: permission.id },
        update: permission,
        create: permission
      });
    }
  }
  
  /**
   * 创建基础角色数据
   */
  private async createBasicRoles(): Promise<void> {
    const roles = [
      {
        id: 'role-admin-001',
        name: '超级管理员',
        code: 'super_admin',
        description: '系统超级管理员，拥有所有权限',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'role-manager-001',
        name: '普通管理员',
        code: 'manager',
        description: '普通管理员，拥有基础管理权限',
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    for (const role of roles) {
      await this.prisma.role.upsert({
        where: { id: role.id },
        update: role,
        create: role
      });
    }
  }
  
  /**
   * 创建基础会员等级数据
   */
  private async createBasicMemberLevels(): Promise<void> {
    const levels = [
      {
        id: 'level-bronze-001',
        name: '青铜会员',
        description: '新用户默认等级',
        growth_min: 0,
        growth_max: 999,
        privileges: { discount: 1.0, pointRate: 1.0 },
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'level-silver-001',
        name: '白银会员',
        description: '中级会员等级',
        growth_min: 1000,
        growth_max: 4999,
        privileges: { discount: 0.95, pointRate: 1.2 },
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'level-gold-001',
        name: '黄金会员',
        description: '高级会员等级',
        growth_min: 5000,
        growth_max: 19999,
        privileges: { discount: 0.9, pointRate: 1.5 },
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    for (const level of levels) {
      await this.prisma.memberLevel.upsert({
        where: { id: level.id },
        update: level,
        create: level
      });
    }
  }
  
  /**
   * 创建基础商品分类数据
   */
  private async createBasicProductCategories(): Promise<void> {
    const categories = [
      {
        id: 'cat-electronics-001',
        name: '数码电子',
        parent_id: null,
        level: 1,
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'cat-clothing-001',
        name: '服装鞋帽',
        parent_id: null,
        level: 1,
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'cat-home-001',
        name: '家居用品',
        parent_id: null,
        level: 1,
        sort: 3,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    for (const category of categories) {
      await this.prisma.productCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
  }
  
  /**
   * 执行数据库事务
   * @param callback 事务回调函数
   */
  async transaction<T>(
    callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
  
  /**
   * 检查数据库连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * 获取数据库状态信息
   */
  async getDatabaseInfo(): Promise<{
    tableCount: number;
    connectionStatus: boolean;
    version: string;
  }> {
    try {
      const [tables, version] = await Promise.all([
        this.prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = DATABASE()
        ` as Promise<[{ count: number }]>,
        this.prisma.$queryRaw`SELECT VERSION() as version` as Promise<[{ version: string }]>
      ]);
      
      return {
        tableCount: tables[0].count,
        connectionStatus: await this.checkConnection(),
        version: version[0].version
      };
    } catch (error) {
      console.error('获取数据库信息失败:', error);
      return {
        tableCount: 0,
        connectionStatus: false,
        version: 'unknown'
      };
    }
  }
}

// 导出单例实例
export const databaseHelper = DatabaseHelper.getInstance(); 