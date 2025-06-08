/**
 * 购物车相关类型定义
 * 包含购物车管理的所有接口和枚举
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Decimal } from '@prisma/client/runtime/library';
import { PageQuery } from './common';

/**
 * 购物车状态枚举
 */
export enum CartStatus {
  UNCHECKED = 0,  // 未选中
  CHECKED = 1     // 已选中
}

/**
 * 购物车基础信息接口
 */
export interface IShoppingCart {
  id: string;
  userId: string;
  skuId: string;
  quantity: number;
  checked: number;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  sku?: ICartSku;
  product?: ICartProduct;
}

/**
 * 购物车中的SKU信息接口
 */
export interface ICartSku {
  id: string;
  productId: string;
  skuCode: string;
  price: Decimal;
  stock: number;
  attributes?: Record<string, unknown>;
  status: number;
  product?: ICartProduct;
}

/**
 * 购物车中的商品信息接口
 */
export interface ICartProduct {
  id: string;
  name: string;
  mainImage?: string;
  categoryId: string;
  brand?: string;
  status: number;
}

/**
 * 购物车详情接口（包含完整的商品和SKU信息）
 */
export interface IShoppingCartDetail extends IShoppingCart {
  sku: ICartSku & {
    product: ICartProduct;
  };
  totalPrice: number;  // 计算后的总价
  available: boolean;  // 是否可用（库存充足且商品上架）
}

/**
 * 添加到购物车参数接口
 */
export interface IAddToCartParams {
  userId: string;
  skuId: string;
  quantity: number;
}

/**
 * 更新购物车参数接口
 */
export interface IUpdateCartParams {
  quantity?: number;
  checked?: number;
}

/**
 * 购物车查询参数接口
 */
export interface ICartQueryParams extends PageQuery {
  userId: string;
  checked?: number;
  skuId?: string;
}

/**
 * 批量操作购物车参数接口
 */
export interface IBatchCartParams {
  ids: string[];
  action: 'delete' | 'check' | 'uncheck';
}

/**
 * 购物车统计信息接口
 */
export interface ICartStatistics {
  totalItems: number;        // 总商品数量
  checkedItems: number;      // 已选中商品数量
  totalPrice: number;        // 总价格
  checkedPrice: number;      // 已选中商品总价格
  availableItems: number;    // 可用商品数量
  unavailableItems: number;  // 不可用商品数量
}

/**
 * 购物车验证结果接口
 */
export interface ICartValidation {
  valid: boolean;
  invalidItems: Array<{
    cartId: string;
    skuId: string;
    productName: string;
    reason: 'out_of_stock' | 'product_offline' | 'sku_offline' | 'insufficient_stock';
    currentStock?: number;
    requestQuantity?: number;
  }>;
}

/**
 * 添加到购物车请求
 */
export interface AddToCartRequest {
  skuId: string;
  quantity: number;
}

/**
 * 更新购物车项请求
 */
export interface UpdateCartItemRequest {
  quantity?: number;
  checked?: boolean;
}

/**
 * 批量操作购物车请求
 */
export interface BatchCartRequest {
  ids: string[];
  action: 'delete' | 'check' | 'uncheck';
}

/**
 * 验证购物车请求
 */
export interface ValidateCartRequest {
  cartIds?: string[];
}

/**
 * 购物车响应
 */
export interface CartResponse extends IShoppingCartDetail {}

/**
 * 购物车列表响应
 */
export interface CartListResponse {
  items: IShoppingCartDetail[];
  statistics: ICartStatistics;
  validation: ICartValidation;
}

/**
 * 批量操作响应
 */
export interface BatchCartResponse {
  success: number;
  failed: number;
  details?: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
} 