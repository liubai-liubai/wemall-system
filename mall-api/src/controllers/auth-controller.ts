/**
 * 认证控制器
 * 处理用户认证相关的HTTP请求，调用认证服务处理业务逻辑
 * @author AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { authService } from '../services/auth-service.ts';
import { success, error, HTTP_STATUS } from '../utils/response.ts';
import { logger } from '../utils/logger.ts';
import { IWechatLoginRequest } from '../types/user.ts';

/**
 * 认证控制器类
 */
class AuthController {
  /**
   * 微信小程序登录
   * POST /api/v1/auth/wechat-login
   * @param ctx Koa上下文
   */
  async wechatLogin(ctx: Context): Promise<void> {
    try {
      // 1. 检查请求体是否存在
      if (!ctx.request.body) {
        error(ctx, '请求体不能为空', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      // 2. 获取请求参数
      const loginData: IWechatLoginRequest = ctx.request.body as IWechatLoginRequest;
      
      // 3. 详细的参数验证
      if (!loginData || typeof loginData !== 'object') {
        error(ctx, '请求参数格式错误', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      if (!loginData.code || typeof loginData.code !== 'string') {
        error(ctx, '微信登录凭证code不能为空', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      // 4. 记录请求日志（调试用）
      logger.debug('收到微信登录请求', { code: loginData.code });

      // 5. 调用认证服务处理登录逻辑
      const loginResult = await authService.wechatLogin(loginData);

      // 6. 记录登录日志
      logger.info('用户微信登录成功', {
        userId: loginResult.user.id,
        openId: loginResult.user.openId
      });

      // 7. 返回成功响应
      success(ctx, loginResult, '登录成功', HTTP_STATUS.OK);
      
    } catch (err) {
      // 8. 详细的错误处理和日志记录
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      logger.error('微信登录失败', { 
        error: err, 
        body: ctx.request.body,
        method: ctx.method,
        url: ctx.url,
        headers: ctx.headers
      });
      
      error(ctx, errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 刷新访问令牌
   * POST /api/v1/auth/refresh-token
   * @param ctx Koa上下文
   */
  async refreshToken(ctx: Context): Promise<void> {
    try {
      // 1. 获取刷新令牌（从请求体或Header）
      const { refreshToken } = ctx.request.body as { refreshToken: string };
      const headerToken = ctx.headers.authorization?.replace('Bearer ', '');
      
      const token = refreshToken || headerToken;
      
      if (!token) {
        error(ctx, '刷新令牌不能为空', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      // 2. 调用认证服务刷新令牌
      const result = await authService.refreshAccessToken(token);

      // 3. 返回新的访问令牌
      success(ctx, result, '令牌刷新成功', HTTP_STATUS.OK);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '令牌刷新失败';
      logger.error('令牌刷新失败', err);
      
      // 令牌相关错误返回401未授权
      error(ctx, errorMessage, HTTP_STATUS.UNAUTHORIZED);
    }
  }

  /**
   * 用户登出
   * POST /api/v1/auth/logout
   * @param ctx Koa上下文
   */
  async logout(ctx: Context): Promise<void> {
    try {
      // 1. 获取用户信息（从中间件注入，后续实现）
      const userId = (ctx.state.user as any)?.userId;
      
      if (!userId) {
        error(ctx, '用户未登录', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      // 2. 清除用户的刷新令牌（可选实现）
      // await authService.clearUserTokens(userId);

      // 3. 记录登出日志
      logger.info('用户登出', { userId });

      // 4. 返回成功响应
      success(ctx, null, '登出成功', HTTP_STATUS.OK);
      
    } catch (err) {
      logger.error('用户登出失败', err);
      error(ctx, '登出失败', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/profile
   * @param ctx Koa上下文
   */
  async getProfile(ctx: Context): Promise<void> {
    try {
      // 1. 从认证中间件获取用户信息
      const user = ctx.state.user;
      
      if (!user) {
        error(ctx, '用户未登录', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      // 2. 返回用户信息（敏感信息已在service层过滤）
      success(ctx, user, '获取用户信息成功', HTTP_STATUS.OK);
      
    } catch (err) {
      logger.error('获取用户信息失败', err);
      error(ctx, '获取用户信息失败', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

// 导出控制器实例
export const authController = new AuthController();
