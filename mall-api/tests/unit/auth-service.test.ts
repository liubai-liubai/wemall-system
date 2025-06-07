/**
 * 认证服务单元测试
 * 测试微信登录、令牌刷新、用户认证等核心功能
 * @author 刘白 & AI Assistant
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { UserStatus } from '../../src/types/user.js';

// 模拟Prisma客户端
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
};

// 模拟数据库配置
jest.mock('../../src/config/database.js', () => ({
  prisma: mockPrisma
}));

// 模拟logger
jest.mock('../../src/utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('AuthService', () => {
  let AuthService: any;
  let authService: any;

  beforeAll(async () => {
    // 动态导入服务
    const module = await import('../../src/services/auth-service.js');
    AuthService = module.AuthService;
  });

  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();

    // 创建服务实例
    authService = new AuthService();

    // 设置环境变量
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  describe('wechatLogin', () => {
    it('应该成功为新用户创建账户并返回登录信息', async () => {
      // 准备测试数据
      const loginData = {
        code: 'test_wx_code_001',
        encryptedData: 'test_encrypted_data',
        iv: 'test_iv'
      };

      const mockWechatResponse = {
        openId: 'wx_test_openid_001',
        sessionKey: 'test_session_key_001',
        unionId: 'wx_test_unionid_001'
      };

      const mockNewUser = {
        id: 'new_user_id',
        open_id: 'wx_test_openid_001',
        session_key: 'test_session_key_001',
        status: UserStatus.ACTIVE,
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      // 模拟微信API调用
      const getWechatUserDataSpy = jest.spyOn(authService, 'getWechatUserData')
        .mockResolvedValue(mockWechatResponse);

      // 模拟数据库查询 - 用户不存在
      (mockPrisma.user.findUnique as any).mockResolvedValue(null);

      // 模拟用户创建
      (mockPrisma.user.create as any).mockResolvedValue(mockNewUser);

      // 模拟刷新令牌保存
      (mockPrisma.refreshToken.create as any).mockResolvedValue({
        id: 'refresh_token_id',
        user_id: 'new_user_id',
        token_hash: 'hashed_token',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date()
      });

      // 执行测试
      const result = await authService.wechatLogin(loginData);

      // 验证结果
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.expiresIn).toBe(7 * 24 * 60 * 60); // 7天

      // 验证方法调用
      expect(getWechatUserDataSpy).toHaveBeenCalledWith(loginData.code);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { open_id: mockWechatResponse.openId }
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          open_id: mockWechatResponse.openId,
          union_id: mockWechatResponse.unionId,
          session_key: mockWechatResponse.sessionKey,
          status: UserStatus.ACTIVE,
          last_login: expect.any(Date)
        }
      });
    });

    it('应该为现有用户更新登录信息并返回登录信息', async () => {
      // 准备测试数据
      const loginData = {
        code: 'test_wx_code_001',
        encryptedData: 'test_encrypted_data',
        iv: 'test_iv'
      };

      const mockWechatResponse = {
        openId: 'wx_test_openid_001',
        sessionKey: 'test_session_key_001',
        unionId: 'wx_test_unionid_001'
      };

      const existingUser = {
        id: 'user_001',
        open_id: 'wx_test_openid_001',
        union_id: 'wx_test_unionid_001',
        session_key: 'test_session_key_001',
        nickname: '测试用户1',
        status: UserStatus.ACTIVE,
        last_login: new Date('2024-01-15T10:00:00Z'),
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-15T10:00:00Z')
      };

      // 模拟微信API调用
      const getWechatUserDataSpy = jest.spyOn(authService, 'getWechatUserData')
        .mockResolvedValue(mockWechatResponse);

      // 模拟数据库查询 - 用户存在
      (mockPrisma.user.findUnique as any).mockResolvedValue(existingUser);

      // 模拟用户更新
      (mockPrisma.user.update as any).mockResolvedValue({
        ...existingUser,
        session_key: mockWechatResponse.sessionKey,
        last_login: new Date()
      });

      // 模拟刷新令牌保存
      (mockPrisma.refreshToken.create as any).mockResolvedValue({
        id: 'refresh_token_id',
        user_id: existingUser.id,
        token_hash: 'hashed_token',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date()
      });

      // 执行测试
      const result = await authService.wechatLogin(loginData);

      // 验证结果
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe(existingUser.id);

      // 验证方法调用
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: {
          session_key: mockWechatResponse.sessionKey,
          last_login: expect.any(Date)
        }
      });
    });

    it('应该在微信登录失败时抛出错误', async () => {
      // 准备测试数据
      const loginData = {
        code: 'test_wx_code_001',
        encryptedData: 'test_encrypted_data',
        iv: 'test_iv'
      };

      // 模拟微信API调用失败
      const getWechatUserDataSpy = jest.spyOn(authService, 'getWechatUserData')
        .mockRejectedValue(new Error('微信API调用失败'));

      // 执行测试并验证错误
      await expect(authService.wechatLogin(loginData))
        .rejects
        .toThrow('登录失败，请重试');

      expect(getWechatUserDataSpy).toHaveBeenCalledWith(loginData.code);
    });
  });

  describe('refreshAccessToken', () => {
    it('应该成功刷新有效的刷新令牌', async () => {
      // 准备测试数据
      const refreshToken = 'valid_refresh_token';
      const payload = {
        userId: 'user_001',
        openId: 'wx_test_openid_001',
        type: 'refresh'
      };

      const mockRefreshTokenRecord = {
        id: 'refresh_token_001',
        user_id: 'user_001',
        token_hash: 'hashed_refresh_token_001',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id: 'user_001',
          open_id: 'wx_test_openid_001',
          status: UserStatus.ACTIVE
        }
      };

      // 模拟JWT验证
      const jwtVerifySpy = jest.spyOn(jwt, 'verify')
        .mockReturnValue(payload as any);

      // 模拟token哈希生成
      const generateTokenHashSpy = jest.spyOn(authService, 'generateTokenHash')
        .mockReturnValue('hashed_token');

      // 模拟数据库查询 - 刷新令牌存在且有效
      (mockPrisma.refreshToken.findUnique as any).mockResolvedValue(mockRefreshTokenRecord);

      // 模拟生成新的访问令牌
      const generateAccessTokenSpy = jest.spyOn(authService, 'generateAccessToken')
        .mockReturnValue('new_access_token');

      // 执行测试
      const result = await authService.refreshAccessToken(refreshToken);

      // 验证结果
      expect(result).toEqual({ token: 'new_access_token' });

      // 验证方法调用
      expect(jwtVerifySpy).toHaveBeenCalledWith(refreshToken, process.env.JWT_SECRET);
      expect(generateTokenHashSpy).toHaveBeenCalledWith(refreshToken);
      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token_hash: 'hashed_token' },
        include: { user: true }
      });
      expect(generateAccessTokenSpy).toHaveBeenCalledWith(payload.userId, payload.openId);
    });

    it('应该拒绝过期的刷新令牌', async () => {
      // 准备测试数据
      const refreshToken = 'expired_refresh_token';
      const payload = {
        userId: 'user_001',
        openId: 'wx_test_openid_001',
        type: 'refresh'
      };

      const expiredRefreshToken = {
        id: 'refresh_token_002',
        user_id: 'user_001',
        token_hash: 'hashed_refresh_token_002',
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前过期
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id: 'user_001',
          open_id: 'wx_test_openid_001',
          status: UserStatus.ACTIVE
        }
      };

      // 模拟JWT验证
      jest.spyOn(jwt, 'verify').mockReturnValue(payload as any);

      // 模拟token哈希生成
      jest.spyOn(authService, 'generateTokenHash').mockReturnValue('expired_hashed_token');

      // 模拟数据库查询 - 刷新令牌已过期
      (mockPrisma.refreshToken.findUnique as any).mockResolvedValue(expiredRefreshToken);

      // 执行测试并验证错误
      await expect(authService.refreshAccessToken(refreshToken))
        .rejects
        .toThrow('令牌刷新失败');
    });

    it('应该拒绝无效的令牌类型', async () => {
      // 准备测试数据
      const refreshToken = 'invalid_type_token';
      const payload = {
        userId: 'user_001',
        openId: 'wx_test_openid_001',
        type: 'access' // 错误的类型
      };

      // 模拟JWT验证
      jest.spyOn(jwt, 'verify').mockReturnValue(payload as any);

      // 执行测试并验证错误
      await expect(authService.refreshAccessToken(refreshToken))
        .rejects
        .toThrow('令牌刷新失败');
    });

    it('应该拒绝不存在的刷新令牌', async () => {
      // 准备测试数据
      const refreshToken = 'non_existent_token';
      const payload = {
        userId: 'user_001',
        openId: 'wx_test_openid_001',
        type: 'refresh'
      };

      // 模拟JWT验证
      jest.spyOn(jwt, 'verify').mockReturnValue(payload as any);

      // 模拟token哈希生成
      jest.spyOn(authService, 'generateTokenHash').mockReturnValue('non_existent_hash');

      // 模拟数据库查询 - 刷新令牌不存在
      (mockPrisma.refreshToken.findUnique as any).mockResolvedValue(null);

      // 执行测试并验证错误
      await expect(authService.refreshAccessToken(refreshToken))
        .rejects
        .toThrow('令牌刷新失败');
    });

    it('应该拒绝无效的JWT令牌', async () => {
      // 准备测试数据
      const refreshToken = 'invalid_jwt_token';

      // 模拟JWT验证失败
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // 执行测试并验证错误
      await expect(authService.refreshAccessToken(refreshToken))
        .rejects
        .toThrow('令牌刷新失败');
    });
  });
}); 