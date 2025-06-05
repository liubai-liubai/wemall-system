/**
 * Jest测试环境设置
 * @author 刘白 & AI Assistant
 */

import { jest } from '@jest/globals';

// 全局测试超时设置
jest.setTimeout(30000);

// 环境变量设置
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '24h';

// 数据库URL（测试环境）
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'mysql://test:test@localhost:3306/mall_test';

// Redis配置（测试环境）
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';
process.env.REDIS_DB = '1'; // 使用不同的数据库索引

// 微信小程序配置（测试环境）
process.env.WECHAT_APP_ID = 'test_app_id';
process.env.WECHAT_APP_SECRET = 'test_app_secret';

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// 控制台日志在测试期间的处理
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // 在测试期间静默某些日志，除非需要调试
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // 恢复原始的console方法
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// 全局测试钩子
beforeEach(() => {
  // 清理所有模拟
  jest.clearAllMocks();
});

afterEach(() => {
  // 每个测试后的清理工作
  jest.restoreAllMocks();
}); 