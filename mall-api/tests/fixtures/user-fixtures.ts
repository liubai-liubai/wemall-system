/**
 * 用户相关测试数据fixtures
 * @author 刘白 & AI Assistant
 */

import { UserStatus } from '../../src/types/user.js';

export const mockUsers = {
  /**
   * 模拟活跃用户
   */
  activeUser: {
    id: 'user_001',
    open_id: 'wx_test_openid_001',
    union_id: 'wx_test_unionid_001',
    session_key: 'test_session_key_001',
    nickname: '测试用户1',
    avatar: 'https://test.example.com/avatar1.jpg',
    gender: 1,
    country: '中国',
    province: '广东省',
    city: '深圳市',
    language: 'zh_CN',
    status: UserStatus.ACTIVE,
    last_login: new Date('2024-01-15T10:00:00Z'),
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-15T10:00:00Z')
  },

  /**
   * 模拟新用户（用于创建测试）
   */
  newUser: {
    open_id: 'wx_test_openid_new',
    session_key: 'test_session_key_new',
    status: UserStatus.ACTIVE,
    last_login: new Date()
  },

  /**
   * 模拟禁用用户
   */
  disabledUser: {
    id: 'user_002',
    open_id: 'wx_test_openid_002',
    union_id: 'wx_test_unionid_002',
    session_key: 'test_session_key_002',
    nickname: '测试用户2',
    status: UserStatus.DISABLED,
    last_login: new Date('2024-01-10T10:00:00Z'),
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-10T10:00:00Z')
  }
};

export const mockWechatData = {
  /**
   * 模拟微信登录响应
   */
  loginResponse: {
    openId: 'wx_test_openid_001',
    sessionKey: 'test_session_key_001',
    unionId: 'wx_test_unionid_001'
  },

  /**
   * 模拟微信登录请求
   */
  loginRequest: {
    code: 'test_wx_code_001',
    encryptedData: 'test_encrypted_data',
    iv: 'test_iv'
  }
};

export const mockTokens = {
  /**
   * 模拟有效的访问令牌
   */
  validAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.access.token',

  /**
   * 模拟有效的刷新令牌
   */
  validRefreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.refresh.token',

  /**
   * 模拟过期的访问令牌
   */
  expiredAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.access.token',

  /**
   * 模拟无效的令牌
   */
  invalidToken: 'invalid.token.format'
};

export const mockRefreshTokens = {
  /**
   * 模拟数据库中的刷新令牌记录
   */
  validRefreshToken: {
    id: 'refresh_token_001',
    user_id: 'user_001',
    token_hash: 'hashed_refresh_token_001',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
    created_at: new Date(),
    updated_at: new Date(),
    user: mockUsers.activeUser
  },

  /**
   * 模拟过期的刷新令牌
   */
  expiredRefreshToken: {
    id: 'refresh_token_002',
    user_id: 'user_001',
    token_hash: 'hashed_refresh_token_002',
    expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前过期
    created_at: new Date(),
    updated_at: new Date(),
    user: mockUsers.activeUser
  }
}; 