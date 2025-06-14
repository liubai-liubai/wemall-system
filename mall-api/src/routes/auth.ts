/**
 * 认证路由
 * 定义用户认证相关的API端点，包括登录、注册、令牌管理等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { authController } from '../controllers/auth-controller';
import { adminUserController } from '../controllers/admin-user-controller';
// import { authValidator } from '../validators/auth';  // 后续添加
// import { authMiddleware } from '../middleware/auth'; // 后续添加

// 创建认证路由实例
const router = new Router();

/**
 * POST /auth/wechat-login
 * 微信小程序登录
 * @body {code: string, encryptedData?: string, iv?: string}
 * @returns {user: object, token: string, refreshToken: string}
 */
router.post('/wechat-login', authController.wechatLogin);

/**
 * POST /auth/admin/login
 * 管理员登录
 * @body {username: string, password: string}
 * @returns {token: string, refreshToken: string, userInfo: object, permissions: string[], menus: array}
 */
router.post('/admin/login', adminUserController.adminLogin);

/**
 * POST /auth/refresh-token  
 * 刷新访问令牌
 * @body {refreshToken: string} | @header Authorization: Bearer <refreshToken>
 * @returns {token: string}
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * POST /auth/logout
 * 用户登出（需要认证）
 * @header Authorization: Bearer <accessToken>
 * @returns {message: string}
 */
router.post('/logout', 
  // authMiddleware,        // 后续添加认证中间件
  authController.logout
);

/**
 * GET /auth/profile
 * 获取当前用户信息（需要认证）
 * @header Authorization: Bearer <accessToken>
 * @returns {user: object}
 */
router.get('/profile',
  // authMiddleware,        // 后续添加认证中间件
  authController.getProfile
);

export default router;
