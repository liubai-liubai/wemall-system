/**
 * 商品图片控制器
 * @author 刘白 & AI Assistant
 */

import { Context } from 'koa';
import { ProductImageService } from '../services/product-image-service';
import { success } from '../utils/response';
import {
  createProductImageSchema,
  updateProductImageSchema,
  batchCreateProductImageSchema,
  batchUpdateSortSchema,
  queryProductImageSchema,
  batchDeleteSchema,
  idSchema,
  setMainImageSchema,
  reorderImagesSchema
} from '../schemas/product-image-schemas';

const productImageService = new ProductImageService();

export class ProductImageController {

  /**
   * @swagger
   * /api/v1/product-images:
   *   post:
   *     summary: 创建商品图片
   *     description: 为商品添加一张图片
   *     tags: [商品图片]
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
   *               - url
   *             properties:
   *               product_id:
   *                 type: string
   *                 format: uuid
   *                 description: 商品ID
   *                 example: "123e4567-e89b-12d3-a456-426614174000"
   *               url:
   *                 type: string
   *                 format: uri
   *                 description: 图片URL地址
   *                 example: "https://example.com/images/product1.jpg"
   *               type:
   *                 type: string
   *                 enum: [main, detail, sku]
   *                 description: 图片类型
   *                 default: "main"
   *                 example: "main"
   *               sort:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 999
   *                 description: 排序序号
   *                 default: 0
   *                 example: 1
   *     responses:
   *       201:
   *         description: 图片创建成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: "图片创建成功"
   *                 data:
   *                   $ref: '#/components/schemas/ProductImageResponse'
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async create(ctx: Context): Promise<void> {
    const { error, value } = createProductImageSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    try {
      const image = await productImageService.create(value);
      ctx.body = success(image, '图片创建成功');
    } catch (err: any) {
      if (err.message === '商品不存在') {
        ctx.throw(404, err.message);
      }
      throw err;
    }
  }

  /**
   * @swagger
   * /api/v1/product-images/{id}:
   *   get:
   *     summary: 获取图片详情
   *     description: 根据ID获取商品图片的详细信息
   *     tags: [商品图片]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 图片ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
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
   *                   $ref: '#/components/schemas/ProductImageResponse'
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async findById(ctx: Context): Promise<void> {
    const { error, value } = idSchema.validate(ctx.params.id);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    const image = await productImageService.findById(value);
    if (!image) {
      ctx.throw(404, '图片不存在');
    }

    ctx.body = success(image, '获取成功');
  }

  /**
   * @swagger
   * /api/v1/product-images/{id}:
   *   put:
   *     summary: 更新图片信息
   *     description: 更新商品图片的信息
   *     tags: [商品图片]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 图片ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               url:
   *                 type: string
   *                 format: uri
   *                 description: 图片URL地址
   *                 example: "https://example.com/images/product1-updated.jpg"
   *               type:
   *                 type: string
   *                 enum: [main, detail, sku]
   *                 description: 图片类型
   *                 example: "detail"
   *               sort:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 999
   *                 description: 排序序号
   *                 example: 2
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
   *                   $ref: '#/components/schemas/ProductImageResponse'
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async update(ctx: Context): Promise<void> {
    const { error: idError, value: id } = idSchema.validate(ctx.params.id);
    if (idError) {
      ctx.throw(400, `ID参数验证失败: ${idError.details[0].message}`);
    }

    const { error, value } = updateProductImageSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    try {
      const image = await productImageService.update(id, value);
      ctx.body = success(image, '更新成功');
    } catch (err: any) {
      if (err.message === '图片不存在') {
        ctx.throw(404, err.message);
      }
      throw err;
    }
  }

  /**
   * @swagger
   * /api/v1/product-images/{id}:
   *   delete:
   *     summary: 删除图片
   *     description: 删除指定的商品图片
   *     tags: [商品图片]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 图片ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       204:
   *         description: 删除成功
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async delete(ctx: Context): Promise<void> {
    const { error, value } = idSchema.validate(ctx.params.id);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    try {
      await productImageService.delete(value);
      ctx.body = success(null, '删除成功');
    } catch (err: any) {
      if (err.message === '图片不存在') {
        ctx.throw(404, err.message);
      }
      throw err;
    }
  }

  /**
   * @swagger
   * /api/v1/product-images:
   *   get:
   *     summary: 获取图片列表
   *     description: 分页获取商品图片列表，支持多种筛选条件
   *     tags: [商品图片]
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
   *         example: 1
   *       - in: query
   *         name: size
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: 每页数量
   *         example: 10
   *       - in: query
   *         name: product_id
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 商品ID筛选
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [main, detail, sku]
   *         description: 图片类型筛选
   *         example: "main"
   *       - in: query
   *         name: keyword
   *         schema:
   *           type: string
   *           maxLength: 50
   *         description: 关键词搜索（图片URL或商品名称）
   *         example: "产品"
   *       - in: query
   *         name: sort_by
   *         schema:
   *           type: string
   *           enum: [sort, created_at]
   *           default: sort
   *         description: 排序字段
   *         example: "sort"
   *       - in: query
   *         name: sort_order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *         description: 排序方向
   *         example: "asc"
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
   *                   $ref: '#/components/schemas/ProductImagePageResponse'
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  async findWithPagination(ctx: Context): Promise<void> {
    const { error, value } = queryProductImageSchema.validate(ctx.query);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    const result = await productImageService.findWithPagination(value);
    ctx.body = success(result, '获取成功');
  }

  /**
   * @swagger
   * /api/v1/products/{productId}/images:
   *   get:
   *     summary: 获取商品图片
   *     description: 获取指定商品的所有图片或特定类型的图片
   *     tags: [商品图片]
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
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [main, detail, sku]
   *         description: 图片类型筛选
   *         example: "main"
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
   *                     $ref: '#/components/schemas/ProductImageResponse'
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async findByProductId(ctx: Context): Promise<void> {
    const { error, value: productId } = idSchema.validate(ctx.params.productId);
    if (error) {
      ctx.throw(400, `商品ID参数验证失败: ${error.details[0].message}`);
    }

    const type = ctx.query.type as string;
    if (type && !['main', 'detail', 'sku'].includes(type)) {
      ctx.throw(400, '图片类型参数无效');
    }

    try {
      const images = await productImageService.findByProductId(productId, type);
      ctx.body = success(images, '获取成功');
    } catch (err: any) {
      if (err.message === '商品不存在') {
        ctx.throw(404, err.message);
      }
      throw err;
    }
  }

  /**
   * @swagger
   * /api/v1/product-images/batch:
   *   post:
   *     summary: 批量创建图片
   *     description: 为商品批量添加多张图片
   *     tags: [商品图片]
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
   *               - images
   *             properties:
   *               product_id:
   *                 type: string
   *                 format: uuid
   *                 description: 商品ID
   *                 example: "123e4567-e89b-12d3-a456-426614174000"
   *               images:
   *                 type: array
   *                 minItems: 1
   *                 maxItems: 20
   *                 description: 图片列表
   *                 items:
   *                   type: object
   *                   required:
   *                     - url
   *                   properties:
   *                     url:
   *                       type: string
   *                       format: uri
   *                       description: 图片URL地址
   *                       example: "https://example.com/images/product1.jpg"
   *                     type:
   *                       type: string
   *                       enum: [main, detail, sku]
   *                       description: 图片类型
   *                       default: "main"
   *                       example: "detail"
   *                     sort:
   *                       type: integer
   *                       minimum: 0
   *                       maximum: 999
   *                       description: 排序序号
   *                       default: 0
   *                       example: 1
   *     responses:
   *       201:
   *         description: 批量创建成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: "批量创建成功"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ProductImageResponse'
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async batchCreate(ctx: Context): Promise<void> {
    const { error, value } = batchCreateProductImageSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    try {
      const images = await productImageService.batchCreate(value);
      ctx.body = success(images, '批量创建成功');
    } catch (err: any) {
      if (err.message === '商品不存在') {
        ctx.throw(404, err.message);
      }
      throw err;
    }
  }

  /**
   * @swagger
   * /api/v1/product-images/batch/sort:
   *   put:
   *     summary: 批量更新排序
   *     description: 批量更新商品图片的排序
   *     tags: [商品图片]
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
   *               - sorts
   *             properties:
   *               product_id:
   *                 type: string
   *                 format: uuid
   *                 description: 商品ID
   *                 example: "123e4567-e89b-12d3-a456-426614174000"
   *               sorts:
   *                 type: array
   *                 minItems: 1
   *                 maxItems: 50
   *                 description: 排序配置列表
   *                 items:
   *                   type: object
   *                   required:
   *                     - id
   *                     - sort
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       description: 图片ID
   *                       example: "123e4567-e89b-12d3-a456-426614174001"
   *                     sort:
   *                       type: integer
   *                       minimum: 0
   *                       maximum: 999
   *                       description: 新的排序序号
   *                       example: 1
   *     responses:
   *       200:
   *         description: 批量更新成功
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
   *                   example: "批量更新成功"
   *                 data:
   *                   type: null
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async batchUpdateSort(ctx: Context): Promise<void> {
    const { error, value } = batchUpdateSortSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    try {
      await productImageService.batchUpdateSort(value);
      ctx.body = success('批量更新成功');
    } catch (err: any) {
      if (err.message === '商品不存在' || err.message.includes('图片不存在')) {
        ctx.throw(404, err.message);
      }
      throw err;
    }
  }

  /**
   * @swagger
   * /api/v1/product-images/batch:
   *   delete:
   *     summary: 批量删除图片
   *     description: 批量删除多张商品图片
   *     tags: [商品图片]
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
   *             properties:
   *               ids:
   *                 type: array
   *                 minItems: 1
   *                 maxItems: 50
   *                 description: 要删除的图片ID列表
   *                 items:
   *                   type: string
   *                   format: uuid
   *                   example: "123e4567-e89b-12d3-a456-426614174000"
   *                 example: ["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174001"]
   *     responses:
   *       204:
   *         description: 批量删除成功
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async batchDelete(ctx: Context): Promise<void> {
    const { error, value } = batchDeleteSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    try {
      await productImageService.batchDelete(value.ids);
      ctx.body = success(null, '批量删除成功');
    } catch (err: any) {
      if (err.message === '部分图片不存在') {
        ctx.throw(404, err.message);
      }
      throw err;
    }
  }

  /**
   * @swagger
   * /api/v1/product-images/main:
   *   put:
   *     summary: 设置主图
   *     description: 将指定图片设置为商品的主图
   *     tags: [商品图片]
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
   *               - image_id
   *             properties:
   *               product_id:
   *                 type: string
   *                 format: uuid
   *                 description: 商品ID
   *                 example: "123e4567-e89b-12d3-a456-426614174000"
   *               image_id:
   *                 type: string
   *                 format: uuid
   *                 description: 要设置为主图的图片ID
   *                 example: "123e4567-e89b-12d3-a456-426614174001"
   *     responses:
   *       200:
   *         description: 设置成功
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
   *                   example: "设置主图成功"
   *                 data:
   *                   type: null
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async setMainImage(ctx: Context): Promise<void> {
    const { error, value } = setMainImageSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    try {
      await productImageService.setMainImage(value.product_id, value.image_id);
      ctx.body = success('设置主图成功');
    } catch (err: any) {
      if (err.message === '商品不存在' || err.message.includes('图片不存在')) {
        ctx.throw(404, err.message);
      }
      throw err;
    }
  }

  /**
   * @swagger
   * /api/v1/product-images/reorder:
   *   put:
   *     summary: 重新排序图片
   *     description: 根据图片ID列表的顺序重新排序商品图片
   *     tags: [商品图片]
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
   *               - image_ids
   *             properties:
   *               product_id:
   *                 type: string
   *                 format: uuid
   *                 description: 商品ID
   *                 example: "123e4567-e89b-12d3-a456-426614174000"
   *               image_ids:
   *                 type: array
   *                 minItems: 1
   *                 maxItems: 50
   *                 description: 按新顺序排列的图片ID列表
   *                 items:
   *                   type: string
   *                   format: uuid
   *                   example: "123e4567-e89b-12d3-a456-426614174001"
   *                 example: ["123e4567-e89b-12d3-a456-426614174001", "123e4567-e89b-12d3-a456-426614174002"]
   *     responses:
   *       200:
   *         description: 重新排序成功
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
   *                   example: "重新排序成功"
   *                 data:
   *                   type: null
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  async reorderImages(ctx: Context): Promise<void> {
    const { error, value } = reorderImagesSchema.validate(ctx.request.body);
    if (error) {
      ctx.throw(400, `参数验证失败: ${error.details[0].message}`);
    }

    try {
      await productImageService.reorderImages(value.product_id, value.image_ids);
      ctx.body = success('重新排序成功');
    } catch (err: any) {
      if (err.message === '商品不存在' || err.message.includes('图片不存在')) {
        ctx.throw(404, err.message);
      }
      throw err;
    }
  }

  /**
   * @swagger
   * /api/v1/product-images/stats:
   *   get:
   *     summary: 获取图片统计
   *     description: 获取商品图片的统计信息
   *     tags: [商品图片]
   *     security:
   *       - bearerAuth: []
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
   *                     total:
   *                       type: integer
   *                       description: 总图片数
   *                       example: 150
   *                     by_type:
   *                       type: object
   *                       description: 按类型统计
   *                       properties:
   *                         main:
   *                           type: integer
   *                           description: 主图数量
   *                           example: 50
   *                         detail:
   *                           type: integer
   *                           description: 详情图数量
   *                           example: 80
   *                         sku:
   *                           type: integer
   *                           description: SKU图数量
   *                           example: 20
   *                     recent_uploads:
   *                       type: integer
   *                       description: 最近7天上传数
   *                       example: 25
   *                     avg_images_per_product:
   *                       type: number
   *                       description: 平均每个商品的图片数
   *                       example: 3.5
   *                 timestamp:
   *                   type: integer
   *                   example: 1645123456789
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  async getStats(ctx: Context): Promise<void> {
    const stats = await productImageService.getStats();
    ctx.body = success(stats, '获取成功');
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductImageResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 图片ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         product_id:
 *           type: string
 *           format: uuid
 *           description: 商品ID
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         url:
 *           type: string
 *           format: uri
 *           description: 图片URL地址
 *           example: "https://example.com/images/product1.jpg"
 *         type:
 *           type: string
 *           enum: [main, detail, sku]
 *           description: 图片类型
 *           example: "main"
 *         sort:
 *           type: integer
 *           description: 排序序号
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         product:
 *           type: object
 *           description: 关联商品信息
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: 商品ID
 *               example: "123e4567-e89b-12d3-a456-426614174001"
 *             name:
 *               type: string
 *               description: 商品名称
 *               example: "iPhone 14 Pro"
 *             main_image:
 *               type: string
 *               format: uri
 *               description: 商品主图
 *               example: "https://example.com/images/iphone14pro-main.jpg"
 *     
 *     ProductImagePageResponse:
 *       type: object
 *       properties:
 *         list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImageResponse'
 *         total:
 *           type: integer
 *           description: 总记录数
 *           example: 100
 *         page:
 *           type: integer
 *           description: 当前页码
 *           example: 1
 *         size:
 *           type: integer
 *           description: 每页数量
 *           example: 10
 *         pages:
 *           type: integer
 *           description: 总页数
 *           example: 10
 */ 