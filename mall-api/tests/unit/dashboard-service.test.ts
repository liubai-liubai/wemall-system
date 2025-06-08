/**
 * 仪表盘服务单元测试
 * 测试仪表盘相关的核心业务逻辑，包括统计数据、系统信息、活动记录等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { DashboardService } from '../../src/services/dashboard-service';
import {
  mockDashboardStats,
  mockSystemInfo,
  mockRecentActivities,
  uptimeTestData,
  errorScenarios,
  activityTypes,
  statsValidationRules,
  systemInfoValidationRules,
  businessScenarios,
  createMockPrismaResponse
} from '../fixtures/dashboard-fixtures';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('DashboardService 仪表盘服务测试', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    dashboardService = new DashboardService();
  });

  // ==================== 统计数据验证测试 ====================
  describe('统计数据验证测试', () => {
    test('应该验证统计数据结构完整性', () => {
      const stats = mockDashboardStats.normal;
      expect(stats).toHaveProperty('userCount');
      expect(stats).toHaveProperty('orderCount');
      expect(stats).toHaveProperty('productCount');
      expect(stats).toHaveProperty('todayVisits');
      
      expect(typeof stats.userCount).toBe('number');
      expect(typeof stats.orderCount).toBe('number');
      expect(typeof stats.productCount).toBe('number');
      expect(typeof stats.todayVisits).toBe('number');
    });

    test('应该验证统计数据数值范围', () => {
      const testStats = [
        mockDashboardStats.normal,
        mockDashboardStats.empty,
        mockDashboardStats.large
      ];

      testStats.forEach(stats => {
        Object.entries(stats).forEach(([key, value]) => {
          const rule = statsValidationRules[key as keyof typeof statsValidationRules];
          expect(value).toBeGreaterThanOrEqual(rule.min);
          expect(value).toBeLessThanOrEqual(rule.max);
          expect(typeof value).toBe(rule.type);
        });
      });
    });

    test('应该验证空数据状态', () => {
      const emptyStats = mockDashboardStats.empty;
      expect(emptyStats.userCount).toBe(0);
      expect(emptyStats.orderCount).toBe(0);
      expect(emptyStats.productCount).toBe(0);
      expect(emptyStats.todayVisits).toBe(0);
    });

    test('应该验证大数据状态', () => {
      const largeStats = mockDashboardStats.large;
      expect(largeStats.userCount).toBeGreaterThan(100);
      expect(largeStats.orderCount).toBeGreaterThan(10000);
      expect(largeStats.productCount).toBeGreaterThan(1000);
      expect(largeStats.todayVisits).toBeGreaterThan(1000);
    });
  });

  // ==================== 统计数据获取功能测试 ====================
  describe('统计数据获取功能测试', () => {
    test('应该成功获取仪表盘统计数据', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(25);

      const result = await dashboardService.getStats();

      expect(mockPrisma.adminUser.count).toHaveBeenCalledWith({
        where: { status: 1 }
      });
      expect(result).toHaveProperty('userCount');
      expect(result).toHaveProperty('orderCount');
      expect(result).toHaveProperty('productCount');
      expect(result).toHaveProperty('todayVisits');
      expect(result.userCount).toBe(25);
      expect(result.orderCount).toBe(0); // 暂时固定值
      expect(result.productCount).toBe(0); // 暂时固定值
      expect(typeof result.todayVisits).toBe('number');
    });

    test('应该处理数据库查询错误', async () => {
      mockPrisma.adminUser.count.mockRejectedValue(new Error('Database error'));

      const result = await dashboardService.getStats();

      expect(result).toEqual({
        userCount: 0,
        orderCount: 0,
        productCount: 0,
        todayVisits: 0
      });
    });

    test('应该生成随机的今日访问量', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(10);

      const results = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getStats(),
        dashboardService.getStats()
      ]);

      // 访问量应该在合理范围内
      results.forEach(result => {
        expect(result.todayVisits).toBeGreaterThanOrEqual(100);
        expect(result.todayVisits).toBeLessThanOrEqual(1100);
      });
    });

    test('应该处理用户数为0的情况', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(0);

      const result = await dashboardService.getStats();

      expect(result.userCount).toBe(0);
      expect(typeof result.todayVisits).toBe('number');
    });
  });

  // ==================== 系统信息验证测试 ====================
  describe('系统信息验证测试', () => {
    test('应该验证系统信息数据结构', () => {
      const systemInfo = mockSystemInfo.current;
      expect(systemInfo).toHaveProperty('version');
      expect(systemInfo).toHaveProperty('uptime');
      expect(systemInfo).toHaveProperty('lastBackupTime');
      expect(systemInfo).toHaveProperty('databaseSize');
      
      expect(typeof systemInfo.version).toBe('string');
      expect(typeof systemInfo.uptime).toBe('string');
      expect(typeof systemInfo.lastBackupTime).toBe('string');
      expect(typeof systemInfo.databaseSize).toBe('string');
    });

    test('应该验证版本号格式', () => {
      const versions = ['1.0.0', '2.1.3', '10.15.8'];
      const invalidVersions = ['v1.0.0', '1.0', '1.0.0-beta', ''];

      versions.forEach(version => {
        expect(version).toMatch(systemInfoValidationRules.version.pattern);
      });

      invalidVersions.forEach(version => {
        expect(version).not.toMatch(systemInfoValidationRules.version.pattern);
      });
    });

    test('应该验证运行时间格式', () => {
      const uptimes = ['0天 0小时 5分钟', '1天 12小时 30分钟', '365天 23小时 59分钟'];
      const invalidUptimes = ['5分钟', '1天', '12小时', '1 day 2 hours'];

      uptimes.forEach(uptime => {
        expect(uptime).toMatch(systemInfoValidationRules.uptime.pattern);
      });

      invalidUptimes.forEach(uptime => {
        expect(uptime).not.toMatch(systemInfoValidationRules.uptime.pattern);
      });
    });

    test('应该验证数据库大小格式', () => {
      const sizes = ['12.5MB', '1GB', '500KB', '2.3TB', '1024KB'];
      const invalidSizes = ['12MB（约）', '1 GB', '500', 'large', ''];

      sizes.forEach(size => {
        expect(size).toMatch(systemInfoValidationRules.databaseSize.pattern);
      });

      invalidSizes.forEach(size => {
        expect(size).not.toMatch(systemInfoValidationRules.databaseSize.pattern);
      });
    });
  });

  // ==================== 系统信息获取功能测试 ====================
  describe('系统信息获取功能测试', () => {
    test('应该成功获取系统信息', async () => {
      const result = await dashboardService.getSystemInfo();

      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('lastBackupTime');
      expect(result).toHaveProperty('databaseSize');
      expect(result.version).toBe('1.0.0');
      expect(result.uptime).toMatch(systemInfoValidationRules.uptime.pattern);
      expect(typeof result.lastBackupTime).toBe('string');
      expect(result.databaseSize).toMatch(systemInfoValidationRules.databaseSize.pattern);
    });

    test('应该处理系统信息获取错误', async () => {
      // Mock console.error to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
             // 模拟process.uptime抛出错误（通过mock一个会抛错的方法）
       const originalUptime = process.uptime;
       process.uptime = jest.fn<() => number>().mockImplementation(() => {
         throw new Error('System error');
       }) as any;

      const result = await dashboardService.getSystemInfo();

      expect(result).toEqual(errorScenarios.queryTimeout.expectedSystemInfo);
      
      // 恢复原始方法
      process.uptime = originalUptime;
      consoleSpy.mockRestore();
    });

    test('应该正确格式化运行时间', async () => {
      const originalUptime = process.uptime;
      
             for (const testCase of uptimeTestData) {
         process.uptime = jest.fn<() => number>().mockReturnValue(testCase.seconds) as any;
         
         const result = await dashboardService.getSystemInfo();
         expect(result.uptime).toBe(testCase.expected);
       }
      
      // 恢复原始方法
      process.uptime = originalUptime;
    });
  });

  // ==================== 最近活动记录测试 ====================
  describe('最近活动记录测试', () => {
    test('应该验证活动记录数据结构', () => {
      mockRecentActivities.forEach(activity => {
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('description');
        expect(activity).toHaveProperty('time');
        expect(activity).toHaveProperty('user');
        
        expect(typeof activity.id).toBe('string');
        expect(typeof activity.type).toBe('string');
        expect(typeof activity.description).toBe('string');
        expect(activity.time).toBeInstanceOf(Date);
        expect(typeof activity.user).toBe('string');
      });
    });

    test('应该验证活动类型值', () => {
      activityTypes.valid.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });

      activityTypes.invalid.forEach(type => {
        expect(
          type === '' || 
          typeof type !== 'string' || 
          type === null || 
          type === undefined
        ).toBe(true);
      });
    });

    test('应该成功获取最近活动记录', async () => {
      const result = await dashboardService.getRecentActivities();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(activity => {
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('description');
        expect(activity).toHaveProperty('time');
        expect(activity).toHaveProperty('user');
        expect(activityTypes.valid).toContain(activity.type);
      });
    });

    test('应该按时间倒序排列活动记录', async () => {
      const result = await dashboardService.getRecentActivities();

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].time.getTime()).toBeGreaterThanOrEqual(
          result[i + 1].time.getTime()
        );
      }
    });

    test('应该限制活动记录数量', async () => {
      const result = await dashboardService.getRecentActivities();

      expect(result.length).toBeLessThanOrEqual(10); // 假设最多返回10条记录
    });
  });

  // ==================== 业务场景综合测试 ====================
  describe('业务场景综合测试', () => {
    test('应该处理新系统初始状态', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(0);

      const [stats, systemInfo, activities] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getSystemInfo(),
        dashboardService.getRecentActivities()
      ]);

      expect(stats.userCount).toBe(0);
      expect(systemInfo.version).toBe('1.0.0');
      expect(Array.isArray(activities)).toBe(true);
    });

    test('应该处理正常运营状态', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(25);

      const [stats, systemInfo, activities] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getSystemInfo(),
        dashboardService.getRecentActivities()
      ]);

      expect(stats.userCount).toBeGreaterThan(0);
      expect(systemInfo.version).toBe('1.0.0');
      expect(activities.length).toBeGreaterThan(0);
    });

    test('应该处理高流量状态', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(999);

      const stats = await dashboardService.getStats();

      expect(stats.userCount).toBe(999);
      expect(stats.todayVisits).toBeGreaterThan(100);
    });
  });

  // ==================== 错误场景处理测试 ====================
  describe('错误场景处理测试', () => {
    test('应该处理数据库连接错误', async () => {
      mockPrisma.adminUser.count.mockRejectedValue(
        errorScenarios.databaseConnection.error
      );

      const result = await dashboardService.getStats();

      expect(result).toEqual(errorScenarios.databaseConnection.expectedStats);
    });

    test('应该处理并发请求', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(50);

      const promises = Array(5).fill(null).map(() => dashboardService.getStats());
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.userCount).toBe(50);
        expect(typeof result.todayVisits).toBe('number');
      });
    });

    test('应该确保错误不会中断服务', async () => {
      // 第一次调用失败
      mockPrisma.adminUser.count.mockRejectedValueOnce(new Error('Connection lost'));
      const result1 = await dashboardService.getStats();
      expect(result1.userCount).toBe(0);

      // 第二次调用成功
      mockPrisma.adminUser.count.mockResolvedValueOnce(10);
      const result2 = await dashboardService.getStats();
      expect(result2.userCount).toBe(10);
    });
  });

  // ==================== 性能和稳定性测试 ====================
  describe('性能和稳定性测试', () => {
    test('应该在合理时间内返回统计数据', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(100);

      const start = Date.now();
      const result = await dashboardService.getStats();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // 5秒内完成
      expect(result).toBeDefined();
    });

    test('应该处理大量并发请求', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(200);

      const concurrentRequests = 10;
      const promises = Array(concurrentRequests).fill(null).map(() => 
        dashboardService.getStats()
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(concurrentRequests);
      results.forEach(result => {
        expect(result.userCount).toBe(200);
      });
    });

    test('应该保持数据一致性', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(75);

      const results = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getStats(),
        dashboardService.getStats()
      ]);

      results.forEach(result => {
        expect(result.userCount).toBe(75);
        expect(result.orderCount).toBe(0);
        expect(result.productCount).toBe(0);
      });
    });
  });
}); 