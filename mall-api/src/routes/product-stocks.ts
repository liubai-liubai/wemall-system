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

// 库存调整路由
router.post('/product-stocks/adjust', productStockController.adjustStock.bind(productStockController));
router.post('/product-stocks/batch-adjust', productStockController.batchAdjustStock.bind(productStockController));

// 库存锁定/解锁路由
router.post('/product-stocks/lock', productStockController.lockStock.bind(productStockController));
router.post('/product-stocks/unlock', productStockController.unlockStock.bind(productStockController));

// 库存预警和统计路由
router.get('/product-stocks/alerts', productStockController.getStockAlerts.bind(productStockController));
router.get('/product-stocks/low-stocks', productStockController.getLowStocks.bind(productStockController));
router.get('/product-stocks/stats', productStockController.getStats.bind(productStockController));

// 关联查询路由
router.get('/skus/:skuId/stock', productStockController.getBySku.bind(productStockController));
router.get('/products/:productId/stocks', productStockController.getByProduct.bind(productStockController));

// ========== 第四模块：业务操作（预留、释放等） ==========

// 检查库存可用性
router.post('/product-stocks/check-availability', productStockController.checkStockAvailability.bind(productStockController));

// 库存预留
router.post('/product-stocks/reserve', productStockController.reserveStock.bind(productStockController));

// 库存释放
router.post('/product-stocks/release', productStockController.releaseStock.bind(productStockController));

// 库存日志查询
router.get('/product-stocks/logs', productStockController.getStockLogs.bind(productStockController));

// 获取指定库存的历史记录
router.get('/product-stocks/:id/history', productStockController.getStockHistory.bind(productStockController));

export default router; 