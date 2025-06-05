/**
 * Jest配置文件 (简化版)
 * @author 刘白 & AI Assistant
 */

export default {
  // 测试环境
  testEnvironment: 'node',
  
  // TypeScript支持
  preset: 'ts-jest/presets/default-esm',
  
  // 模块解析
  extensionsToTreatAsEsm: ['.ts'],
  
  // 测试文件模式
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts'
  ],
  
  // 源码目录
  rootDir: '.',
  
  // TypeScript配置
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }]
  },
  
  // 覆盖率配置
  collectCoverage: false,
  
  // 设置超时
  testTimeout: 30000,
  
  // 测试前后钩子
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // 清除模拟
  clearMocks: true,
  restoreMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 忽略的文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ]
}; 