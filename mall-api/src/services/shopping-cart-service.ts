/**
 * 购物车业务服务类
 * 处理购物车相关的业务逻辑，包括增删改查、验证和统计
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { 
  IShoppingCart, 
  IShoppingCartDetail,
  IAddToCartParams,
  IUpdateCartParams,
  ICartQueryParams,
  IBatchCartParams,
  ICartStatistics,
  ICartValidation,
  CartListResponse
} from '../types/shopping-cart';
import { PageResponse } from '../types/common';

// 获取Prisma客户端实例
const prisma = new PrismaClient();

export class ShoppingCartService {
  
  /**
   * 添加商品到购物车
   * @param params 添加参数
   * @returns 购物车项详情
   */
  async addToCart(params: IAddToCartParams): Promise<IShoppingCartDetail> {
    try {
      // 1. 验证SKU是否存在且可用
      const sku = await prisma.productSku.findFirst({
        where: {
          id: params.skuId,
          status: 1
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              main_image: true,
              category_id: true,
              brand: true,
              status: true
            }
          }
        }
      });

      if (!sku) {
        throw new Error('商品规格不存在或已下架');
      }

      if (sku.product.status !== 1) {
        throw new Error('商品已下架');
      }

      // 2. 检查库存
      if (sku.stock < params.quantity) {
        throw new Error(`库存不足，当前库存：${sku.stock}`);
      }

      // 3. 查看用户是否已经添加过该SKU
      const existingCart = await prisma.shoppingCart.findFirst({
        where: {
          user_id: params.userId,
          sku_id: params.skuId
        }
      });

      let cartItem: any;

      if (existingCart) {
        // 如果已存在，更新数量
        const newQuantity = existingCart.quantity + params.quantity;
        
        // 再次检查库存
        if (sku.stock < newQuantity) {
          throw new Error(`库存不足，当前库存：${sku.stock}，购物车已有：${existingCart.quantity}`);
        }

        cartItem = await prisma.shoppingCart.update({
          where: { id: existingCart.id },
          data: { 
            quantity: newQuantity,
            updated_at: new Date()
          }
        });
      } else {
        // 创建新的购物车项
        cartItem = await prisma.shoppingCart.create({
          data: {
            user_id: params.userId,
            sku_id: params.skuId,
            quantity: params.quantity,
            checked: 1
          }
        });
      }

      // 4. 返回详细信息
      return await this.getCartItemDetail(cartItem.id);
    } catch (error) {
      throw new Error(`添加到购物车失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取用户购物车列表
   * @param params 查询参数
   * @returns 购物车列表和统计信息
   */
  async getUserCartList(params: ICartQueryParams): Promise<CartListResponse> {
    try {
      const { userId, page = 1, size = 20, checked, skuId } = params;
      const offset = (page - 1) * size;

      // 构建查询条件
      const where: any = {
        user_id: userId
      };

      if (checked !== undefined) {
        where.checked = checked;
      }

      if (skuId) {
        where.sku_id = skuId;
      }

      // 查询购物车项
      const [cartItems, total] = await Promise.all([
        prisma.shoppingCart.findMany({
          where,
          skip: offset,
          take: size,
          orderBy: { created_at: 'desc' },
          // 直接查询，不使用include避免复杂关联
        }),
        prisma.shoppingCart.count({ where })
      ]);

      // 获取详细信息
      const items: IShoppingCartDetail[] = [];
      for (const item of cartItems) {
        const detail = await this.getCartItemDetail(item.id);
        items.push(detail);
      }

      // 计算统计信息
      const statistics = await this.calculateCartStatistics(userId, checked);
      
      // 验证购物车
      const validation = await this.validateCart(userId);

      return {
        items,
        statistics,
        validation
      };
    } catch (error) {
      throw new Error(`获取购物车列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取购物车项详情
   * @param cartId 购物车项ID
   * @returns 购物车项详情
   */
  async getCartItemDetail(cartId: string): Promise<IShoppingCartDetail> {
    try {
      const cartItem = await prisma.shoppingCart.findUnique({
        where: { id: cartId }
      });

      if (!cartItem) {
        throw new Error('购物车项不存在');
      }

      // 获取SKU和商品信息
      const sku = await prisma.productSku.findUnique({
        where: { id: cartItem.sku_id }
      });

      if (!sku) {
        throw new Error('商品规格不存在');
      }

      const product = await prisma.product.findUnique({
        where: { id: sku.product_id },
        select: {
          id: true,
          name: true,
          main_image: true,
          category_id: true,
          brand: true,
          status: true
        }
      });

      if (!product) {
        throw new Error('商品不存在');
      }

      // 计算总价和可用性
      const totalPrice = Number(sku.price) * cartItem.quantity;
      const available = product.status === 1 && sku.status === 1 && sku.stock >= cartItem.quantity;

      return {
        id: cartItem.id,
        userId: cartItem.user_id,
        skuId: cartItem.sku_id,
        quantity: cartItem.quantity,
        checked: cartItem.checked,
        createdAt: cartItem.created_at,
        updatedAt: cartItem.updated_at,
        sku: {
          id: sku.id,
          productId: sku.product_id,
          skuCode: sku.sku_code || '',
          price: sku.price,
          stock: sku.stock,
          attributes: sku.attributes as Record<string, unknown> || {},
          status: sku.status,
          product: {
            id: product.id,
            name: product.name,
            mainImage: product.main_image || undefined,
            categoryId: product.category_id,
            brand: product.brand || undefined,
            status: product.status
          }
        },
        totalPrice,
        available
      };
    } catch (error) {
      throw new Error(`获取购物车详情失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新购物车项
   * @param cartId 购物车项ID
   * @param params 更新参数
   * @returns 更新后的购物车项详情
   */
  async updateCartItem(cartId: string, params: IUpdateCartParams): Promise<IShoppingCartDetail> {
    try {
      const cartItem = await prisma.shoppingCart.findUnique({
        where: { id: cartId }
      });

      if (!cartItem) {
        throw new Error('购物车项不存在');
      }

      // 如果更新数量，需要验证库存
      if (params.quantity !== undefined) {
        const sku = await prisma.productSku.findUnique({
          where: { id: cartItem.sku_id }
        });

        if (!sku) {
          throw new Error('商品规格不存在');
        }

        if (sku.stock < params.quantity) {
          throw new Error(`库存不足，当前库存：${sku.stock}`);
        }
      }

      // 构建更新数据
      const updateData: any = {
        updated_at: new Date()
      };

      if (params.quantity !== undefined) {
        updateData.quantity = params.quantity;
      }

      if (params.checked !== undefined) {
        updateData.checked = params.checked ? 1 : 0;
      }

      // 更新购物车项
      await prisma.shoppingCart.update({
        where: { id: cartId },
        data: updateData
      });

      return await this.getCartItemDetail(cartId);
    } catch (error) {
      throw new Error(`更新购物车失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除购物车项
   * @param cartId 购物车项ID
   * @returns 是否删除成功
   */
  async deleteCartItem(cartId: string): Promise<boolean> {
    try {
      await prisma.shoppingCart.delete({
        where: { id: cartId }
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return false;
      }
      throw new Error(`删除购物车项失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量操作购物车
   * @param params 批量操作参数
   * @returns 操作结果
   */
  async batchOperateCart(params: IBatchCartParams): Promise<{ success: number; failed: number }> {
    try {
      let success = 0;
      let failed = 0;

      for (const id of params.ids) {
        try {
          if (params.action === 'delete') {
            await this.deleteCartItem(id);
          } else if (params.action === 'check') {
            await this.updateCartItem(id, { checked: 1 });
          } else if (params.action === 'uncheck') {
            await this.updateCartItem(id, { checked: 0 });
          }
          success++;
        } catch {
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      throw new Error(`批量操作购物车失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 清空用户购物车
   * @param userId 用户ID
   * @param checkedOnly 是否只清空选中的商品
   * @returns 清空的商品数量
   */
  async clearUserCart(userId: string, checkedOnly: boolean = false): Promise<number> {
    try {
      const where: any = {
        user_id: userId
      };

      if (checkedOnly) {
        where.checked = 1;
      }

      const result = await prisma.shoppingCart.deleteMany({ where });
      return result.count;
    } catch (error) {
      throw new Error(`清空购物车失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 计算购物车统计信息
   * @param userId 用户ID
   * @param checked 可选的选中状态过滤
   * @returns 购物车统计信息
   */
  async calculateCartStatistics(userId: string, checked?: number): Promise<ICartStatistics> {
    try {
      const where: any = { user_id: userId };
      if (checked !== undefined) {
        where.checked = checked;
      }

      // 获取所有购物车项
      const cartItems = await prisma.shoppingCart.findMany({ where });

      let totalItems = 0;
      let checkedItems = 0;
      let totalPrice = 0;
      let checkedPrice = 0;
      let availableItems = 0;
      let unavailableItems = 0;

      for (const item of cartItems) {
        totalItems += item.quantity;
        
        if (item.checked === 1) {
          checkedItems += item.quantity;
        }

        // 获取SKU价格和状态
        const sku = await prisma.productSku.findUnique({
          where: { id: item.sku_id },
          include: {
            product: {
              select: { status: true }
            }
          }
        });

        if (sku) {
          const itemPrice = Number(sku.price) * item.quantity;
          totalPrice += itemPrice;
          
          if (item.checked === 1) {
            checkedPrice += itemPrice;
          }

          // 检查可用性
          if (sku.status === 1 && sku.product.status === 1 && sku.stock >= item.quantity) {
            availableItems += item.quantity;
          } else {
            unavailableItems += item.quantity;
          }
        }
      }

      return {
        totalItems,
        checkedItems,
        totalPrice,
        checkedPrice,
        availableItems,
        unavailableItems
      };
    } catch (error) {
      throw new Error(`计算购物车统计失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证购物车可用性
   * @param userId 用户ID
   * @param cartIds 可选的购物车项ID列表
   * @returns 验证结果
   */
  async validateCart(userId: string, cartIds?: string[]): Promise<ICartValidation> {
    try {
      const where: any = { user_id: userId };
      if (cartIds && cartIds.length > 0) {
        where.id = { in: cartIds };
      }

      const cartItems = await prisma.shoppingCart.findMany({ where });
      
      const invalidItems: ICartValidation['invalidItems'] = [];

      for (const item of cartItems) {
        const sku = await prisma.productSku.findUnique({
          where: { id: item.sku_id },
          include: {
            product: {
              select: { name: true, status: true }
            }
          }
        });

        if (!sku) {
          invalidItems.push({
            cartId: item.id,
            skuId: item.sku_id,
            productName: '未知商品',
            reason: 'product_offline'
          });
          continue;
        }

        if (sku.product.status !== 1) {
          invalidItems.push({
            cartId: item.id,
            skuId: item.sku_id,
            productName: sku.product.name,
            reason: 'product_offline'
          });
          continue;
        }

        if (sku.status !== 1) {
          invalidItems.push({
            cartId: item.id,
            skuId: item.sku_id,
            productName: sku.product.name,
            reason: 'sku_offline'
          });
          continue;
        }

        if (sku.stock <= 0) {
          invalidItems.push({
            cartId: item.id,
            skuId: item.sku_id,
            productName: sku.product.name,
            reason: 'out_of_stock',
            currentStock: sku.stock,
            requestQuantity: item.quantity
          });
          continue;
        }

        if (sku.stock < item.quantity) {
          invalidItems.push({
            cartId: item.id,
            skuId: item.sku_id,
            productName: sku.product.name,
            reason: 'insufficient_stock',
            currentStock: sku.stock,
            requestQuantity: item.quantity
          });
        }
      }

      return {
        valid: invalidItems.length === 0,
        invalidItems
      };
    } catch (error) {
      throw new Error(`验证购物车失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取用户购物车商品数量
   * @param userId 用户ID
   * @returns 购物车商品总数量
   */
  async getUserCartCount(userId: string): Promise<number> {
    try {
      const result = await prisma.shoppingCart.aggregate({
        where: { user_id: userId },
        _sum: { quantity: true }
      });
      
      return result._sum.quantity || 0;
    } catch (error) {
      throw new Error(`获取购物车数量失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
} 