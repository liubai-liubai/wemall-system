/**
 * SKU管理路由
 * 定义SKU相关的API路由和中间件
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { SkuController } from '../controllers/sku-controller.js';
// TODO: 添加认证中间件
// import { authMiddleware } from '../middleware/auth.js';

const router = new Router({
  prefix: '/api/v1'
});
const skuController = new SkuController();

// ===== SKU管理路由 =====

/**
 * 获取SKU库存统计
 * GET /skus/stats
 * 注意：需要放在 /:id 路由之前，避免 "stats" 被当作ID参数
 */
router.get('/skus/stats', skuController.getSkuStockStats.bind(skuController));

/**
 * 批量操作SKU
 * POST /skus/batch
 */
router.post('/skus/batch', skuController.batchOperateSkus.bind(skuController));

/**
 * 分页查询SKU列表
 * GET /skus
 */
router.get('/skus', skuController.getSkuList.bind(skuController));

/**
 * 创建SKU
 * POST /skus
 */
router.post('/skus', skuController.createSku.bind(skuController));

/**
 * 获取SKU详情
 * GET /skus/:id
 */
router.get('/skus/:id', skuController.getSkuById.bind(skuController));

/**
 * 更新SKU信息
 * PUT /skus/:id
 */
router.put('/skus/:id', skuController.updateSku.bind(skuController));

/**
 * 删除SKU
 * DELETE /skus/:id
 */
router.delete('/skus/:id', skuController.deleteSku.bind(skuController));

/**
 * 调整SKU库存
 * POST /skus/:id/stock
 */
router.post('/skus/:id/stock', skuController.adjustSkuStock.bind(skuController));

// ===== 商品相关的SKU路由 =====

/**
 * 获取商品的SKU列表
 * GET /products/:productId/skus
 */
router.get('/products/:productId/skus', skuController.getSkusByProductId.bind(skuController));

export default router; 