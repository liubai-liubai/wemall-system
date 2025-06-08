/**
 * 商品属性管理控制器
 * 处理商品属性相关的HTTP请求
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { ProductAttributeService } from '../services/product-attribute-service';
import {
  createAttributeSchema,
  updateAttributeSchema,
  attributeQuerySchema,
  attributeIdSchema,
  productIdSchema
} from '../schemas/product-attribute-schemas';
import { ApiResponse, PageResponse } from '../types/common';

export class ProductAttributeController {
  private attributeService: ProductAttributeService;

  constructor() {
    this.attributeService = new ProductAttributeService();
  }

  /**
   * @swagger
   * /api/v1/product-attributes:
   *   post:
   *     summary: 创建商品属性
   *     description: 为指定商品创建新的属性
   *     tags: [商品属性管理]
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
   *               - name
   *               - value
   *             properties:
   *               productId:
   *                 type: string
   *                 format: uuid
   *                 description: 商品ID
   *                 example: "550e8400-e29b-41d4-a716-446655440000"
   *               name:
   *                 type: string
   *                 description: 属性名称
   *                 example: "颜色"
   *               value:
   *                 type: string
   *                 description: 属性值
   *                 example: "红色"
   *     responses:
   *       200:
   *         description: 创建成功
   *       400:
   *         description: 请求参数错误
   *       500:
   *         description: 服务器错误
   */
  async createAttribute(ctx: Context) {
    try {
      const { error, value } = createAttributeSchema.validate(ctx.request.body);
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

      const attribute = await this.attributeService.createAttribute(value);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '商品属性创建成功',
        data: attribute,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '商品属性创建失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/product-attributes/{id}:
   *   get:
   *     summary: 获取商品属性详情
   *     description: 根据ID获取商品属性的详细信息
   *     tags: [商品属性管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 商品属性ID
   *     responses:
   *       200:
   *         description: 获取成功
   *       404:
   *         description: 属性不存在
   *       500:
   *         description: 服务器错误
   */
  async getAttributeById(ctx: Context) {
    try {
      const { error, value } = attributeIdSchema.validate(ctx.params);
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

      const attribute = await this.attributeService.getAttributeById(value.id);
      if (!attribute) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '商品属性不存在',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取商品属性详情成功',
        data: attribute,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '获取商品属性详情失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/product-attributes:
   *   get:
   *     summary: 获取商品属性列表
   *     description: 分页获取商品属性列表，支持多种筛选条件
   *     tags: [商品属性管理]
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
   *         name: name
   *         schema:
   *           type: string
   *         description: 属性名称筛选
   *       - in: query
   *         name: value
   *         schema:
   *           type: string
   *         description: 属性值筛选
   *       - in: query
   *         name: keyword
   *         schema:
   *           type: string
   *         description: 关键词搜索
   *     responses:
   *       200:
   *         description: 获取成功
   *       500:
   *         description: 服务器错误
   */
  async getAttributeList(ctx: Context) {
    try {
      const { error, value } = attributeQuerySchema.validate(ctx.query);
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

      const result = await this.attributeService.getAttributeList(value);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取商品属性列表成功',
        data: result,
        timestamp: Date.now()
      } as PageResponse<any>;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '获取商品属性列表失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/products/{productId}/attributes:
   *   get:
   *     summary: 获取商品的所有属性
   *     description: 获取指定商品的所有属性信息
   *     tags: [商品属性管理]
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
   *         description: 获取成功
   *       404:
   *         description: 商品不存在
   *       500:
   *         description: 服务器错误
   */
  async getAttributesByProductId(ctx: Context) {
    try {
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

      const attributes = await this.attributeService.getAttributesByProductId(value.productId);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取商品属性成功',
        data: attributes,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: err instanceof Error ? err.message : '获取商品属性失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }
} 