/**
 * 路由主入口文件
 * 负责整合所有模块路由，统一管理API版本和前缀
 * @author AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import healthRoutes from './health.ts';
import authRoutes from './auth.ts';     // 新添加

// 创建主路由实例
const router = new Router();

// API版本前缀
const API_PREFIX = '/api/v1';

/**
 * 注册健康检查路由
 * 用于服务状态监控和负载均衡器健康检查
 */
router.use(`${API_PREFIX}/health`, healthRoutes.routes(), healthRoutes.allowedMethods());

/**
 * 注册认证路由
 * 处理用户登录、注册、令牌管理等认证相关功能
 */
router.use(`${API_PREFIX}/auth`, authRoutes.routes(), authRoutes.allowedMethods());

// TODO: 后续添加其他模块路由
// router.use(`${API_PREFIX}/users`, userRoutes.routes(), userRoutes.allowedMethods());
// router.use(`${API_PREFIX}/products`, productRoutes.routes(), productRoutes.allowedMethods());
// router.use(`${API_PREFIX}/orders`, orderRoutes.routes(), orderRoutes.allowedMethods());

export default router;
