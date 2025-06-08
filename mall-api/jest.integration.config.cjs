/**
 * Jest集成测试配置
 * 专门用于API集成测试的Jest配置
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 根目录
  rootDir: '.',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.ts',
    '<rootDir>/tests/integration/**/*.test.js'
  ],
  
  // 忽略的测试文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/unit/'
  ],
  
  // TypeScript转换
  preset: 'ts-jest',
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // 转换规则
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // 覆盖率配置
  collectCoverage: false, // 集成测试通常不需要覆盖率
  
  // 测试超时时间（集成测试需要更长时间）
  testTimeout: 60000,
  
  // 环境变量设置
  setupFilesAfterEnv: [
    '<rootDir>/tests/integration/setup.ts'
  ],
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // 详细输出
  verbose: true,
  
  // 显示测试覆盖率阈值
  silent: false,
  
  // 最大并发数（集成测试建议串行）
  maxConcurrency: 1,
  
  // 测试前后的钩子文件
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // 报告器配置
  reporters: ['default'],
  
  // 清理模拟
  clearMocks: true,
  restoreMocks: true,
  
  // 错误处理
  errorOnDeprecated: true,
  
  // 模块清理
  resetModules: false,
  
  // 监听模式配置
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/tests/reports/'
  ],
  
  // 显示堆栈跟踪
  noStackTrace: false,
  
  // 检测打开的句柄
  detectOpenHandles: true,
  
  // 检测异步操作
  detectLeaks: false,
  
  // 强制退出
  forceExit: true
}; 