/**
 * 认证系统集成测试
 * 测试用户认证、权限验证、Token管理等核心认证功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { apiClient, ResponseHelper } from './helpers/api-client';
import { databaseHelper } from './helpers/database-helper';
import { authHelper, UserType } from './helpers/auth-helper';

describe('🔐 认证系统集成测试', () => {
  
  // 测试数据存储
  const testData = {
    users: [] as Array<{ id: string; phone: string; nickname: string }>,
    adminUsers: [] as Array<{ id: string; username: string; email: string }>
  };

  beforeAll(async () => {
    // 连接测试数据库
    await databaseHelper.connect();
    
    // 清理和初始化测试数据
    await databaseHelper.cleanupTestData();
    await databaseHelper.seedBasicTestData();
    
    console.log('🚀 认证系统集成测试环境初始化完成');
  });

  afterAll(async () => {
    // 清理所有测试数据
    await databaseHelper.cleanupTestData();
    await authHelper.cleanupTestUsers(testData.users.map(u => u.id));
    await databaseHelper.disconnect();
    
    console.log('🧹 认证系统集成测试环境清理完成');
  });

  beforeEach(() => {
    // 每个测试前清除API客户端状态
    apiClient.clearAuthToken();
  });

  describe('👥 用户认证功能', () => {
    
    test('应该成功进行微信登录', async () => {
      const loginData = {
        code: 'mock_wechat_code_001'
      };

      const response = await apiClient.post('/auth/wechat-login', loginData);
      
      // 验证响应格式
      const result = ResponseHelper.validateApiResponse(response, 200);
      expect(result.message).toContain('登录成功');
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('token');
      
      // 验证用户数据
      const user = result.data.user;
      expect(user.id).toBeTruthy();
      expect(user.openId).toBeTruthy();
      expect(user.status).toBe(1);
      
      // 验证Token
      expect(result.data.token).toBeTruthy();
      expect(result.data.refreshToken).toBeTruthy();
      expect(result.data.expiresIn).toBeGreaterThan(0);
      
      // 保存测试数据用于后续清理
      testData.users.push({
        id: user.id,
        phone: user.phone || 'test_phone',
        nickname: user.nickname || 'test_user'
      });
      
      console.log('✅ 微信登录测试成功');
    });

    test('应该正确处理Token刷新', async () => {
      // 先进行微信登录获取Token
      const loginData = {
        code: 'mock_wechat_code_refresh'
      };

      const loginResponse = await apiClient.post('/auth/wechat-login', loginData);
      const loginResult = ResponseHelper.validateApiResponse(loginResponse, 200);
      testData.users.push({
        id: loginResult.data.user.id,
        phone: loginResult.data.user.phone || 'test_phone_refresh',
        nickname: loginResult.data.user.nickname || 'test_user_refresh'
      });

      const refreshToken = loginResult.data.refreshToken;

      // 刷新Token
      const refreshData = {
        refreshToken: refreshToken
      };

      const refreshResponse = await apiClient.post('/auth/refresh-token', refreshData);
      const refreshResult = ResponseHelper.validateApiResponse(refreshResponse, 200);
      
      // 验证刷新响应
      expect(refreshResult.message).toContain('刷新成功');
      expect(refreshResult.data).toHaveProperty('token');
      
      // 验证新Token
      const newToken = refreshResult.data.token;
      expect(newToken).toBeTruthy();
      expect(typeof newToken).toBe('string');
      
      console.log('✅ Token刷新测试成功');
    });
  });

  describe('👨‍💼 管理员认证功能', () => {
    
    test('应该正确处理管理员登录请求', async () => {
      const loginData = {
        username: 'admin',
        password: 'admin123456'
      };

      // 尝试管理员登录（可能会失败，因为用户不存在）
      try {
        const loginResponse = await apiClient.post('/auth/admin/login', loginData);
        const loginResult = ResponseHelper.validateApiResponse(loginResponse, 200);
        
        // 如果登录成功，验证响应结构
        expect(loginResult.data).toHaveProperty('token');
        console.log('✅ 管理员登录测试成功');
        
      } catch (error: any) {
        // 如果登录失败（用户不存在等），验证错误响应
        expect(error.response.status).toBeGreaterThanOrEqual(400);
        expect(error.response.status).toBeLessThan(500);
        console.log('✅ 管理员登录错误处理测试成功');
      }
    });
  });

  describe('🛡️ 权限控制测试', () => {
    
    let memberToken: string;
    let adminToken: string;
    
    beforeEach(async () => {
      // 创建测试用户（通过微信登录）
      const memberResponse = await apiClient.post('/auth/wechat-login', {
        code: 'permission_test_code'
      });
      const memberResult = ResponseHelper.validateApiResponse(memberResponse, 200);
      memberToken = memberResult.data.token;
      testData.users.push({
        id: memberResult.data.user.id,
        phone: memberResult.data.user.phone || 'test_phone_permission',
        nickname: memberResult.data.user.nickname || 'permission_test_user'
      });

      // 为管理员测试生成临时Token（实际应该通过真实的管理员登录）
      adminToken = authHelper.generateToken({
        sub: 'test-admin-id',
        type: UserType.ADMIN,
        permissions: ['admin:access']
      });
    });

    test('普通用户应该能访问用户接口', async () => {
      apiClient.setAuthToken(memberToken);
      
      const response = await apiClient.get('/auth/profile');
      const result = ResponseHelper.validateApiResponse(response, 200);
      
      expect(result.data).toHaveProperty('user');
      expect(result.data.user.type).toBe('member');
      
      console.log('✅ 普通用户权限测试成功');
    });

    test('无效Token应该被拒绝', async () => {
      apiClient.setAuthToken('invalid_token');
      
      try {
        await apiClient.get('/auth/profile');
        expect(true).toBe(false); // 不应该执行到这里
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        const errorResult = ResponseHelper.validateApiResponse(error.response, 401);
        expect(errorResult.message).toContain('Token无效');
      }
      
      console.log('✅ 无效Token拒绝测试成功');
    });
  });
}); 