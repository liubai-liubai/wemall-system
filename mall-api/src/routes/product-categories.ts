/**
 * 商品分类路由配置
 * 定义商品分类管理相关的路由规则
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { ProductCategoryController } from '../controllers/product-category-controller';
import { logger } from '../utils/logger';

const router = new Router({
  prefix: '/api/v1'
});

const productCategoryController = new ProductCategoryController();

// 获取分类树形结构（放在前面避免被参数路由捕获）
router.get('/product/categories/tree', productCategoryController.getCategoryTree.bind(productCategoryController));

// 获取所有根分类
router.get('/product/categories/roots', productCategoryController.getRootCategories.bind(productCategoryController));

// 批量更新分类排序
router.patch('/product/categories/batch/sort', productCategoryController.updateCategoriesSort.bind(productCategoryController));

// 获取分类列表（分页）
router.get('/product/categories', productCategoryController.getCategoryList.bind(productCategoryController));

// 获取分类详情
router.get('/product/categories/:id', productCategoryController.getCategoryById.bind(productCategoryController));

// 获取指定分类的子分类
router.get('/product/categories/:parentId/children', productCategoryController.getChildCategories.bind(productCategoryController));

// 创建新分类
router.post('/product/categories', productCategoryController.createCategory.bind(productCategoryController));

// 更新分类信息
router.put('/product/categories/:id', productCategoryController.updateCategory.bind(productCategoryController));

// 删除分类
router.delete('/product/categories/:id', productCategoryController.deleteCategory.bind(productCategoryController));

logger.info('商品分类路由注册完成');

export default router; 