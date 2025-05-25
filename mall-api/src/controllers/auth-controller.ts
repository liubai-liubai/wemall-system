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
   * @swagger
   * /api/v1/auth/wechat-login:
   *   post:
   *     tags: [Auth]
   *     summary: 微信小程序登录
   *     description: |
   *       使用微信小程序授权码进行登录，获取用户信息和访问令牌
   *       
   *       ### 流程说明
   *       1. 小程序调用 wx.login() 获取授权码 code
   *       2. 将 code 发送到后端进行验证
   *       3. 后端调用微信API获取 openId 和 session_key
   *       4. 查找或创建用户记录
   *       5. 生成 JWT 访问令牌和刷新令牌
   *       6. 返回用户信息和令牌
   *       
   *       ### 注意事项
   *       - code 只能使用一次，有效期5分钟
   *       - 同一用户多次登录会更新最后登录时间
   *       - 生成的令牌有效期为7天
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/WechatLoginRequest'
   *           examples:
   *             basic:
   *               summary: 基础登录
   *               value:
   *                 code: "0234A0z01Hx5nV1kCNy01Mzsz34A0z0K"
   *     responses:
   *       200:
   *         description: 登录成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: 请求参数错误
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               missingCode:
   *                 summary: 缺少授权码
   *                 value:
   *                   code: 400
   *                   message: "微信登录凭证code不能为空"
   *                   data: null
   *                   timestamp: 1703155200000
   *       500:
   *         description: 服务器内部错误
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   * @swagger
   * /api/v1/auth/refresh-token:
   *   post:
   *     tags: [Auth]
   *     summary: 刷新访问令牌
   *     description: |
   *       使用刷新令牌获取新的访问令牌，延长用户登录状态
   *       
   *       ### 使用场景
   *       - 访问令牌即将过期时主动刷新
   *       - API返回401未授权时自动刷新
   *       - 定时刷新保持登录状态
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RefreshTokenRequest'
   *     responses:
   *       200:
   *         description: 令牌刷新成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         token:
   *                           type: string
   *                           description: 新的访问令牌
   *       401:
   *         description: 令牌无效或已过期
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   * @swagger
   * /api/v1/auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: 用户登出
   *     description: 用户主动登出，清除服务端的登录状态
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: 登出成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: 'null'
   *       401:
   *         description: 未授权访问
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   * @swagger
   * /api/v1/auth/profile:
   *   get:
   *     tags: [Auth]
   *     summary: 获取当前用户信息
   *     description: 获取当前登录用户的详细信息
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: 获取用户信息成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/UserInfo'
   *       401:
   *         description: 未授权访问
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
