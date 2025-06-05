/**
 * 库存管理控制器
 * @author 刘白 & AI Assistant
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StockLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 日志ID
 *         stock_id:
 *           type: string
 *           description: 库存ID
 *         change:
 *           type: integer
 *           description: 变动数量
 *         type:
 *           type: string
 *           enum: [in, out, lock, unlock, adjust]
 *           description: 变动类型
 *         order_id:
 *           type: string
 *           description: 关联订单ID
 *         remark:
 *           type: string
 *           description: 备注
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         product_name:
 *           type: string
 *           description: 商品名称
 *         sku_code:
 *           type: string
 *           description: SKU编码
 */

import { Context } from 'koa';
import { ProductStockService } from '../services/product-stock-service';
import { success } from '../utils/response';
import {
  createStockSchema,
  updateStockSchema,
  stockQuerySchema,
  stockAdjustSchema,
  batchStockAdjustSchema,
  stockLockSchema,
  idSchema,
  stockAvailabilitySchema,
  stockReserveSchema,
  stockLogQuerySchema
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

  /**
   * @swagger
   * /api/v1/product-stocks/adjust:
   *   post:
   *     summary: 库存调整
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
   *               - stock_id
   *               - change
   *               - type
   *             properties:
   *               stock_id:
   *                 type: string
   *                 format: uuid
   *                 description: 库存ID
   *                 example: "stock-uuid-123"
   *               change:
   *                 type: integer
   *                 description: 变动数量（正数为增加，负数为减少）
   *                 example: 10
   *               type:
   *                 type: string
   *                 enum: [in, out, adjust]
   *                 description: 变动类型
   *                 example: "adjust"
   *               order_id:
   *                 type: string
   *                 format: uuid
   *                 description: 关联订单ID（可选）
   *                 example: "order-uuid-123"
   *               remark:
   *                 type: string
   *                 maxLength: 200
   *                 description: 备注信息
   *                 example: "手动调整库存"
   *     responses:
   *       200:
   *         description: 调整成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/StockLog'
   *       400:
   *         description: 参数错误或库存不足
   *       404:
   *         description: 库存记录不存在
   *       401:
   *         description: 未授权
   *       500:
   *         description: 服务器错误
   */
  async adjustStock(ctx: Context): Promise<void> {
    const { error, value } = stockAdjustSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }
    
    const result = await productStockService.adjustStock(value);
    ctx.body = success(result, '库存调整成功');
  }

  /**
   * @swagger
   * /api/v1/product-stocks/batch-adjust:
   *   post:
   *     summary: 批量库存调整
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
   *               - adjustments
   *             properties:
   *               adjustments:
   *                 type: array
   *                 minItems: 1
   *                 maxItems: 50
   *                 description: 调整列表
   *                 items:
   *                   type: object
   *                   required:
   *                     - stock_id
   *                     - change
   *                     - type
   *                   properties:
   *                     stock_id:
   *                       type: string
   *                       format: uuid
   *                       description: 库存ID
   *                     change:
   *                       type: integer
   *                       description: 变动数量
   *                     type:
   *                       type: string
   *                       enum: [in, out, adjust]
   *                       description: 变动类型
   *                     order_id:
   *                       type: string
   *                       format: uuid
   *                       description: 关联订单ID（可选）
   *                     remark:
   *                       type: string
   *                       maxLength: 200
   *                       description: 备注信息
   *                 example:
   *                   - stock_id: "stock-uuid-1"
   *                     change: 10
   *                     type: "in"
   *                     remark: "采购入库"
   *                   - stock_id: "stock-uuid-2"
   *                     change: -5
   *                     type: "out"
   *                     remark: "损耗出库"
   *     responses:
   *       200:
   *         description: 批量调整成功
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
   *                         $ref: '#/components/schemas/StockLog'
   *       400:
   *         description: 参数错误或库存不足
   *       404:
   *         description: 库存记录不存在
   *       401:
   *         description: 未授权
   *       500:
   *         description: 服务器错误
   */
  async batchAdjustStock(ctx: Context): Promise<void> {
    const { error, value } = batchStockAdjustSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }
    
         const result = await productStockService.batchAdjustStock(value);
     ctx.body = success(result, `批量库存调整成功，共处理${result.length}条记录`);
   }

   /**
    * @swagger
    * /api/v1/product-stocks/lock:
    *   post:
    *     summary: 库存锁定
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
    *               - stock_id
    *               - quantity
    *             properties:
    *               stock_id:
    *                 type: string
    *                 format: uuid
    *                 description: 可销售库存ID
    *                 example: "stock-uuid-123"
    *               quantity:
    *                 type: integer
    *                 minimum: 1
    *                 description: 锁定数量
    *                 example: 5
    *               order_id:
    *                 type: string
    *                 format: uuid
    *                 description: 关联订单ID（可选）
    *                 example: "order-uuid-123"
    *     responses:
    *       200:
    *         description: 锁定成功
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/ApiResponse'
    *       400:
    *         description: 参数错误或库存不足
    *       404:
    *         description: 库存记录不存在
    *       401:
    *         description: 未授权
    *       500:
    *         description: 服务器错误
    */
   async lockStock(ctx: Context): Promise<void> {
     const { error, value } = stockLockSchema.validate(ctx.request.body);
     if (error) {
       ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
     }
     
     await productStockService.lockStock(value.stock_id, value.quantity, value.order_id);
     ctx.body = success(null, '库存锁定成功');
   }

   /**
    * @swagger
    * /api/v1/product-stocks/unlock:
    *   post:
    *     summary: 库存解锁
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
    *               - stock_id
    *               - quantity
    *             properties:
    *               stock_id:
    *                 type: string
    *                 format: uuid
    *                 description: 锁定库存ID
    *                 example: "locked-stock-uuid-123"
    *               quantity:
    *                 type: integer
    *                 minimum: 1
    *                 description: 解锁数量
    *                 example: 3
    *               order_id:
    *                 type: string
    *                 format: uuid
    *                 description: 关联订单ID（可选）
    *                 example: "order-uuid-123"
    *     responses:
    *       200:
    *         description: 解锁成功
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/ApiResponse'
    *       400:
    *         description: 参数错误或锁定库存不足
    *       404:
    *         description: 锁定库存记录不存在
    *       401:
    *         description: 未授权
    *       500:
    *         description: 服务器错误
    */
   async unlockStock(ctx: Context): Promise<void> {
     const { error, value } = stockLockSchema.validate(ctx.request.body);
     if (error) {
       ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
     }
     
           await productStockService.unlockStock(value.stock_id, value.quantity, value.order_id);
      ctx.body = success(null, '库存解锁成功');
    }

    /**
     * @swagger
     * /api/v1/product-stocks/alerts:
     *   get:
     *     summary: 获取库存预警信息
     *     tags: [库存管理]
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
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             description: 库存ID
     *                           product_id:
     *                             type: string
     *                             description: 商品ID
     *                           product_name:
     *                             type: string
     *                             description: 商品名称
     *                           sku_id:
     *                             type: string
     *                             description: SKU ID
     *                           sku_name:
     *                             type: string
     *                             description: SKU编码
     *                           current_quantity:
     *                             type: integer
     *                             description: 当前库存
     *                           warning_line:
     *                             type: integer
     *                             description: 预警线
     *                           shortage:
     *                             type: integer
     *                             description: 缺货数量
     *                           alert_level:
     *                             type: string
     *                             enum: [warning, critical]
     *                             description: 预警级别
     *       401:
     *         description: 未授权
     *       500:
     *         description: 服务器错误
     */
    async getStockAlerts(ctx: Context): Promise<void> {
      const result = await productStockService.getStockAlerts();
      ctx.body = success(result, '获取库存预警信息成功');
    }

    /**
     * @swagger
     * /api/v1/product-stocks/low-stocks:
     *   get:
     *     summary: 获取低库存列表
     *     tags: [库存管理]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: warning_line
     *         in: query
     *         schema:
     *           type: integer
     *           minimum: 0
     *         description: 预警线阈值（可选，不传则使用各商品自身的预警线）
     *         example: 10
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
    async getLowStocks(ctx: Context): Promise<void> {
      const warningLine = ctx.query.warning_line ? parseInt(ctx.query.warning_line as string) : undefined;
      
      if (warningLine !== undefined && (isNaN(warningLine) || warningLine < 0)) {
        ctx.throw(400, '预警线参数必须是非负整数');
      }
      
      const result = await productStockService.getLowStocks(warningLine);
      ctx.body = success(result, '获取低库存列表成功');
    }

    /**
     * @swagger
     * /api/v1/product-stocks/stats:
     *   get:
     *     summary: 获取库存统计信息
     *     tags: [库存管理]
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
     *                         total_stocks:
     *                           type: integer
     *                           description: 总库存记录数
     *                         total_quantity:
     *                           type: integer
     *                           description: 总库存数量
     *                         low_stock_count:
     *                           type: integer
     *                           description: 低库存商品数
     *                         out_of_stock_count:
     *                           type: integer
     *                           description: 缺货商品数
     *                         warning_count:
     *                           type: integer
     *                           description: 需要预警的商品数
     *                         by_stock_type:
     *                           type: object
     *                           properties:
     *                             sellable:
     *                               type: integer
     *                               description: 可销售库存数量
     *                             locked:
     *                               type: integer
     *                               description: 锁定库存数量
     *                             warning:
     *                               type: integer
     *                               description: 预警库存数量
     *                         recent_adjustments:
     *                           type: integer
     *                           description: 最近7天调整次数
     *                         top_products:
     *                           type: array
     *                           description: 库存最多的前5个商品
     *                           items:
     *                             type: object
     *                             properties:
     *                               product_id:
     *                                 type: string
     *                                 description: 商品ID
     *                               product_name:
     *                                 type: string
     *                                 description: 商品名称
     *                               total_quantity:
     *                                 type: integer
     *                                 description: 库存数量
     *       401:
     *         description: 未授权
     *       500:
     *         description: 服务器错误
     */
         async getStats(ctx: Context): Promise<void> {
       const result = await productStockService.getStats();
       ctx.body = success(result, '获取库存统计信息成功');
     }

     /**
      * @swagger
      * /api/v1/product-stocks/check-availability:
      *   post:
      *     summary: 检查库存可用性
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
      *               - sku_id
      *               - quantity
      *             properties:
      *               sku_id:
      *                 type: string
      *                 format: uuid
      *                 description: SKU ID
      *                 example: "sku-uuid-123"
      *               quantity:
      *                 type: integer
      *                 minimum: 1
      *                 description: 需要检查的数量
      *                 example: 5
      *     responses:
      *       200:
      *         description: 检查成功
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
      *                         available:
      *                           type: boolean
      *                           description: 是否有足够库存
      *                         sku_id:
      *                           type: string
      *                           description: SKU ID
      *                         quantity:
      *                           type: integer
      *                           description: 检查数量
      *       400:
      *         description: 参数错误
      *       401:
      *         description: 未授权
      *       500:
      *         description: 服务器错误
      */
     async checkStockAvailability(ctx: Context): Promise<void> {
       const { error, value } = stockAvailabilitySchema.validate(ctx.request.body);
       if (error) {
         ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
       }
       
       const available = await productStockService.checkStockAvailability(value.sku_id, value.quantity);
       ctx.body = success({ 
         available, 
         sku_id: value.sku_id, 
         quantity: value.quantity 
       }, '库存可用性检查完成');
     }

     /**
      * @swagger
      * /api/v1/product-stocks/reserve:
      *   post:
      *     summary: 库存预留（下单时使用）
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
      *               - sku_id
      *               - quantity
      *               - order_id
      *             properties:
      *               sku_id:
      *                 type: string
      *                 format: uuid
      *                 description: SKU ID
      *                 example: "sku-uuid-123"
      *               quantity:
      *                 type: integer
      *                 minimum: 1
      *                 description: 预留数量
      *                 example: 3
      *               order_id:
      *                 type: string
      *                 format: uuid
      *                 description: 订单ID
      *                 example: "order-uuid-123"
      *     responses:
      *       200:
      *         description: 预留成功
      *         content:
      *           application/json:
      *             schema:
      *               $ref: '#/components/schemas/ApiResponse'
      *       400:
      *         description: 参数错误或库存不足
      *       404:
      *         description: SKU不存在
      *       401:
      *         description: 未授权
      *       500:
      *         description: 服务器错误
      */
     async reserveStock(ctx: Context): Promise<void> {
       const { error, value } = stockReserveSchema.validate(ctx.request.body);
       if (error) {
         ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
       }
       
       await productStockService.reserveStock(value.sku_id, value.quantity, value.order_id);
       ctx.body = success(null, '库存预留成功');
     }

     /**
      * @swagger
      * /api/v1/product-stocks/release:
      *   post:
      *     summary: 库存释放（取消订单时使用）
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
      *               - sku_id
      *               - quantity
      *               - order_id
      *             properties:
      *               sku_id:
      *                 type: string
      *                 format: uuid
      *                 description: SKU ID
      *                 example: "sku-uuid-123"
      *               quantity:
      *                 type: integer
      *                 minimum: 1
      *                 description: 释放数量
      *                 example: 3
      *               order_id:
      *                 type: string
      *                 format: uuid
      *                 description: 订单ID
      *                 example: "order-uuid-123"
      *     responses:
      *       200:
      *         description: 释放成功
      *         content:
      *           application/json:
      *             schema:
      *               $ref: '#/components/schemas/ApiResponse'
      *       400:
      *         description: 参数错误或锁定库存不足
      *       404:
      *         description: 订单或库存记录不存在
      *       401:
      *         description: 未授权
      *       500:
      *         description: 服务器错误
      */
     async releaseStock(ctx: Context): Promise<void> {
       const { error, value } = stockReserveSchema.validate(ctx.request.body);
       if (error) {
         ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
       }
       
       await productStockService.releaseStock(value.sku_id, value.quantity, value.order_id);
       ctx.body = success(null, '库存释放成功');
     }

     /**
      * @swagger
      * /api/v1/product-stocks/logs:
      *   get:
      *     summary: 分页查询库存日志
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
      *       - name: stock_id
      *         in: query
      *         schema:
      *           type: string
      *         description: 库存ID
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
      *       - name: type
      *         in: query
      *         schema:
      *           type: string
      *           enum: [in, out, lock, unlock, adjust]
      *         description: 变动类型
      *       - name: order_id
      *         in: query
      *         schema:
      *           type: string
      *         description: 订单ID
      *       - name: start_date
      *         in: query
      *         schema:
      *           type: string
      *           format: date-time
      *         description: 开始日期
      *       - name: end_date
      *         in: query
      *         schema:
      *           type: string
      *           format: date-time
      *         description: 结束日期
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
      *                             $ref: '#/components/schemas/StockLog'
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
     async getStockLogs(ctx: Context): Promise<void> {
       const { error, value } = stockLogQuerySchema.validate(ctx.query);
       if (error) {
         ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
       }
       
       const result = await productStockService.getStockLogs(value);
       ctx.body = success(result, '获取库存日志成功');
     }

     /**
      * @swagger
      * /api/v1/product-stocks/{id}/history:
      *   get:
      *     summary: 获取指定库存的历史记录
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
      *               allOf:
      *                 - $ref: '#/components/schemas/ApiResponse'
      *                 - type: object
      *                   properties:
      *                     data:
      *                       type: array
      *                       items:
      *                         $ref: '#/components/schemas/StockLog'
      *       404:
      *         description: 库存记录不存在
      *       401:
      *         description: 未授权
      *       500:
      *         description: 服务器错误
      */
     async getStockHistory(ctx: Context): Promise<void> {
       const { error, value } = idSchema.validate(ctx.params.id);
       if (error) {
         ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
       }
       
       const result = await productStockService.getStockHistory(value);
       ctx.body = success(result, '获取库存历史记录成功');
     }
   } 