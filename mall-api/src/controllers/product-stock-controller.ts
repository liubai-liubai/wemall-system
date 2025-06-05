/**
 * 库存管理控制器
 * @author 刘白 & AI Assistant
 */

import { Context } from 'koa';
import { ProductStockService } from '../services/product-stock-service';
import { success } from '../utils/response';
import {
  createStockSchema,
  updateStockSchema,
  stockQuerySchema,
  idSchema
} from '../schemas/product-stock-schemas';

const productStockService = new ProductStockService();

export class ProductStockController {

  /**
   * @swagger
   * /api/v1/product-stocks:
   *   post:
   *     summary: 创建库存记录
   *     tags: [库存管理]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - product_id
   *               - sku_id
   *             properties:
   *               product_id:
   *                 type: string
   *                 description: 商品ID
   *                 example: "product-uuid-123"
   *               sku_id:
   *                 type: string
   *                 description: SKU ID
   *                 example: "sku-uuid-123"
   *               warehouse_id:
   *                 type: string
   *                 description: 仓库ID（可选）
   *                 example: "warehouse-uuid-123"
   *               stock_type:
   *                 type: string
   *                 enum: [sellable, locked, warning]
   *                 description: 库存类型
   *                 example: "sellable"
   *               quantity:
   *                 type: integer
   *                 minimum: 0
   *                 description: 库存数量
   *                 example: 100
   *               warning_line:
   *                 type: integer
   *                 minimum: 0
   *                 description: 预警线
   *                 example: 10
   *     responses:
   *       200:
   *         description: 创建成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: 参数错误
   *       401:
   *         description: 未授权
   *       500:
   *         description: 服务器错误
   */
  async create(ctx: Context): Promise<void> {
    const { error, value } = createStockSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }
    
    const result = await productStockService.create(value);
    ctx.body = success(result, '创建库存记录成功');
  }

  /**
   * @swagger
   * /api/v1/product-stocks/{id}:
   *   get:
   *     summary: 根据ID获取库存信息
   *     tags: [库存管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *         description: 库存ID
   *         example: "stock-uuid-123"
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: 库存记录不存在
   *       401:
   *         description: 未授权
   *       500:
   *         description: 服务器错误
   */
  async getById(ctx: Context): Promise<void> {
    const { error, value } = idSchema.validate(ctx.params.id);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }
    
    const result = await productStockService.findById(value);
    
    if (!result) {
      ctx.status = 404;
      ctx.body = success(null, '库存记录不存在');
      return;
    }
    
    ctx.body = success(result, '获取库存信息成功');
  }

  /**
   * @swagger
   * /api/v1/product-stocks/{id}:
   *   put:
   *     summary: 更新库存信息
   *     tags: [库存管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *         description: 库存ID
   *         example: "stock-uuid-123"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               quantity:
   *                 type: integer
   *                 minimum: 0
   *                 description: 库存数量
   *                 example: 200
   *               warning_line:
   *                 type: integer
   *                 minimum: 0
   *                 description: 预警线
   *                 example: 20
   *               stock_type:
   *                 type: string
   *                 enum: [sellable, locked, warning]
   *                 description: 库存类型
   *                 example: "sellable"
   *     responses:
   *       200:
   *         description: 更新成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: 参数错误
   *       404:
   *         description: 库存记录不存在
   *       401:
   *         description: 未授权
   *       500:
   *         description: 服务器错误
   */
  async update(ctx: Context): Promise<void> {
    const { error: idError, value: id } = idSchema.validate(ctx.params.id);
    if (idError) {
      ctx.throw(400, `参数验证失败: ${idError.details[0].message}`);
    }
    
    const { error: bodyError, value: data } = updateStockSchema.validate(ctx.request.body);
    if (bodyError) {
      ctx.throw(400, `参数验证失败: ${bodyError.details[0].message}`);
    }
    
    const result = await productStockService.update(id, data);
    ctx.body = success(result, '更新库存信息成功');
  }

  /**
   * @swagger
   * /api/v1/product-stocks/{id}:
   *   delete:
   *     summary: 删除库存记录
   *     tags: [库存管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *         description: 库存ID
   *         example: "stock-uuid-123"
   *     responses:
   *       200:
   *         description: 删除成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: 库存记录不存在
   *       401:
   *         description: 未授权
   *       500:
   *         description: 服务器错误
   */
  async delete(ctx: Context): Promise<void> {
    const { error, value } = idSchema.validate(ctx.params.id);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }
    
    await productStockService.delete(value);
    ctx.body = success(null, '删除库存记录成功');
  }

  /**
   * @swagger
   * /api/v1/product-stocks:
   *   get:
   *     summary: 分页查询库存列表
   *     tags: [库存管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: page
   *         in: query
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: 页码
   *       - name: size
   *         in: query
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: 每页数量
   *       - name: product_id
   *         in: query
   *         schema:
   *           type: string
   *         description: 商品ID
   *       - name: sku_id
   *         in: query
   *         schema:
   *           type: string
   *         description: SKU ID
   *       - name: warehouse_id
   *         in: query
   *         schema:
   *           type: string
   *         description: 仓库ID
   *       - name: stock_type
   *         in: query
   *         schema:
   *           type: string
   *           enum: [sellable, locked, warning]
   *         description: 库存类型
   *       - name: low_stock
   *         in: query
   *         schema:
   *           type: boolean
   *         description: 是否查询低库存
   *       - name: keyword
   *         in: query
   *         schema:
   *           type: string
   *         description: 搜索关键词（商品名称、SKU编码）
   *       - name: sort_by
   *         in: query
   *         schema:
   *           type: string
   *           enum: [quantity, warning_line, updated_at, created_at]
   *           default: updated_at
   *         description: 排序字段
   *       - name: sort_order
   *         in: query
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
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         list:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ProductStock'
   *                         total:
   *                           type: integer
   *                         page:
   *                           type: integer
   *                         size:
   *                           type: integer
   *                         pages:
   *                           type: integer
   *       401:
   *         description: 未授权
   *       500:
   *         description: 服务器错误
   */
  async getList(ctx: Context): Promise<void> {
    const { error, value } = stockQuerySchema.validate(ctx.query);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }
    
    const result = await productStockService.findWithPagination(value);
    ctx.body = success(result, '获取库存列表成功');
  }

  /**
   * @swagger
   * /api/v1/skus/{skuId}/stock:
   *   get:
   *     summary: 根据SKU获取库存信息
   *     tags: [库存管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: skuId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *         description: SKU ID
   *         example: "sku-uuid-123"
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: 库存记录不存在
   *       401:
   *         description: 未授权
   *       500:
   *         description: 服务器错误
   */
  async getBySku(ctx: Context): Promise<void> {
    const { error, value } = idSchema.validate(ctx.params.skuId);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }
    
    const result = await productStockService.findBySku(value);
    
    if (!result) {
      ctx.status = 404;
      ctx.body = success(null, '该SKU暂无库存记录');
      return;
    }
    
    ctx.body = success(result, '获取SKU库存信息成功');
  }

  /**
   * @swagger
   * /api/v1/products/{productId}/stocks:
   *   get:
   *     summary: 根据商品获取所有库存信息
   *     tags: [库存管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: productId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *         description: 商品ID
   *         example: "product-uuid-123"
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
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/ProductStock'
   *       401:
   *         description: 未授权
   *       500:
   *         description: 服务器错误
   */
  async getByProduct(ctx: Context): Promise<void> {
    const { error, value } = idSchema.validate(ctx.params.productId);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }
    
    const result = await productStockService.findByProduct(value);
    ctx.body = success(result, '获取商品库存信息成功');
  }
} 