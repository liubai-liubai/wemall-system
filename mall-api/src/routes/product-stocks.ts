/**
 * 库存管理路由
 * @author 刘白 & AI Assistant
 */

import Router from '@koa/router';
import { ProductStockController } from '../controllers/product-stock-controller';

const router = new Router({ prefix: '/api/v1' });
const productStockController = new ProductStockController();

// 库存管理基础路由
router.post('/product-stocks', productStockController.create.bind(productStockController));
router.get('/product-stocks/:id', productStockController.getById.bind(productStockController));
router.put('/product-stocks/:id', productStockController.update.bind(productStockController));
router.delete('/product-stocks/:id', productStockController.delete.bind(productStockController));
router.get('/product-stocks', productStockController.getList.bind(productStockController));

// 关联查询路由
router.get('/skus/:skuId/stock', productStockController.getBySku.bind(productStockController));
router.get('/products/:productId/stocks', productStockController.getByProduct.bind(productStockController));

export default router; 