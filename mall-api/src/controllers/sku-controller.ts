/**
 * SKU管理控制器
 * 负责处理SKU相关的HTTP请求
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { SkuService } from '../services/sku-service';
import {
  skuCreateSchema,
  skuUpdateSchema,
  skuQuerySchema,
  skuBatchSchema,
  skuStockAdjustSchema,
  skuIdSchema,
  productIdSchema
} from '../schemas/sku-schemas';
import { ApiResponse, PageResponse } from '../types/common';

export class SkuController {
  private skuService: SkuService;

  constructor() {
    this.skuService = new SkuService();
  }

  /**
   * @swagger
   * /api/v1/skus:
   *   post:
   *     summary: 创建SKU
   *     description: 为商品创建新的SKU（规格库存单位）
   *     tags: [SKU管理]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - productId
   *               - skuCode
   *               - price
   *             properties:
   *               productId:
   *                 type: string
   *                 format: uuid
   *                 description: 商品ID
   *                 example: "550e8400-e29b-41d4-a716-446655440000"
   *               skuCode:
   *                 type: string
   *                 description: SKU编码（唯一）
   *                 example: "iPhone15Pro-128GB-Gold"
   *               price:
   *                 type: number
   *                 format: decimal
   *                 description: SKU价格
   *                 example: 7999.00
   *               stock:
   *                 type: integer
   *                 description: 初始库存数量
   *                 default: 0
   *                 example: 100
   *               attributes:
   *                 type: object
   *                 description: SKU属性（颜色、尺寸等）
   *                 example: { "color": "金色", "storage": "128GB", "model": "Pro" }
   *               status:
   *                 type: integer
   *                 enum: [0, 1]
   *                 description: 状态（0=禁用 1=启用）
   *                 default: 1
   *     responses:
   *       200:
   *         description: SKU创建成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SkuDetail'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async createSku(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = skuCreateSchema.validate(ctx.request.body);
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

      const sku = await this.skuService.createSku(value);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: 'SKU创建成功',
        data: sku,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : 'SKU创建失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/skus/{id}:
   *   get:
   *     summary: 获取SKU详情
   *     description: 根据ID获取SKU的详细信息
   *     tags: [SKU管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: SKU ID
   *         example: "550e8400-e29b-41d4-a716-446655440001"
   *     responses:
   *       200:
   *         description: 获取SKU详情成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SkuDetail'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getSkuById(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = skuIdSchema.validate(ctx.params);
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

      const sku = await this.skuService.getSkuById(value.id);
      if (!sku) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: 'SKU不存在',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取SKU详情成功',
        data: sku,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '获取SKU详情失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/skus/{id}:
   *   put:
   *     summary: 更新SKU
   *     description: 更新SKU的信息
   *     tags: [SKU管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: SKU ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               skuCode:
   *                 type: string
   *                 description: SKU编码
   *                 example: "iPhone15Pro-256GB-Gold"
   *               price:
   *                 type: number
   *                 format: decimal
   *                 description: SKU价格
   *                 example: 8999.00
   *               stock:
   *                 type: integer
   *                 description: 库存数量
   *                 example: 150
   *               attributes:
   *                 type: object
   *                 description: SKU属性
   *                 example: { "color": "金色", "storage": "256GB", "model": "Pro" }
   *               status:
   *                 type: integer
   *                 enum: [0, 1]
   *                 description: 状态（0=禁用 1=启用）
   *     responses:
   *       200:
   *         description: SKU更新成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SkuDetail'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async updateSku(ctx: Context) {
    try {
      // 验证路径参数
      const { error: paramsError, value: params } = skuIdSchema.validate(ctx.params);
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

      // 验证请求体
      const { error: bodyError, value: body } = skuUpdateSchema.validate(ctx.request.body);
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

      const sku = await this.skuService.updateSku(params.id, body);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: 'SKU更新成功',
        data: sku,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : 'SKU更新失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/skus/{id}:
   *   delete:
   *     summary: 删除SKU
   *     description: 删除指定的SKU（软删除）
   *     tags: [SKU管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: SKU ID
   *     responses:
   *       200:
   *         description: SKU删除成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async deleteSku(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = skuIdSchema.validate(ctx.params);
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

      await this.skuService.deleteSku(value.id);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: 'SKU删除成功',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : 'SKU删除失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/skus:
   *   get:
   *     summary: 获取SKU列表
   *     description: 分页获取SKU列表，支持多种筛选条件
   *     tags: [SKU管理]
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
   *           default: 20
   *         description: 每页数量
   *       - in: query
   *         name: productId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 商品ID筛选
   *       - in: query
   *         name: skuCode
   *         schema:
   *           type: string
   *         description: SKU编码筛选（模糊匹配）
   *       - in: query
   *         name: status
   *         schema:
   *           type: integer
   *           enum: [0, 1]
   *         description: 状态筛选
   *       - in: query
   *         name: minPrice
   *         schema:
   *           type: number
   *         description: 最小价格
   *       - in: query
   *         name: maxPrice
   *         schema:
   *           type: number
   *         description: 最大价格
   *       - in: query
   *         name: lowStock
   *         schema:
   *           type: integer
   *         description: 低库存阈值（显示库存小于等于此值的SKU）
   *     responses:
   *       200:
   *         description: 获取SKU列表成功
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
   *                         list:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/SkuList'
   *                         total:
   *                           type: integer
   *                         page:
   *                           type: integer
   *                         size:
   *                           type: integer
   *                         pages:
   *                           type: integer
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getSkuList(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = skuQuerySchema.validate(ctx.query);
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

      const result = await this.skuService.getSkuList(value);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取SKU列表成功',
        data: result,
        timestamp: Date.now()
      } as PageResponse<any>;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '获取SKU列表失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/products/{productId}/skus:
   *   get:
   *     summary: 获取商品的所有SKU
   *     description: 获取指定商品的所有SKU信息
   *     tags: [SKU管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 商品ID
   *     responses:
   *       200:
   *         description: 获取商品SKU成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/SkuDetail'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getSkusByProductId(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = productIdSchema.validate(ctx.params);
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

      const skus = await this.skuService.getSkusByProductId(value.productId);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取商品SKU成功',
        data: skus,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '获取商品SKU失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/skus/stats:
   *   get:
   *     summary: 获取SKU库存统计
   *     description: 获取SKU的库存统计信息
   *     tags: [SKU管理]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 获取库存统计成功
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
   *                         totalSkus:
   *                           type: integer
   *                           description: 总SKU数量
   *                         activeSkus:
   *                           type: integer
   *                           description: 启用的SKU数量
   *                         lowStockSkus:
   *                           type: integer
   *                           description: 低库存SKU数量
   *                         outOfStockSkus:
   *                           type: integer
   *                           description: 缺货SKU数量
   *                         totalStockValue:
   *                           type: number
   *                           description: 总库存价值
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getSkuStockStats(ctx: Context) {
    try {
      const stats = await this.skuService.getSkuStockStats();
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取库存统计成功',
        data: stats,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '获取库存统计失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/skus/batch:
   *   post:
   *     summary: 批量操作SKU
   *     description: 批量删除、启用、禁用SKU或调整库存
   *     tags: [SKU管理]
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
   *               - operation
   *             properties:
   *               ids:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 description: SKU ID列表
   *                 example: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]
   *               operation:
   *                 type: string
   *                 enum: ["delete", "enable", "disable", "adjustStock"]
   *                 description: 操作类型
   *               stockChange:
   *                 type: integer
   *                 description: 库存调整数量（operation为adjustStock时必需）
   *                 example: 10
   *     responses:
   *       200:
   *         description: 批量操作成功
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
   *                         successCount:
   *                           type: integer
   *                           description: 成功处理的数量
   *                         failureCount:
   *                           type: integer
   *                           description: 失败处理的数量
   *                         failures:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: string
   *                               error:
   *                                 type: string
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async batchOperateSkus(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = skuBatchSchema.validate(ctx.request.body);
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

      const result = await this.skuService.batchOperateSkus(value);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '批量操作成功',
        data: result,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '批量操作失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/skus/{id}/stock:
   *   post:
   *     summary: 调整SKU库存
   *     description: 调整指定SKU的库存数量
   *     tags: [SKU管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: SKU ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - type
   *               - quantity
   *             properties:
   *               type:
   *                 type: string
   *                 enum: ["increase", "decrease", "set"]
   *                 description: 调整类型（增加、减少、设置）
   *               quantity:
   *                 type: integer
   *                 minimum: 0
   *                 description: 调整数量
   *                 example: 50
   *               reason:
   *                 type: string
   *                 description: 调整原因
   *                 example: "入库补货"
   *     responses:
   *       200:
   *         description: 库存调整成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SkuDetail'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async adjustSkuStock(ctx: Context) {
    try {
      // 验证路径参数
      const { error: paramsError, value: params } = skuIdSchema.validate(ctx.params);
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

      // 验证请求体
      const { error: bodyError, value: body } = skuStockAdjustSchema.validate(ctx.request.body);
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

      const sku = await this.skuService.adjustSkuStock(params.id, body);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '库存调整成功',
        data: sku,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '库存调整失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     SkuDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: SKU ID
 *         productId:
 *           type: string
 *           format: uuid
 *           description: 商品ID
 *         skuCode:
 *           type: string
 *           description: SKU编码
 *         price:
 *           type: number
 *           format: decimal
 *           description: SKU价格
 *         stock:
 *           type: integer
 *           description: 库存数量
 *         attributes:
 *           type: object
 *           description: SKU属性
 *         status:
 *           type: integer
 *           enum: [0, 1]
 *           description: 状态（0=禁用 1=启用）
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         product:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: 商品ID
 *             name:
 *               type: string
 *               description: 商品名称
 *             categoryId:
 *               type: string
 *               format: uuid
 *               description: 分类ID
 *             status:
 *               type: integer
 *               description: 商品状态
 *
 *     SkuListResponse:
 *       type: object
 *       properties:
 *         list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SkuDetail'
 *         total:
 *           type: integer
 *           description: 总数量
 *         page:
 *           type: integer
 *           description: 当前页码
 *         size:
 *           type: integer
 *           description: 每页数量
 *         pages:
 *           type: integer
 *           description: 总页数
 */ 