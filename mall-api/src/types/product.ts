/**
 * 商品管理相关类型定义
 * 定义商品模块使用的接口和类型，确保类型安全
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Decimal } from '@prisma/client/runtime/library';
import { PageQuery } from './common.js';

/**
 * 商品状态枚举
 */
export enum ProductStatus {
  OFFLINE = 0,    // 下架
  ONLINE = 1      // 上架
}

/**
 * 商品分类状态枚举
 */
export enum CategoryStatus {
  DISABLED = 0,   // 禁用
  ENABLED = 1     // 启用
}

/**
 * 库存类型枚举
 */
export enum StockType {
  SELLABLE = 'sellable',  // 可售库存
  LOCKED = 'locked',      // 锁定库存
  WARNING = 'warning'     // 预警库存
}

/**
 * 库存变动类型枚举
 */
export enum StockLogType {
  IN = 'in',           // 入库
  OUT = 'out',         // 出库
  LOCK = 'lock',       // 锁定
  UNLOCK = 'unlock',   // 解锁
  ADJUST = 'adjust'    // 调整
}

/**
 * 商品分类接口
 */
export interface IProductCategory {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  sort: number;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  parent?: IProductCategory;
  children?: IProductCategory[];
  products?: IProduct[];
}

/**
 * 商品基础信息接口
 */
export interface IProduct {
  id: string;
  name: string;
  categoryId: string;
  brand?: string;
  description?: string;
  mainImage?: string;
  price: Decimal;
  marketPrice: Decimal;
  status: number;
  stock: number;
  sales: number;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  category?: IProductCategory;
  skus?: IProductSku[];
  attributes?: IProductAttribute[];
  images?: IProductImage[];
  productStocks?: IProductStock[];
}

/**
 * 商品创建参数接口
 */
export interface IProductCreateParams {
  name: string;
  categoryId: string;
  brand?: string;
  description?: string;
  mainImage?: string;
  price: number;
  marketPrice: number;
  status?: number;
  stock?: number;
  sort?: number;
}

/**
 * 商品更新参数接口
 */
export interface IProductUpdateParams {
  name?: string;
  categoryId?: string;
  brand?: string;
  description?: string;
  mainImage?: string;
  price?: number;
  marketPrice?: number;
  status?: number;
  stock?: number;
  sort?: number;
}

/**
 * 商品查询参数接口
 */
export interface IProductQueryParams extends PageQuery {
  name?: string;
  categoryId?: string;
  brand?: string;
  status?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 商品SKU接口
 */
export interface IProductSku {
  id: string;
  productId: string;
  skuCode: string;
  price: Decimal;
  stock: number;
  attributes?: Record<string, unknown>;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  product?: IProduct;
  productStocks?: IProductStock[];
}

/**
 * SKU创建参数接口
 */
export interface ISkuCreateParams {
  productId: string;
  skuCode: string;
  price: number;
  stock?: number;
  attributes?: Record<string, unknown>;
  status?: number;
}

/**
 * SKU更新参数接口
 */
export interface ISkuUpdateParams {
  skuCode?: string;
  price?: number;
  stock?: number;
  attributes?: Record<string, unknown>;
  status?: number;
}

/**
 * 商品属性接口
 */
export interface IProductAttribute {
  id: string;
  productId: string;
  name: string;
  value: string;
  createdAt: Date;
  // 关联数据
  product?: IProduct;
}

/**
 * 属性创建参数接口
 */
export interface IAttributeCreateParams {
  productId: string;
  name: string;
  value: string;
}

/**
 * 属性更新参数接口
 */
export interface IAttributeUpdateParams {
  name?: string;
  value?: string;
}

/**
 * 商品图片接口
 */
export interface IProductImage {
  id: string;
  productId: string;
  url: string;
  type: string;
  sort: number;
  createdAt: Date;
  // 关联数据
  product?: IProduct;
}

/**
 * 图片创建参数接口
 */
export interface IImageCreateParams {
  productId: string;
  url: string;
  type?: string;
  sort?: number;
}

/**
 * 图片更新参数接口
 */
export interface IImageUpdateParams {
  url?: string;
  type?: string;
  sort?: number;
}

/**
 * 商品库存接口
 */
export interface IProductStock {
  id: string;
  productId: string;
  skuId: string;
  warehouseId?: string;
  stockType: string;
  quantity: number;
  warningLine: number;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  product?: IProduct;
  sku?: IProductSku;
  stockLogs?: IProductStockLog[];
}

/**
 * 库存创建参数接口
 */
export interface IStockCreateParams {
  productId: string;
  skuId: string;
  warehouseId?: string;
  stockType?: string;
  quantity: number;
  warningLine?: number;
}

/**
 * 库存更新参数接口
 */
export interface IStockUpdateParams {
  quantity?: number;
  warningLine?: number;
  stockType?: string;
}

/**
 * 库存变动日志接口
 */
export interface IProductStockLog {
  id: string;
  stockId: string;
  change: number;
  type: string;
  orderId?: string;
  remark?: string;
  createdAt: Date;
  // 关联数据
  stock?: IProductStock;
}

/**
 * 库存变动参数接口
 */
export interface IStockLogCreateParams {
  stockId: string;
  change: number;
  type: string;
  orderId?: string;
  remark?: string;
}

/**
 * 商品详情接口（包含关联数据）
 */
export interface IProductDetail extends IProduct {
  category?: IProductCategory;
  skus?: IProductSku[];
  attributes?: IProductAttribute[];
  images?: IProductImage[];
  stocks?: IProductStock[];
}

// ===== 请求/响应类型定义 =====

/**
 * 创建商品分类请求
 */
export interface CreateProductCategoryRequest {
  name: string;
  parentId?: string;
  sort?: number;
  status?: CategoryStatus;
}

/**
 * 更新商品分类请求
 */
export interface UpdateProductCategoryRequest {
  name?: string;
  parentId?: string;
  sort?: number;
  status?: CategoryStatus;
}

/**
 * 商品分类查询参数
 */
export interface ProductCategoryQueryParams {
  parentId?: string;
  level?: number;
  status?: CategoryStatus;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: 'created_at' | 'updated_at' | 'sort' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 商品分类列表响应
 */
export interface ProductCategoryListResponse {
  list: IProductCategory[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * 创建商品请求
 */
export interface CreateProductRequest {
  name: string;
  categoryId: string;
  brand?: string;
  description?: string;
  mainImage?: string;
  price: number;
  marketPrice: number;
  status?: ProductStatus;
  stock?: number;
  sort?: number;
  attributes?: Array<{
    name: string;
    value: string;
  }>;
  images?: Array<{
    url: string;
    type: string;
    sort: number;
  }>;
}

/**
 * 更新商品请求
 */
export interface UpdateProductRequest {
  name?: string;
  categoryId?: string;
  brand?: string;
  description?: string;
  mainImage?: string;
  price?: number;
  marketPrice?: number;
  status?: ProductStatus;
  stock?: number;
  sort?: number;
}

/**
 * 商品查询参数
 */
export interface ProductQueryParams {
  categoryId?: string;
  brand?: string;
  status?: ProductStatus;
  keyword?: string;         // 商品名称搜索
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;       // 是否有库存
  page?: number;
  size?: number;
  sortBy?: 'created_at' | 'updated_at' | 'price' | 'sales' | 'sort';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 商品列表响应
 */
export interface ProductListResponse {
  list: IProduct[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * 创建SKU请求
 */
export interface CreateProductSkuRequest {
  productId: string;
  skuCode: string;
  price: number;
  stock: number;
  attributes?: any;
  status?: ProductStatus;
}

/**
 * 更新SKU请求
 */
export interface UpdateProductSkuRequest {
  skuCode?: string;
  price?: number;
  stock?: number;
  attributes?: any;
  status?: ProductStatus;
}

/**
 * SKU查询参数
 */
export interface ProductSkuQueryParams {
  productId?: string;
  status?: ProductStatus;
  hasStock?: boolean;
  page?: number;
  size?: number;
  sortBy?: 'created_at' | 'updated_at' | 'price';
  sortOrder?: 'asc' | 'desc';
}

/**
 * SKU列表响应
 */
export interface ProductSkuListResponse {
  list: IProductSku[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * 库存调整请求
 */
export interface StockAdjustRequest {
  productId: string;
  skuId: string;
  quantity: number;
  type: StockLogType;
  remark?: string;
}

/**
 * 批量库存调整请求
 */
export interface BatchStockAdjustRequest {
  adjustments: StockAdjustRequest[];
  batchRemark?: string;
}

/**
 * 库存查询参数
 */
export interface ProductStockQueryParams {
  productId?: string;
  skuId?: string;
  warehouseId?: string;
  stockType?: StockType;
  lowStock?: boolean;       // 是否低库存
  page?: number;
  size?: number;
  sortBy?: 'updated_at' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 库存列表响应
 */
export interface ProductStockListResponse {
  list: IProductStock[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * 商品统计信息
 */
export interface ProductStatistics {
  totalProducts: number;
  onlineProducts: number;
  offlineProducts: number;
  totalCategories: number;
  activeCategories: number;
  totalSkus: number;
  lowStockProducts: number;
  categoryStats: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
  }>;
  brandStats: Array<{
    brand: string;
    productCount: number;
  }>;
  priceRangeStats: Array<{
    range: string;
    count: number;
  }>;
}

/**
 * 分类树形结构响应
 */
export interface CategoryTreeResponse {
  id: string;
  name: string;
  level: number;
  sort: number;
  status: CategoryStatus;
  children?: CategoryTreeResponse[];
}

/**
 * 商品详情响应（包含完整关联信息）
 */
export interface ProductDetailResponse extends IProduct {
  category: IProductCategory;
  skus: IProductSku[];
  attributes: IProductAttribute[];
  images: IProductImage[];
} 