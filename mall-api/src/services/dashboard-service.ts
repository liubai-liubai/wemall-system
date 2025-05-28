/**
 * 仪表盘服务
 * 提供系统统计数据、系统信息和活动记录等相关功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 仪表盘统计数据接口
 * @interface DashboardStats
 */
export interface DashboardStats {
  /** 用户总数 */
  userCount: number;
  /** 订单总数 */  
  orderCount: number;
  /** 商品总数 */
  productCount: number;
  /** 今日访问量 */
  todayVisits: number;
}

/**
 * 系统信息接口
 * @interface SystemInfo
 */
export interface SystemInfo {
  /** 系统版本号 */
  version: string;
  /** 系统运行时间 */
  uptime: string;
  /** 最后备份时间 */
  lastBackupTime: string;
  /** 数据库大小 */
  databaseSize: string;
}

/**
 * 最近活动记录接口
 * @interface RecentActivity
 */
export interface RecentActivity {
  /** 活动唯一标识 */
  id: string;
  /** 活动类型 (login, create, update, delete) */
  type: string;
  /** 活动描述 */
  description: string;
  /** 活动时间 */
  time: Date;
  /** 操作用户 */
  user: string;
}

/**
 * 仪表盘业务服务类
 * 负责处理仪表盘相关的业务逻辑，包括统计数据计算、系统信息获取等
 * 
 * @class DashboardService
 * @example
 * ```typescript
 * const dashboardService = new DashboardService();
 * const stats = await dashboardService.getStats();
 * ```
 */
export class DashboardService {
  /**
   * 获取仪表盘统计数据
   * 
   * 统计当前系统中的关键指标数据，包括：
   * - 启用状态的管理员用户数量
   * - 商品总数（待实现商品模块后更新）
   * - 订单总数（待实现订单模块后更新）
   * - 今日访问量（目前为模拟数据）
   * 
   * @returns {Promise<DashboardStats>} 包含各项统计数据的对象
   * @throws {Error} 当数据库查询失败时抛出错误
   * 
   * @example
   * ```typescript
   * const stats = await dashboardService.getStats();
   * console.log(`用户总数: ${stats.userCount}`);
   * ```
   */
  async getStats(): Promise<DashboardStats> {
    try {
      // 并行获取统计数据，提高查询效率
      const [userCount, productCount, orderCount] = await Promise.all([
        // 管理员用户数量（只统计启用状态的用户）
        prisma.adminUser.count({
          where: {
            status: 1
          }
        }),
        // 商品数量（暂时返回0，等待商品表创建后实现）
        Promise.resolve(0),
        // 订单数量（暂时返回0，等待订单表创建后实现）
        Promise.resolve(0)
      ]);

      // 今日访问量（模拟数据，实际应该从访问日志表或缓存中获取）
      const todayVisits = Math.floor(Math.random() * 1000) + 100;

      return {
        userCount,
        orderCount,
        productCount,
        todayVisits
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 返回默认值而不是抛出错误，确保仪表盘能正常显示
      return {
        userCount: 0,
        orderCount: 0,
        productCount: 0,
        todayVisits: 0
      };
    }
  }

  /**
   * 获取系统信息
   * 
   * 收集并返回系统的基本运行信息，包括：
   * - 系统版本号
   * - 系统运行时间
   * - 最后备份时间
   * - 数据库大小
   * 
   * @returns {Promise<SystemInfo>} 包含系统基本信息的对象
   * @throws {Error} 当获取系统信息失败时抛出错误
   * 
   * @example
   * ```typescript
   * const systemInfo = await dashboardService.getSystemInfo();
   * console.log(`系统版本: ${systemInfo.version}`);
   * ```
   */
  async getSystemInfo(): Promise<SystemInfo> {
    try {
      // 计算系统运行时间（基于Node.js进程运行时间）
      const uptime = this.formatUptime(process.uptime());
      
      // 获取当前时间作为最后备份时间（模拟数据，实际应该从系统配置表获取）
      const lastBackupTime = new Date().toISOString();
      
      // 数据库大小（模拟数据，实际应该通过数据库查询获取）
      const databaseSize = '12.5MB';

      return {
        version: '1.0.0',
        uptime,
        lastBackupTime,
        databaseSize
      };
    } catch (error) {
      console.error('获取系统信息失败:', error);
      return {
        version: '1.0.0',
        uptime: '未知',
        lastBackupTime: '未知',
        databaseSize: '未知'
      };
    }
  }

  /**
   * 获取最近活动记录
   * 
   * 获取系统最近的操作活动记录，用于在仪表盘展示系统动态。
   * 目前返回模拟数据，实际应该从操作日志表中查询。
   * 
   * @returns {Promise<RecentActivity[]>} 最近活动记录数组
   * @throws {Error} 当获取活动记录失败时抛出错误
   * 
   * @example
   * ```typescript
   * const activities = await dashboardService.getRecentActivities();
   * activities.forEach(activity => {
   *   console.log(`${activity.user} ${activity.description}`);
   * });
   * ```
   */
  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      // 模拟最近活动数据
      // TODO: 实际应该从操作日志表中查询最近的活动记录
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'login',
          description: '管理员登录系统',
          time: new Date(),
          user: 'admin'
        },
        {
          id: '2',
          type: 'create',
          description: '创建新角色',
          time: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
          user: 'admin'
        },
        {
          id: '3',
          type: 'update',
          description: '更新用户权限',
          time: new Date(Date.now() - 1000 * 60 * 60), // 1小时前
          user: 'admin'
        }
      ];

      return activities;
    } catch (error) {
      console.error('获取最近活动失败:', error);
      return [];
    }
  }

  /**
   * 格式化运行时间
   * 
   * 将秒数转换为人类可读的时间格式
   * 
   * @private
   * @param {number} uptime - 运行时间（秒）
   * @returns {string} 格式化后的时间字符串
   * 
   * @example
   * ```typescript
   * const formatted = this.formatUptime(3661); // "1小时1分钟"
   * ```
   */
  private formatUptime(uptime: number): string {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    if (days > 0) {
      return `${days}天${hours}小时${minutes}分钟`;
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  }
} 