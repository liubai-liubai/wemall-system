/**
 * 商品分类控制器
 * 处理商品分类相关的HTTP请求，提供完整的CRUD操作和树形管理
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { ProductCategoryService } from '../services/product-category-service';
import { success, error, pageSuccess } from '../utils/response';
import { 
  CreateProductCategoryRequest, 
  UpdateProductCategoryRequest,
  ProductCategoryQueryParams,
  CategoryStatus
} from '../types/product';
import { logger } from '../utils/logger';

export class ProductCategoryController {
  private productCategoryService: ProductCategoryService;

  constructor() {
    this.productCategoryService = new ProductCategoryService();
  }

  /**
   * @swagger
   * /api/v1/product/categories:
   *   get:
   *     tags:
   *       - 商品分类管理
   *     summary: 获取商品分类列表（分页）
   *     description: 支持多种查询条件和分页功能的商品分类列表接口
   *     parameters:
   *       - name: parentId
   *         in: query
   *         description: 父分类ID（不传获取所有分类）
   *         required: false
   *         schema:
   *           type: string
   *       - name: level
   *         in: query
   *         description: 分类层级（1-3）
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 3
   *       - name: status
   *         in: query
   *         description: 分类状态
   *         required: false
   *         schema:
   *           type: integer
   *           enum: [0, 1]
   *           description: "0: 禁用, 1: 启用"
   *       - name: keyword
   *         in: query
   *         description: 分类名称关键字搜索
   *         required: false
   *         schema:
   *           type: string
   *       - name: page
   *         in: query
   *         description: 页码（从1开始）
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - name: size
   *         in: query
   *         description: 每页数量（1-100）
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *       - name: sortBy
   *         in: query
   *         description: 排序字段
   *         required: false
   *         schema:
   *           type: string
   *           enum: [sort, name, created_at, updated_at]
   *           default: sort
   *       - name: sortOrder
   *         in: query
   *         description: 排序方向
   *         required: false
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   type: object
   *                   properties:
   *                     list:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/ProductCategory'
   *                     total:
   *                       type: integer
   *                       description: 总数
   *                     page:
   *                       type: integer
   *                       description: 当前页
   *                     size:
   *                       type: integer
   *                       description: 页大小
   *                     pages:
   *                       type: integer
   *                       description: 总页数
   *                 timestamp:
   *                   type: integer
   *       500:
   *         description: 服务器内部错误
   */
  async getCategoryList(ctx: Context): Promise<void> {
    try {
      const params: ProductCategoryQueryParams = {
        parentId: ctx.query.parentId as string,
        level: ctx.query.level ? parseInt(ctx.query.level as string, 10) : undefined,
        status: ctx.query.status !== undefined ? parseInt(ctx.query.status as string, 10) as CategoryStatus : undefined,
        keyword: ctx.query.keyword as string,
        page: ctx.query.page ? parseInt(ctx.query.page as string, 10) : 1,
        size: ctx.query.size ? parseInt(ctx.query.size as string, 10) : 20,
        sortBy: (ctx.query.sortBy as any) || 'sort',
        sortOrder: (ctx.query.sortOrder as any) || 'asc'
      };

      // 参数验证
      if (params.page! < 1) params.page = 1;
      if (params.size! < 1 || params.size! > 100) params.size = 20;

      const result = await this.productCategoryService.getCategoryList(params);
      
      ctx.body = pageSuccess(
        result.list,
        result.total,
        result.page,
        result.size,
        '获取分类列表成功'
      );

      logger.info(`获取分类列表成功 - 父分类: ${params.parentId || '全部'}, 页码: ${params.page}, 大小: ${params.size}`);

    } catch (err) {
      logger.error('获取分类列表失败:', err);
      ctx.body = error('获取分类列表失败', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/product/categories/{id}:
   *   get:
   *     tags:
   *       - 商品分类管理
   *     summary: 获取分类详情
   *     description: 根据分类ID获取详细信息，包含父分类、子分类和关联商品信息
   *     parameters:
   *       - name: id
   *         in: path
   *         description: 分类ID
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   $ref: '#/components/schemas/ProductCategory'
   *                 timestamp:
   *                   type: integer
   *       404:
   *         description: 分类不存在
   *       500:
   *         description: 服务器内部错误
   */
  async getCategoryById(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;

      if (!id) {
        ctx.body = error('分类ID不能为空', 400);
        return;
      }

      const category = await this.productCategoryService.getCategoryById(id);
      ctx.body = success(category, '获取分类详情成功');

      logger.info(`获取分类详情成功: ${id}`);

    } catch (err) {
      logger.error('获取分类详情失败:', err);
      if (err instanceof Error && err.message === '商品分类不存在') {
        ctx.body = error('商品分类不存在', 404);
      } else {
        ctx.body = error('获取分类详情失败', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/product/categories/tree:
   *   get:
   *     tags:
   *       - 商品分类管理
   *     summary: 获取分类树形结构
   *     description: 获取完整的分类树形结构，支持按状态筛选
   *     parameters:
   *       - name: status
   *         in: query
   *         description: 分类状态筛选
   *         required: false
   *         schema:
   *           type: integer
   *           enum: [0, 1]
   *           description: "0: 禁用, 1: 启用"
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/CategoryTree'
   *                 timestamp:
   *                   type: integer
   *       500:
   *         description: 服务器内部错误
   */
  async getCategoryTree(ctx: Context): Promise<void> {
    try {
      const status = ctx.query.status !== undefined ? 
        parseInt(ctx.query.status as string, 10) as CategoryStatus : 
        undefined;

      const tree = await this.productCategoryService.getCategoryTree(status);
      ctx.body = success(tree, '获取分类树形结构成功');

      logger.info(`获取分类树形结构成功，状态过滤: ${status !== undefined ? status : '全部'}`);

    } catch (err) {
      logger.error('获取分类树形结构失败:', err);
      ctx.body = error('获取分类树形结构失败', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/product/categories/roots:
   *   get:
   *     tags:
   *       - 商品分类管理
   *     summary: 获取所有根分类
   *     description: 获取所有一级分类（根分类），包含其直接子分类
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ProductCategory'
   *                 timestamp:
   *                   type: integer
   *       500:
   *         description: 服务器内部错误
   */
  async getRootCategories(ctx: Context): Promise<void> {
    try {
      const categories = await this.productCategoryService.getRootCategories();
      ctx.body = success(categories, '获取根分类成功');

      logger.info(`获取根分类成功，共 ${categories.length} 个根分类`);

    } catch (err) {
      logger.error('获取根分类失败:', err);
      ctx.body = error('获取根分类失败', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/product/categories/{parentId}/children:
   *   get:
   *     tags:
   *       - 商品分类管理
   *     summary: 获取指定分类的子分类
   *     description: 获取指定分类下的所有直接子分类
   *     parameters:
   *       - name: parentId
   *         in: path
   *         description: 父分类ID
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ProductCategory'
   *                 timestamp:
   *                   type: integer
   *       500:
   *         description: 服务器内部错误
   */
  async getChildCategories(ctx: Context): Promise<void> {
    try {
      const { parentId } = ctx.params;

      if (!parentId) {
        ctx.body = error('父分类ID不能为空', 400);
        return;
      }

      const categories = await this.productCategoryService.getChildCategories(parentId);
      ctx.body = success(categories, '获取子分类成功');

      logger.info(`获取子分类成功: ${parentId}, 共 ${categories.length} 个子分类`);

    } catch (err) {
      logger.error('获取子分类失败:', err);
      ctx.body = error('获取子分类失败', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/product/categories:
   *   post:
   *     tags:
   *       - 商品分类管理
   *     summary: 创建新分类
   *     description: 创建新的商品分类，支持多级分类结构
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 description: 分类名称
   *                 minLength: 1
   *                 maxLength: 50
   *                 example: "数码电子"
   *               parentId:
   *                 type: string
   *                 description: 父分类ID（不传则为根分类）
   *                 example: "550e8400-e29b-41d4-a716-446655440000"
   *               sort:
   *                 type: integer
   *                 description: 排序值（0-9999）
   *                 minimum: 0
   *                 maximum: 9999
   *                 default: 0
   *                 example: 10
   *               status:
   *                 type: integer
   *                 description: 分类状态
   *                 enum: [0, 1]
   *                 default: 1
   *                 example: 1
   *     responses:
   *       200:
   *         description: 创建成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "创建成功"
   *                 data:
   *                   $ref: '#/components/schemas/ProductCategory'
   *                 timestamp:
   *                   type: integer
   *       400:
   *         description: 参数错误或验证失败
   *       404:
   *         description: 父分类不存在
   *       500:
   *         description: 服务器内部错误
   */
  async createCategory(ctx: Context): Promise<void> {
    try {
      const data = ctx.request.body as CreateProductCategoryRequest;

      if (!data.name) {
        ctx.body = error('分类名称不能为空', 400);
        return;
      }

      const newCategory = await this.productCategoryService.createCategory(data);
      ctx.body = success(newCategory, '创建分类成功');

      logger.info(`创建分类成功: ${newCategory.id}, 名称: ${newCategory.name}`);

    } catch (err) {
      logger.error('创建分类失败:', err);
      if (err instanceof Error) {
        if (err.message === '父分类不存在') {
          ctx.body = error(err.message, 404);
        } else if (err.message.includes('验证失败') || 
                   err.message === '分类层级不能超过3级' ||
                   err.message === '同级分类名称已存在') {
          ctx.body = error(err.message, 400);
        } else {
          ctx.body = error('创建分类失败', 500);
        }
      } else {
        ctx.body = error('创建分类失败', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/product/categories/{id}:
   *   put:
   *     tags:
   *       - 商品分类管理
   *     summary: 更新分类信息
   *     description: 根据分类ID更新分类信息，支持移动分类位置
   *     parameters:
   *       - name: id
   *         in: path
   *         description: 分类ID
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: 分类名称
   *                 minLength: 1
   *                 maxLength: 50
   *               parentId:
   *                 type: string
   *                 description: 父分类ID（传null变为根分类）
   *                 nullable: true
   *               sort:
   *                 type: integer
   *                 description: 排序值
   *                 minimum: 0
   *                 maximum: 9999
   *               status:
   *                 type: integer
   *                 description: 分类状态
   *                 enum: [0, 1]
   *     responses:
   *       200:
   *         description: 更新成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "更新成功"
   *                 data:
   *                   $ref: '#/components/schemas/ProductCategory'
   *                 timestamp:
   *                   type: integer
   *       400:
   *         description: 参数错误或验证失败
   *       404:
   *         description: 分类不存在或父分类不存在
   *       500:
   *         description: 服务器内部错误
   */
  async updateCategory(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body as UpdateProductCategoryRequest;

      if (!id) {
        ctx.body = error('分类ID不能为空', 400);
        return;
      }

      const updatedCategory = await this.productCategoryService.updateCategory(id, updateData);
      ctx.body = success(updatedCategory, '更新分类成功');

      logger.info(`更新分类成功: ${id}`);

    } catch (err) {
      logger.error('更新分类失败:', err);
      if (err instanceof Error) {
        if (err.message === '商品分类不存在' || err.message === '父分类不存在') {
          ctx.body = error(err.message, 404);
        } else if (err.message.includes('验证失败') || 
                   err.message.includes('不能将分类') ||
                   err.message === '分类层级不能超过3级' ||
                   err.message === '同级分类名称已存在') {
          ctx.body = error(err.message, 400);
        } else {
          ctx.body = error('更新分类失败', 500);
        }
      } else {
        ctx.body = error('更新分类失败', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/product/categories/{id}:
   *   delete:
   *     tags:
   *       - 商品分类管理
   *     summary: 删除分类
   *     description: 根据分类ID删除分类（需确保没有子分类和商品）
   *     parameters:
   *       - name: id
   *         in: path
   *         description: 分类ID
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 删除成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "删除成功"
   *                 data:
   *                   type: "null"
   *                 timestamp:
   *                   type: integer
   *       400:
   *         description: 存在子分类或商品不能删除
   *       404:
   *         description: 分类不存在
   *       500:
   *         description: 服务器内部错误
   */
  async deleteCategory(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;

      if (!id) {
        ctx.body = error('分类ID不能为空', 400);
        return;
      }

      await this.productCategoryService.deleteCategory(id);
      ctx.body = success(null, '删除分类成功');

      logger.info(`删除分类成功: ${id}`);

    } catch (err) {
      logger.error('删除分类失败:', err);
      if (err instanceof Error) {
        if (err.message === '商品分类不存在') {
          ctx.body = error(err.message, 404);
        } else if (err.message.includes('存在子分类') || err.message.includes('存在商品')) {
          ctx.body = error(err.message, 400);
        } else {
          ctx.body = error('删除分类失败', 500);
        }
      } else {
        ctx.body = error('删除分类失败', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/product/categories/batch/sort:
   *   patch:
   *     tags:
   *       - 商品分类管理
   *     summary: 批量更新分类排序
   *     description: 批量更新多个分类的排序值
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - updates
   *             properties:
   *               updates:
   *                 type: array
   *                 description: 排序更新列表
   *                 items:
   *                   type: object
   *                   required:
   *                     - id
   *                     - sort
   *                   properties:
   *                     id:
   *                       type: string
   *                       description: 分类ID
   *                     sort:
   *                       type: integer
   *                       description: 新的排序值
   *                       minimum: 0
   *                       maximum: 9999
   *                 example:
   *                   - id: "550e8400-e29b-41d4-a716-446655440001"
   *                     sort: 10
   *                   - id: "550e8400-e29b-41d4-a716-446655440002"
   *                     sort: 20
   *     responses:
   *       200:
   *         description: 更新成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "批量更新排序成功"
   *                 data:
   *                   type: "null"
   *                 timestamp:
   *                   type: integer
   *       400:
   *         description: 参数错误
   *       500:
   *         description: 服务器内部错误
   */
  async updateCategoriesSort(ctx: Context): Promise<void> {
    try {
      const { updates } = ctx.request.body as { updates: Array<{ id: string; sort: number }> };

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        ctx.body = error('更新列表不能为空', 400);
        return;
      }

      // 验证更新数据
      for (const update of updates) {
        if (!update.id || typeof update.sort !== 'number') {
          ctx.body = error('更新数据格式错误', 400);
          return;
        }
        if (update.sort < 0 || update.sort > 9999) {
          ctx.body = error('排序值应在0-9999之间', 400);
          return;
        }
      }

      await this.productCategoryService.updateCategoriesSort(updates);
      ctx.body = success(null, '批量更新排序成功');

      logger.info(`批量更新分类排序成功，共更新 ${updates.length} 个分类`);

    } catch (err) {
      logger.error('批量更新分类排序失败:', err);
      ctx.body = error('批量更新分类排序失败', 500);
    }
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductCategory:
 *       type: object
 *       description: 商品分类信息
 *       properties:
 *         id:
 *           type: string
 *           description: 分类ID
 *         name:
 *           type: string
 *           description: 分类名称
 *         parentId:
 *           type: string
 *           description: 父分类ID
 *           nullable: true
 *         level:
 *           type: integer
 *           description: 分类层级（1-3）
 *         sort:
 *           type: integer
 *           description: 排序值
 *         status:
 *           type: integer
 *           description: 分类状态
 *           enum: [0, 1]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         parent:
 *           $ref: '#/components/schemas/ProductCategory'
 *           description: 父分类信息
 *           nullable: true
 *         children:
 *           type: array
 *           description: 子分类列表
 *           items:
 *             $ref: '#/components/schemas/ProductCategory'
 *           nullable: true
 *         products:
 *           type: array
 *           description: 关联商品列表
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               status:
 *                 type: integer
 *           nullable: true
 *       required:
 *         - id
 *         - name
 *         - level
 *         - sort
 *         - status
 *         - createdAt
 *         - updatedAt
 *     CategoryTree:
 *       type: object
 *       description: 分类树形结构
 *       properties:
 *         id:
 *           type: string
 *           description: 分类ID
 *         name:
 *           type: string
 *           description: 分类名称
 *         level:
 *           type: integer
 *           description: 分类层级
 *         sort:
 *           type: integer
 *           description: 排序值
 *         status:
 *           type: integer
 *           description: 分类状态
 *         children:
 *           type: array
 *           description: 子分类
 *           items:
 *             $ref: '#/components/schemas/CategoryTree'
 *       required:
 *         - id
 *         - name
 *         - level
 *         - sort
 *         - status
 */ 