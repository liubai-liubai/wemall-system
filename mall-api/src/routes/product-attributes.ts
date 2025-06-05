/**
 * 商品属性管理路由
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { ProductAttributeController } from '../controllers/product-attribute-controller.js';

const router = new Router({
  prefix: '/api/v1'
});
const attributeController = new ProductAttributeController();

// 商品属性管理路由
router.post('/product-attributes', attributeController.createAttribute.bind(attributeController));
router.get('/product-attributes/:id', attributeController.getAttributeById.bind(attributeController));
router.get('/product-attributes', attributeController.getAttributeList.bind(attributeController));
router.get('/products/:productId/attributes', attributeController.getAttributesByProductId.bind(attributeController));

export default router; 