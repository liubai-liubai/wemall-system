/**
 * 路由主入口文件
 * 负责整合所有模块路由，统一管理API版本和前缀
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import dashboardRoutes from './dashboard.js';
import permissionRoutes from './permissions.js';
import roleRoutes from './roles.js';
import departmentRoutes from './departments.js';
import adminUserRoutes from './admin-users.js';

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

/**
 * 注册仪表盘路由
 * 提供系统统计数据和监控信息
 */
router.use(`${API_PREFIX}/dashboard`, dashboardRoutes.routes(), dashboardRoutes.allowedMethods());

/**
 * 注册系统管理模块路由
 */
router.use(`${API_PREFIX}/permissions`, permissionRoutes.routes(), permissionRoutes.allowedMethods());
router.use(`${API_PREFIX}/roles`, roleRoutes.routes(), roleRoutes.allowedMethods());
router.use(`${API_PREFIX}/departments`, departmentRoutes.routes(), departmentRoutes.allowedMethods());
router.use(`${API_PREFIX}/admin-users`, adminUserRoutes.routes(), adminUserRoutes.allowedMethods());

// TODO: 后续添加其他模块路由
// router.use(`${API_PREFIX}/users`, userRoutes.routes(), userRoutes.allowedMethods());
// router.use(`${API_PREFIX}/products`, productRoutes.routes(), productRoutes.allowedMethods());
// router.use(`${API_PREFIX}/orders`, orderRoutes.routes(), orderRoutes.allowedMethods());

export default router;
