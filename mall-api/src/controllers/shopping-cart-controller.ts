/**
 * 购物车管理控制器
 * 处理购物车相关的HTTP请求，包括增删改查、批量操作和统计查询
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context, Next } from 'koa';
import { ShoppingCartService } from '../services/shopping-cart-service';
import { 
  addToCartSchema,
  updateCartSchema,
  cartQuerySchema,
  batchCartSchema,
  userIdSchema,
  cartIdSchema,
  validateCartSchema,
  clearCartSchema
} from '../schemas/shopping-cart-schemas';
import { 
  AddToCartRequest,
  UpdateCartItemRequest,
  BatchCartRequest,
  ValidateCartRequest,
  CartResponse,
  CartListResponse,
  BatchCartResponse
} from '../types/shopping-cart';
import { ApiResponse, PageResponse } from '../types/common';

const shoppingCartService = new ShoppingCartService();

export class ShoppingCartController {

  /**
   * @swagger
   * /api/v1/shopping-cart:
   *   post:
   *     summary: 添加商品到购物车
   *     tags: [购物车管理]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - skuId
   *               - quantity
   *             properties:
   *               skuId:
   *                 type: string
   *                 format: uuid
   *                 description: SKU ID
   *                 example: "550e8400-e29b-41d4-a716-446655440000"
   *               quantity:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 999
   *                 description: 商品数量
   *                 example: 2
   *     responses:
   *       200:
   *         description: 添加成功
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/CartItem'
   *       400:
   *         description: 请求参数错误
   *       401:
   *         description: 未授权
   *       404:
   *         description: 商品不存在
   *       500:
   *         description: 服务器错误
   */
  async addToCart(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = addToCartSchema.validate(ctx.request.body);
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

      // 获取用户ID（从JWT中间件获取）
      const userId = ctx.state.user?.id;
      if (!userId) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: '用户未登录',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const { skuId, quantity } = value as AddToCartRequest;

      // 调用服务层
      const cartItem = await shoppingCartService.addToCart({
        userId,
        skuId,
        quantity
      });

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '添加到购物车成功',
        data: cartItem,
        timestamp: Date.now()
      } as ApiResponse<CartResponse>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '添加到购物车失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/shopping-cart:
   *   get:
   *     summary: 获取用户购物车列表
   *     tags: [购物车管理]
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
   *         name: checked
   *         schema:
   *           type: integer
   *           enum: [0, 1]
   *         description: 选中状态过滤 (0:未选中 1:已选中)
   *       - in: query
   *         name: skuId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: SKU ID过滤
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
   *                       $ref: '#/components/schemas/CartListResponse'
   */
  async getCartList(ctx: Context) {
    try {
      // 获取用户ID
      const userId = ctx.state.user?.id;
      if (!userId) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: '用户未登录',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      // 参数验证
      const queryParams = { ...ctx.query, userId };
      const { error, value } = cartQuerySchema.validate(queryParams);
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

      // 调用服务层
      const result = await shoppingCartService.getUserCartList(value);

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取购物车列表成功',
        data: result,
        timestamp: Date.now()
      } as ApiResponse<CartListResponse>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '获取购物车列表失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/shopping-cart/{id}:
   *   get:
   *     summary: 获取购物车项详情
   *     tags: [购物车管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 购物车项ID
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
   *                       $ref: '#/components/schemas/CartItem'
   */
  async getCartItem(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = cartIdSchema.validate(ctx.params);
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

      const { id } = value;

      // 调用服务层
      const cartItem = await shoppingCartService.getCartItemDetail(id);

      // 验证权限（用户只能查看自己的购物车）
      const userId = ctx.state.user?.id;
      if (cartItem.userId !== userId) {
        ctx.status = 403;
        ctx.body = {
          code: 403,
          message: '无权访问此购物车项',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取购物车项成功',
        data: cartItem,
        timestamp: Date.now()
      } as ApiResponse<CartResponse>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '获取购物车项失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/shopping-cart/{id}:
   *   put:
   *     summary: 更新购物车项
   *     tags: [购物车管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 购物车项ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               quantity:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 999
   *                 description: 商品数量
   *               checked:
   *                 type: boolean
   *                 description: 是否选中
   *     responses:
   *       200:
   *         description: 更新成功
   */
  async updateCartItem(ctx: Context) {
    try {
      // 参数验证
      const pathValidation = cartIdSchema.validate(ctx.params);
      if (pathValidation.error) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: pathValidation.error.details[0].message,
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const bodyValidation = updateCartSchema.validate(ctx.request.body);
      if (bodyValidation.error) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: bodyValidation.error.details[0].message,
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const { id } = pathValidation.value;
      const updateData = bodyValidation.value as UpdateCartItemRequest;

      // 先获取购物车项以验证权限
      const existingItem = await shoppingCartService.getCartItemDetail(id);
      const userId = ctx.state.user?.id;
      if (existingItem.userId !== userId) {
        ctx.status = 403;
        ctx.body = {
          code: 403,
          message: '无权修改此购物车项',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      // 转换checked为数字
      const updateParams: any = {};
      if (updateData.quantity !== undefined) {
        updateParams.quantity = updateData.quantity;
      }
      if (updateData.checked !== undefined) {
        updateParams.checked = updateData.checked ? 1 : 0;
      }

      // 调用服务层
      const updatedItem = await shoppingCartService.updateCartItem(id, updateParams);

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '更新购物车项成功',
        data: updatedItem,
        timestamp: Date.now()
      } as ApiResponse<CartResponse>;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '更新购物车项失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/shopping-cart/{id}:
   *   delete:
   *     summary: 删除购物车项
   *     tags: [购物车管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 购物车项ID
   *     responses:
   *       200:
   *         description: 删除成功
   */
  async deleteCartItem(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = cartIdSchema.validate(ctx.params);
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

      const { id } = value;

      // 先获取购物车项以验证权限
      const existingItem = await shoppingCartService.getCartItemDetail(id);
      const userId = ctx.state.user?.id;
      if (existingItem.userId !== userId) {
        ctx.status = 403;
        ctx.body = {
          code: 403,
          message: '无权删除此购物车项',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      // 调用服务层
      const success = await shoppingCartService.deleteCartItem(id);

      if (!success) {
        ctx.status = 404;
        ctx.body = {
          code: 404,
          message: '购物车项不存在',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '删除购物车项成功',
        data: { success: true },
        timestamp: Date.now()
      } as ApiResponse;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '删除购物车项失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/shopping-cart/batch:
   *   post:
   *     summary: 批量操作购物车
   *     tags: [购物车管理]
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
   *                 minItems: 1
   *                 maxItems: 100
   *                 description: 购物车项ID列表
   *               action:
   *                 type: string
   *                 enum: [delete, check, uncheck]
   *                 description: 操作类型
   *     responses:
   *       200:
   *         description: 操作成功
   */
  async batchOperateCart(ctx: Context) {
    try {
      // 参数验证
      const { error, value } = batchCartSchema.validate(ctx.request.body);
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

      const { ids, action } = value as BatchCartRequest;
      const userId = ctx.state.user?.id;

      // 验证所有购物车项的权限
      for (const id of ids) {
        try {
          const item = await shoppingCartService.getCartItemDetail(id);
          if (item.userId !== userId) {
            ctx.status = 403;
            ctx.body = {
              code: 403,
              message: '包含无权操作的购物车项',
              data: null,
              timestamp: Date.now()
            } as ApiResponse;
            return;
          }
        } catch {
          // 如果购物车项不存在，继续处理其他项
          continue;
        }
      }

      // 调用服务层
      const result = await shoppingCartService.batchOperateCart({ ids, action });

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '批量操作完成',
        data: result,
        timestamp: Date.now()
      } as ApiResponse<BatchCartResponse>;
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
   * /api/v1/shopping-cart/clear:
   *   delete:
   *     summary: 清空购物车
   *     tags: [购物车管理]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: checked
   *         schema:
   *           type: boolean
   *         description: 是否只清空选中的商品
   *     responses:
   *       200:
   *         description: 清空成功
   */
  async clearCart(ctx: Context) {
    try {
      const userId = ctx.state.user?.id;
      if (!userId) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: '用户未登录',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const checkedOnly = ctx.query.checked === 'true';

      // 调用服务层
      const count = await shoppingCartService.clearUserCart(userId, checkedOnly);

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: `清空购物车成功，共清空${count}个商品`,
        data: { count },
        timestamp: Date.now()
      } as ApiResponse;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '清空购物车失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/shopping-cart/count:
   *   get:
   *     summary: 获取购物车商品数量
   *     tags: [购物车管理]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 获取成功
   */
  async getCartCount(ctx: Context) {
    try {
      const userId = ctx.state.user?.id;
      if (!userId) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: '用户未登录',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      // 调用服务层
      const count = await shoppingCartService.getUserCartCount(userId);

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '获取购物车数量成功',
        data: { count },
        timestamp: Date.now()
      } as ApiResponse;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '获取购物车数量失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }

  /**
   * @swagger
   * /api/v1/shopping-cart/validate:
   *   post:
   *     summary: 验证购物车可用性
   *     tags: [购物车管理]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               cartIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 description: 要验证的购物车项ID列表（为空则验证全部）
   *     responses:
   *       200:
   *         description: 验证完成
   */
  async validateCart(ctx: Context) {
    try {
      const userId = ctx.state.user?.id;
      if (!userId) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: '用户未登录',
          data: null,
          timestamp: Date.now()
        } as ApiResponse;
        return;
      }

      const { cartIds } = ctx.request.body as ValidateCartRequest;

      // 调用服务层
      const validation = await shoppingCartService.validateCart(userId, cartIds);

      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '购物车验证完成',
        data: validation,
        timestamp: Date.now()
      } as ApiResponse;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: error instanceof Error ? error.message : '购物车验证失败',
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
    }
  }
} 