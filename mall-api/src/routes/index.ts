/**
 * 路由主入口文件
 * 负责整合所有模块路由，统一管理API版本和前缀
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import healthRoutes from './health';
import authRoutes from './auth';
import dashboardRoutes from './dashboard';
import permissionRoutes from './permissions';
import roleRoutes from './roles';
import departmentRoutes from './departments';
import adminUserRoutes from './admin-users';
import memberLevelRoutes from './member-levels';
import userMemberRoutes from './user-members';
import memberPointRoutes from './member-points';
import userAddressRoutes from './user-addresses';
import productCategoryRoutes from './product-categories';
import productRoutes from './products';
import skuRoutes from './skus';
import productAttributeRoutes from './product-attributes';
import productImageRoutes from './product-images';
import productStockRoutes from './product-stocks';
import shoppingCartRoutes from './shopping-cart';

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

/**
 * 注册商城模块路由
 */
// 会员管理模块
router.use(memberLevelRoutes.routes(), memberLevelRoutes.allowedMethods());
router.use(userMemberRoutes.routes(), userMemberRoutes.allowedMethods());
router.use(memberPointRoutes.routes(), memberPointRoutes.allowedMethods());

// 用户地址管理模块
router.use(userAddressRoutes.routes(), userAddressRoutes.allowedMethods());

// 商品管理模块
router.use(productCategoryRoutes.routes(), productCategoryRoutes.allowedMethods());
router.use(productRoutes.routes(), productRoutes.allowedMethods());
router.use(skuRoutes.routes(), skuRoutes.allowedMethods());
router.use(productAttributeRoutes.routes(), productAttributeRoutes.allowedMethods());
router.use(productImageRoutes.routes(), productImageRoutes.allowedMethods());
router.use(productStockRoutes.routes(), productStockRoutes.allowedMethods());

// 购物车管理模块
router.use(shoppingCartRoutes.routes(), shoppingCartRoutes.allowedMethods());

// TODO: 后续添加其他商城模块路由
// router.use(`${API_PREFIX}/orders`, orderRoutes.routes(), orderRoutes.allowedMethods());

export default router;
