/**
 * 商品管理控制器
 * 处理商品相关的HTTP请求，包括CRUD操作、批量操作和统计查询
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context, Next } from 'koa';
import { ProductService } from '../services/product-service';
import { 
  productCreateSchema, 
  productUpdateSchema, 
  productQuerySchema,
  productBatchSchema,
  uuidSchema 
} from '../schemas/product-schemas';
import { IProduct, IProductDetail } from '../types/product';
import { ApiResponse, PageResponse } from '../types/common';

const productService = new ProductService();

export class ProductController {
  /**
   * @swagger
   * /api/v1/products:
   *   post:
   *     summary: 创建商品
   *     tags: [商品管理]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - categoryId
   *               - price
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *                 description: 商品名称
   *                 example: "Apple iPhone 15 Pro"
   *               categoryId:
   *                 type: string
   *                 format: uuid
   *                 description: 商品分类ID
   *               brand:
   *                 type: string
   *                 maxLength: 50
   *                 description: 品牌名称
   *                 example: "Apple"
   *               description:
   *                 type: string
   *                 description: 商品描述
   *                 example: "最新款iPhone，搭载A17 Pro芯片"
   *               mainImage:
   *                 type: string
   *                 format: uri
   *                 maxLength: 255
   *                 description: 主图URL
   *                 example: "https://example.com/images/iphone15pro.jpg"
   *               price:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 description: 销售价格
   *                 example: 7999.00
   *               marketPrice:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 description: 市场价格
   *                 example: 8999.00
   *               status:
   *                 type: integer
   *                 enum: [0, 1]
   *                 description: 商品状态 0-下架 1-上架
   *                 default: 1
   *               stock:
   *                 type: integer
   *                 minimum: 0
   *                 description: 库存数量
   *                 default: 0
   *               sort:
   *                 type: integer
   *                 minimum: 0
   *                 description: 排序值
   *                 default: 0
   *     responses:
   *       200:
   *         description: 创建成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Product'
   *       400:
   *         description: 参数错误
   *       500:
   *         description: 服务器错误
   */
  async createProduct(ctx: Context, next: Next): Promise<void> {
    try {
      const { error, value } = productCreateSchema.validate(ctx.request.body);
      
      if (error) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: error.details[0].message,
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const product = await productService.createProduct(value);

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '创建商品成功',
        data: product,
        timestamp: Date.now()
      } as ApiResponse<IProduct>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '创建商品失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/products/{id}:
   *   get:
   *     summary: 获取商品详情
   *     tags: [商品管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 商品ID
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/ProductDetail'
   *       404:
   *         description: 商品不存在
   *       500:
   *         description: 服务器错误
   */
  async getProductById(ctx: Context, next: Next): Promise<void> {
    try {
      const { error, value } = uuidSchema.validate(ctx.params);
      
      if (error) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: error.details[0].message,
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const product = await productService.getProductById(value.id);

      if (!product) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '商品不存在',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取商品详情成功',
        data: product,
        timestamp: Date.now()
      } as ApiResponse<IProductDetail>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '获取商品详情失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/products/{id}:
   *   put:
   *     summary: 更新商品信息
   *     tags: [商品管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 商品ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: 商品名称
   *               categoryId:
   *                 type: string
   *                 format: uuid
   *                 description: 商品分类ID
   *               brand:
   *                 type: string
   *                 description: 品牌名称
   *               description:
   *                 type: string
   *                 description: 商品描述
   *               mainImage:
   *                 type: string
   *                 format: uri
   *                 description: 主图URL
   *               price:
   *                 type: number
   *                 format: decimal
   *                 description: 销售价格
   *               marketPrice:
   *                 type: number
   *                 format: decimal
   *                 description: 市场价格
   *               status:
   *                 type: integer
   *                 enum: [0, 1]
   *                 description: 商品状态
   *               stock:
   *                 type: integer
   *                 minimum: 0
   *                 description: 库存数量
   *               sort:
   *                 type: integer
   *                 minimum: 0
   *                 description: 排序值
   *     responses:
   *       200:
   *         description: 更新成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Product'
   *       400:
   *         description: 参数错误
   *       404:
   *         description: 商品不存在
   *       500:
   *         description: 服务器错误
   */
  async updateProduct(ctx: Context, next: Next): Promise<void> {
    try {
      const { error: paramsError, value: paramsValue } = uuidSchema.validate(ctx.params);
      
      if (paramsError) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: paramsError.details[0].message,
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const { error: bodyError, value: bodyValue } = productUpdateSchema.validate(ctx.request.body);
      
      if (bodyError) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: bodyError.details[0].message,
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const product = await productService.updateProduct(paramsValue.id, bodyValue);

      if (!product) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '商品不存在',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '更新商品成功',
        data: product,
        timestamp: Date.now()
      } as ApiResponse<IProduct>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '更新商品失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/products/{id}:
   *   delete:
   *     summary: 删除商品
   *     tags: [商品管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 商品ID
   *     responses:
   *       200:
   *         description: 删除成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: 商品不存在
   *       500:
   *         description: 服务器错误
   */
  async deleteProduct(ctx: Context, next: Next): Promise<void> {
    try {
      const { error, value } = uuidSchema.validate(ctx.params);
      
      if (error) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: error.details[0].message,
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const success = await productService.deleteProduct(value.id);

      if (!success) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '商品不存在',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '删除商品成功',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '删除商品失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/products:
   *   get:
   *     summary: 分页查询商品列表
   *     tags: [商品管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: 页码
   *       - in: query
   *         name: size
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: 每页数量
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *           maxLength: 100
   *         description: 商品名称（模糊搜索）
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 商品分类ID
   *       - in: query
   *         name: brand
   *         schema:
   *           type: string
   *           maxLength: 50
   *         description: 品牌名称
   *       - in: query
   *         name: status
   *         schema:
   *           type: integer
   *           enum: [0, 1]
   *         description: 商品状态 0-下架 1-上架
   *       - in: query
   *         name: minPrice
   *         schema:
   *           type: number
   *           format: decimal
   *           minimum: 0
   *         description: 最低价格
   *       - in: query
   *         name: maxPrice
   *         schema:
   *           type: number
   *           format: decimal
   *           minimum: 0
   *         description: 最高价格
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [name, price, sales, createdAt, updatedAt]
   *           default: createdAt
   *         description: 排序字段
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: 排序方向
   *     responses:
   *       200:
   *         description: 查询成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/PageResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         list:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/Product'
   *                         total:
   *                           type: integer
   *                         page:
   *                           type: integer
   *                         size:
   *                           type: integer
   *                         pages:
   *                           type: integer
   *       400:
   *         description: 参数错误
   *       500:
   *         description: 服务器错误
   */
  async getProductList(ctx: Context, next: Next): Promise<void> {
    try {
      const { error, value } = productQuerySchema.validate(ctx.query);
      
      if (error) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: error.details[0].message,
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const pageData = await productService.getProductList(value);

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取商品列表成功',
        data: pageData,
        timestamp: Date.now()
      } as PageResponse<IProduct>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '获取商品列表失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/products/batch:
   *   post:
   *     summary: 批量操作商品
   *     tags: [商品管理]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ids
   *               - action
   *             properties:
   *               ids:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 description: 商品ID列表
   *                 minItems: 1
   *               action:
   *                 type: string
   *                 enum: [delete, online, offline]
   *                 description: 操作类型 delete-删除 online-上架 offline-下架
   *     responses:
   *       200:
   *         description: 操作完成
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         success:
   *                           type: integer
   *                           description: 成功数量
   *                         failed:
   *                           type: integer
   *                           description: 失败数量
   *       400:
   *         description: 参数错误
   *       500:
   *         description: 服务器错误
   */
  async batchOperateProducts(ctx: Context, next: Next): Promise<void> {
    try {
      const { error, value } = productBatchSchema.validate(ctx.request.body);
      
      if (error) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: error.details[0].message,
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const result = await productService.batchOperateProducts(value.ids, value.action);

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: `批量操作完成，成功${result.success}个，失败${result.failed}个`,
        data: result,
        timestamp: Date.now()
      } as ApiResponse<{ success: number; failed: number }>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '批量操作失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/products/stats:
   *   get:
   *     summary: 获取商品统计信息
   *     tags: [商品管理]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         total:
   *                           type: integer
   *                           description: 商品总数
   *                         online:
   *                           type: integer
   *                           description: 上架商品数
   *                         offline:
   *                           type: integer
   *                           description: 下架商品数
   *                         lowStock:
   *                           type: integer
   *                           description: 低库存商品数
   *       500:
   *         description: 服务器错误
   */
  async getProductStats(ctx: Context, next: Next): Promise<void> {
    try {
      const stats = await productService.getProductStats();

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取商品统计成功',
        data: stats,
        timestamp: Date.now()
      } as ApiResponse<{
        total: number;
        online: number;
        offline: number;
        lowStock: number;
      }>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '获取商品统计失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }
} 