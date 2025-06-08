/**
 * Dashboard Service 测试数据固件
 * 提供仪表盘服务测试所需的模拟数据
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { jest } from '@jest/globals';

// 模拟统计数据
export const mockDashboardStats = {
  normal: {
    userCount: 25,
    orderCount: 1250,
    productCount: 168,
    todayVisits: 445
  },
  
  empty: {
    userCount: 0,
    orderCount: 0,
    productCount: 0,
    todayVisits: 0
  },
  
  large: {
    userCount: 999,
    orderCount: 50000,
    productCount: 5000,
    todayVisits: 8888
  }
};

// 模拟系统信息
export const mockSystemInfo = {
  current: {
    version: '1.0.0',
    uptime: '2天 15小时 30分钟',
    lastBackupTime: '2024-01-15T08:30:00Z',
    databaseSize: '12.5MB'
  },
  
  newSystem: {
    version: '1.0.0', 
    uptime: '0天 0小时 5分钟',
    lastBackupTime: '2024-01-15T10:00:00Z',
    databaseSize: '1.2MB'
  },
  
  error: {
    version: '1.0.0',
    uptime: '未知',
    lastBackupTime: '未知',
    databaseSize: '未知'
  }
};

// 模拟最近活动记录
export const mockRecentActivities = [
  {
    id: 'activity-001',
    type: 'login',
    description: '管理员登录系统',
    time: new Date('2024-01-15T10:30:00Z'),
    user: 'admin'
  },
  {
    id: 'activity-002',
    type: 'create',
    description: '创建新商品：精品苹果',
    time: new Date('2024-01-15T10:25:00Z'),
    user: 'product_manager'
  },
  {
    id: 'activity-003',
    type: 'update',
    description: '更新用户信息',
    time: new Date('2024-01-15T10:20:00Z'),
    user: 'user_manager'
  },
  {
    id: 'activity-004',
    type: 'delete',
    description: '删除过期订单',
    time: new Date('2024-01-15T10:15:00Z'),
    user: 'order_manager'
  },
  {
    id: 'activity-005',
    type: 'login',
    description: '用户登录系统',
    time: new Date('2024-01-15T10:10:00Z'),
    user: 'customer_service'
  }
];

// 模拟数据库查询结果
export const mockDatabaseResponses = {
  adminUserCount: {
    normal: 25,
    empty: 0,
    large: 999
  },
  
  productCount: {
    normal: 168,
    empty: 0,
    large: 5000
  },
  
  orderCount: {
    normal: 1250,
    empty: 0,
    large: 50000
  }
};

// 运行时间格式化测试数据
export const uptimeTestData = [
  {
    seconds: 300,      // 5分钟
    expected: '0天 0小时 5分钟'
  },
  {
    seconds: 3661,     // 1小时1分1秒
    expected: '0天 1小时 1分钟'
  },
  {
    seconds: 90061,    // 1天1小时1分1秒
    expected: '1天 1小时 1分钟'
  },
  {
    seconds: 259261,   // 3天1小时1分1秒
    expected: '3天 1小时 1分钟'
  },
  {
    seconds: 0,        // 0秒
    expected: '0天 0小时 0分钟'
  },
  {
    seconds: 86400,    // 1天
    expected: '1天 0小时 0分钟'
  }
];

// 错误场景测试数据
export const errorScenarios = {
  databaseConnection: {
    error: new Error('Database connection failed'),
    expectedStats: {
      userCount: 0,
      orderCount: 0,
      productCount: 0,
      todayVisits: 0
    }
  },
  
  queryTimeout: {
    error: new Error('Query timeout'),
    expectedSystemInfo: {
      version: '1.0.0',
      uptime: '未知',
      lastBackupTime: '未知',
      databaseSize: '未知'
    }
  }
};

// 活动类型验证数据
export const activityTypes = {
  valid: ['login', 'create', 'update', 'delete', 'export', 'import'],
  invalid: ['', 'unknown', 'test', 123, null, undefined]
};

// 统计数据验证规则
export const statsValidationRules = {
  userCount: {
    min: 0,
    max: 999999,
    type: 'number'
  },
  orderCount: {
    min: 0,
    max: 999999999,
    type: 'number'
  },
  productCount: {
    min: 0,
    max: 999999,
    type: 'number'
  },
  todayVisits: {
    min: 0,
    max: 999999,
    type: 'number'
  }
};

// 系统信息验证规则
export const systemInfoValidationRules = {
  version: {
    pattern: /^\d+\.\d+\.\d+$/,  // 版本号格式：x.y.z
    required: true
  },
  uptime: {
    pattern: /^\d+天 \d+小时 \d+分钟$/,  // 运行时间格式
    required: true
  },
  lastBackupTime: {
    type: 'string',
    required: true
  },
  databaseSize: {
    pattern: /^\d+(\.\d+)?(KB|MB|GB|TB)$/,  // 大小格式
    required: true
  }
};

// Mock Prisma响应工厂
export const createMockPrismaResponse = (scenario: 'normal' | 'empty' | 'large' | 'error') => {
  if (scenario === 'error') {
    return {
      adminUser: {
        count: jest.fn<() => Promise<number>>().mockRejectedValue(new Error('Database error'))
      }
    };
  }
  
  const data = mockDatabaseResponses;
  return {
    adminUser: {
      count: jest.fn<() => Promise<number>>().mockResolvedValue(data.adminUserCount[scenario])
    }
  };
};

// 业务场景测试数据
export const businessScenarios = {
  newSystem: {
    description: '新系统初始状态',
    stats: mockDashboardStats.empty,
    systemInfo: mockSystemInfo.newSystem,
    activities: []
  },
  
  normalOperation: {
    description: '正常运营状态',
    stats: mockDashboardStats.normal,
    systemInfo: mockSystemInfo.current,
    activities: mockRecentActivities
  },
  
  highTraffic: {
    description: '高流量状态',
    stats: mockDashboardStats.large,
    systemInfo: mockSystemInfo.current,
    activities: mockRecentActivities
  }
}; 