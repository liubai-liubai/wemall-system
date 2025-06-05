/**
 * 商品图片路由配置
 * @author 刘白 & AI Assistant
 */

import Router from '@koa/router';
import { ProductImageController } from '../controllers/product-image-controller';

const router = new Router({ prefix: '/api/v1' });
const productImageController = new ProductImageController();

// 基础CRUD路由
router.post('/product-images', productImageController.create.bind(productImageController));
router.get('/product-images/:id', productImageController.findById.bind(productImageController));
router.put('/product-images/:id', productImageController.update.bind(productImageController));
router.delete('/product-images/:id', productImageController.delete.bind(productImageController));

// 列表查询路由
router.get('/product-images', productImageController.findWithPagination.bind(productImageController));

// 商品图片关联路由
router.get('/products/:productId/images', productImageController.findByProductId.bind(productImageController));

// 批量操作路由
router.post('/product-images/batch', productImageController.batchCreate.bind(productImageController));
router.put('/product-images/batch/sort', productImageController.batchUpdateSort.bind(productImageController));
router.delete('/product-images/batch', productImageController.batchDelete.bind(productImageController));

// 业务功能路由
router.put('/product-images/main', productImageController.setMainImage.bind(productImageController));
router.put('/product-images/reorder', productImageController.reorderImages.bind(productImageController));

// 统计信息路由
router.get('/product-images/stats', productImageController.getStats.bind(productImageController));

export default router; 