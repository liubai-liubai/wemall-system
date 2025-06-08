/**
 * 购物车管理路由
 * 定义购物车相关的API路由和中间件
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { ShoppingCartController } from '../controllers/shopping-cart-controller';

const router = new Router({
  prefix: '/api/v1'
});
const shoppingCartController = new ShoppingCartController();

// ===== 购物车管理路由 =====

/**
 * 批量操作购物车
 * POST /shopping-cart/batch
 * 注意：需要放在 /:id 路由之前，避免 "batch" 被当作ID参数
 */
router.post('/shopping-cart/batch', shoppingCartController.batchOperateCart.bind(shoppingCartController));

/**
 * 获取购物车商品数量
 * GET /shopping-cart/count
 */
router.get('/shopping-cart/count', shoppingCartController.getCartCount.bind(shoppingCartController));

/**
 * 验证购物车可用性
 * POST /shopping-cart/validate
 */
router.post('/shopping-cart/validate', shoppingCartController.validateCart.bind(shoppingCartController));

/**
 * 清空购物车
 * DELETE /shopping-cart/clear
 */
router.delete('/shopping-cart/clear', shoppingCartController.clearCart.bind(shoppingCartController));

/**
 * 获取用户购物车列表（分页）
 * GET /shopping-cart
 */
router.get('/shopping-cart', shoppingCartController.getCartList.bind(shoppingCartController));

/**
 * 添加商品到购物车
 * POST /shopping-cart
 */
router.post('/shopping-cart', shoppingCartController.addToCart.bind(shoppingCartController));

/**
 * 获取购物车项详情
 * GET /shopping-cart/:id
 */
router.get('/shopping-cart/:id', shoppingCartController.getCartItem.bind(shoppingCartController));

/**
 * 更新购物车项
 * PUT /shopping-cart/:id
 */
router.put('/shopping-cart/:id', shoppingCartController.updateCartItem.bind(shoppingCartController));

/**
 * 删除购物车项
 * DELETE /shopping-cart/:id
 */
router.delete('/shopping-cart/:id', shoppingCartController.deleteCartItem.bind(shoppingCartController));

export default router; 