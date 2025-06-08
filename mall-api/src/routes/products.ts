/**
 * 商品管理路由
 * 定义商品相关的API路由和中间件
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { ProductController } from '../controllers/product-controller';

const router = new Router({
  prefix: '/api/v1'
});
const productController = new ProductController();

// ===== 商品管理路由 =====

/**
 * 获取商品统计信息
 * GET /products/stats
 * 注意：需要放在 /:id 路由之前，避免 "stats" 被当作ID参数
 */
router.get('/products/stats', productController.getProductStats.bind(productController));

/**
 * 批量操作商品
 * POST /products/batch
 */
router.post('/products/batch', productController.batchOperateProducts.bind(productController));

/**
 * 分页查询商品列表
 * GET /products
 */
router.get('/products', productController.getProductList.bind(productController));

/**
 * 创建商品
 * POST /products
 */
router.post('/products', productController.createProduct.bind(productController));

/**
 * 获取商品详情
 * GET /products/:id
 */
router.get('/products/:id', productController.getProductById.bind(productController));

/**
 * 更新商品信息
 * PUT /products/:id
 */
router.put('/products/:id', productController.updateProduct.bind(productController));

/**
 * 删除商品
 * DELETE /products/:id
 */
router.delete('/products/:id', productController.deleteProduct.bind(productController));

export default router; 