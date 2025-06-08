/**
 * 认证辅助工具
 * 提供集成测试中的认证相关功能，包括Token生成、用户模拟登录等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { databaseHelper } from './database-helper';

/**
 * 用户类型枚举
 */
export enum UserType {
  ADMIN = 'admin',
  MEMBER = 'member'
}

/**
 * JWT Token载荷接口
 */
export interface ITokenPayload {
  sub: string;          // 用户ID
  type: UserType;       // 用户类型
  permissions?: string[]; // 权限列表
  iat?: number;         // 签发时间
  exp?: number;         // 过期时间
}

/**
 * 模拟用户数据接口
 */
export interface IMockUser {
  id: string;
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: number;
  type: UserType;
  permissions?: string[];
  roles?: string[];
}

/**
 * 微信用户数据接口
 */
export interface IWechatUser {
  openid: string;
  nickname?: string;
  avatar?: string;
  gender?: number;
  city?: string;
  province?: string;
  country?: string;
}

/**
 * 认证辅助类
 * 提供测试环境下的认证相关功能
 */
export class AuthHelper {
  private static instance: AuthHelper | null = null;
  
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  static getInstance(): AuthHelper {
    if (!AuthHelper.instance) {
      AuthHelper.instance = new AuthHelper();
    }
    return AuthHelper.instance;
  }
  
  /**
   * 生成JWT Token
   * @param payload Token载荷
   * @param expiresIn 过期时间
   */
  generateToken(
    payload: ITokenPayload,
    expiresIn: string = '1h'
  ): string {
    const secret = process.env.JWT_SECRET || 'integration-test-jwt-secret';
    
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(tokenPayload, secret, { expiresIn } as any);
  }
  
  /**
   * 验证JWT Token
   * @param token JWT Token
   */
  verifyToken(token: string): ITokenPayload | null {
    try {
      const secret = process.env.JWT_SECRET || 'integration-test-jwt-secret';
      return jwt.verify(token, secret) as ITokenPayload;
    } catch {
      return null;
    }
  }
  
  /**
   * 生成刷新Token
   * @param userId 用户ID
   * @param userType 用户类型
   */
  generateRefreshToken(userId: string, userType: UserType): string {
    const payload = {
      sub: userId,
      type: userType,
      refresh: true
    };
    
    return this.generateToken(payload, '7d');
  }
  
  /**
   * 创建测试管理员用户
   * @param userData 用户数据
   */
  async createMockAdminUser(userData: Partial<IMockUser> = {}): Promise<IMockUser> {
    const userId = userData.id || uuidv4();
    const prisma = databaseHelper.getPrismaClient();
    
    const adminUserData = {
      id: userId,
      username: userData.username || `test_admin_${Date.now()}`,
      nickname: userData.nickname || '测试管理员',
      email: userData.email || `test.admin.${Date.now()}@example.com`,
      phone: userData.phone || `1380000${String(Date.now()).slice(-4)}`,
      avatar: userData.avatar || 'https://via.placeholder.com/100x100',
      password: 'test_password_hash', // 实际应该是哈希值
      status: userData.status ?? 1,
      department_id: 'dept-default-001',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // 创建管理员用户
    await prisma.adminUser.create({
      data: adminUserData
    });
    
    // 分配默认角色
    if (userData.roles?.length) {
      for (const roleId of userData.roles) {
                 await prisma.adminUserRole.create({
           data: {
             id: uuidv4(),
             user_id: userId,
             role_id: roleId,
             created_at: new Date()
           }
         });
      }
    }
    
    return {
      id: userId,
      username: adminUserData.username,
      nickname: adminUserData.nickname,
      email: adminUserData.email,
      phone: adminUserData.phone,
      avatar: adminUserData.avatar,
      status: adminUserData.status,
      type: UserType.ADMIN,
      permissions: userData.permissions || [],
      roles: userData.roles || []
    };
  }
  
  /**
   * 创建测试普通用户
   * @param userData 用户数据
   */
  async createMockUser(userData: Partial<IMockUser> = {}): Promise<IMockUser> {
    const userId = userData.id || uuidv4();
    const prisma = databaseHelper.getPrismaClient();
    
         const userCreateData = {
       id: userId,
       nickname: userData.nickname || `测试用户${Date.now()}`,
       avatar: userData.avatar || 'https://via.placeholder.com/100x100',
       phone: userData.phone || `1390000${String(Date.now()).slice(-4)}`,
       email: userData.email || `test.user.${Date.now()}@example.com`,
       open_id: `test_openid_${Date.now()}`,
       union_id: `test_unionid_${Date.now()}`,
       status: userData.status ?? 1,
       created_at: new Date(),
       updated_at: new Date()
     };
    
    // 创建普通用户
    await prisma.user.create({
      data: userCreateData
    });
    
    // 创建会员信息
    await prisma.userMember.create({
      data: {
        id: uuidv4(),
        user_id: userId,
        level_id: 'level-bronze-001', // 默认青铜会员
        growth: 0,
        points: 0,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    return {
      id: userId,
      nickname: userCreateData.nickname,
      email: userCreateData.email,
      phone: userCreateData.phone,
      avatar: userCreateData.avatar,
      status: userCreateData.status,
      type: UserType.MEMBER,
      permissions: userData.permissions || []
    };
  }
  
  /**
   * 模拟微信登录
   * @param wechatData 微信用户数据
   */
  async mockWechatLogin(wechatData: Partial<IWechatUser> = {}): Promise<{
    user: IMockUser;
    code: string;
    token: string;
    refreshToken: string;
  }> {
    const openid = wechatData.openid || `test_openid_${Date.now()}`;
    const code = `test_code_${Date.now()}`;
    
    // 创建或查找用户
    let user = await this.findUserByOpenid(openid);
    
    if (!user) {
      user = await this.createMockUser({
        nickname: wechatData.nickname || '微信用户',
        avatar: wechatData.avatar || 'https://via.placeholder.com/100x100'
      });
      
             // 更新openid
       const prisma = databaseHelper.getPrismaClient();
       await prisma.user.update({
         where: { id: user.id },
         data: { open_id: openid }
       });
    }
    
    // 生成Token
    const tokenPayload: ITokenPayload = {
      sub: user.id,
      type: UserType.MEMBER,
      permissions: user.permissions || []
    };
    
    const token = this.generateToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(user.id, UserType.MEMBER);
    
    return {
      user,
      code,
      token,
      refreshToken
    };
  }
  
  /**
   * 模拟管理员登录
   * @param loginData 登录数据
   */
  async mockAdminLogin(loginData: {
    username?: string;
    permissions?: string[];
    roles?: string[];
  } = {}): Promise<{
    user: IMockUser;
    token: string;
    refreshToken: string;
  }> {
    // 创建管理员用户
    const user = await this.createMockAdminUser({
      username: loginData.username || `test_admin_${Date.now()}`,
      permissions: loginData.permissions || ['system:manage'],
      roles: loginData.roles || ['role-admin-001']
    });
    
    // 生成Token
    const tokenPayload: ITokenPayload = {
      sub: user.id,
      type: UserType.ADMIN,
      permissions: user.permissions || []
    };
    
    const token = this.generateToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(user.id, UserType.ADMIN);
    
    return {
      user,
      token,
      refreshToken
    };
  }
  
  /**
   * 根据openid查找用户
   */
  private async findUserByOpenid(openid: string): Promise<IMockUser | null> {
    const prisma = databaseHelper.getPrismaClient();
    
         try {
       const user = await prisma.user.findFirst({
         where: { open_id: openid }
       });
      
      if (!user) return null;
      
      return {
        id: user.id,
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        status: user.status,
        type: UserType.MEMBER
      };
    } catch {
      return null;
    }
  }
  
  /**
   * 获取用户权限列表
   * @param userId 用户ID
   * @param userType 用户类型
   */
  async getUserPermissions(userId: string, userType: UserType): Promise<string[]> {
    if (userType === UserType.MEMBER) {
      // 普通用户基础权限
      return ['user:profile', 'user:address', 'user:order'];
    }
    
    // 管理员权限查询
    const prisma = databaseHelper.getPrismaClient();
    
    try {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: userId },
        include: {
          admin_user_roles: {
            include: {
              role: {
                include: {
                  role_permissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      if (!adminUser) return [];
      
      const permissions = new Set<string>();
      
      for (const userRole of adminUser.admin_user_roles) {
        for (const rolePermission of userRole.role.role_permissions) {
          permissions.add(rolePermission.permission.code);
        }
      }
      
      return Array.from(permissions);
    } catch {
      return [];
    }
  }
  
  /**
   * 清理测试用户数据
   * @param userIds 用户ID列表
   */
  async cleanupTestUsers(userIds: string[] = []): Promise<void> {
    const prisma = databaseHelper.getPrismaClient();
    
    try {
      if (userIds.length === 0) {
        // 清理所有测试用户（通过用户名前缀识别）
        await prisma.adminUser.deleteMany({
          where: {
            username: {
              startsWith: 'test_admin_'
            }
          }
        });
        
                 await prisma.user.deleteMany({
           where: {
             open_id: {
               startsWith: 'test_openid_'
             }
           }
         });
      } else {
        // 清理指定用户
        for (const userId of userIds) {
          await prisma.adminUser.deleteMany({
            where: { id: userId }
          });
          
          await prisma.user.deleteMany({
            where: { id: userId }
          });
        }
      }
      
      console.log('✅ 测试用户数据清理完成');
    } catch (error) {
      console.error('❌ 测试用户数据清理失败:', error);
    }
  }
  
  /**
   * 生成测试Authorization头部
   * @param user 用户数据
   */
  generateAuthHeader(user: IMockUser): string {
    const tokenPayload: ITokenPayload = {
      sub: user.id,
      type: user.type,
      permissions: user.permissions || []
    };
    
    const token = this.generateToken(tokenPayload);
    return `Bearer ${token}`;
  }
  
  /**
   * 验证权限
   * @param userPermissions 用户权限列表
   * @param requiredPermission 所需权限
   */
  hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    return userPermissions.includes(requiredPermission) || 
           userPermissions.includes('*'); // 超级权限
  }
  
  /**
   * 验证角色
   * @param userRoles 用户角色列表
   * @param requiredRole 所需角色
   */
  hasRole(userRoles: string[], requiredRole: string): boolean {
    return userRoles.includes(requiredRole) || 
           userRoles.includes('super_admin'); // 超级管理员
  }
}

// 导出单例实例
export const authHelper = AuthHelper.getInstance(); 