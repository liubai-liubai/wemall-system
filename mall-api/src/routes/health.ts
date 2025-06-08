/**
 * 健康检查路由
 * 提供服务状态检查接口，用于监控和负载均衡
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { healthController } from '../controllers/health-controller';

// 创建健康检查路由实例
const router = new Router();

/**
 * GET /health
 * 基础健康检查 - 返回服务基本状态
 */
router.get('/', healthController.basic);

/**
 * GET /health/detailed
 * 详细健康检查 - 包含数据库连接、内存使用等详细信息
 */
router.get('/detailed', healthController.detailed);

export default router;