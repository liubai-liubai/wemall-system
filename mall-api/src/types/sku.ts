/**
 * SKU管理相关的TypeScript类型定义
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

/**
 * SKU基础信息接口
 */
export interface ISku {
  id: string;
  productId: string;
  skuCode: string;
  price: number;
  stock: number;
  attributes: Record<string, unknown>;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SKU详情接口（包含商品信息）
 */
export interface ISkuDetail extends ISku {
  product: {
    id: string;
    name: string;
    categoryId: string;
    status: number;
  };
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
 * SKU查询参数接口
 */
export interface ISkuQueryParams {
  page?: number;
  size?: number;
  productId?: string;
  skuCode?: string;
  status?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'skuCode' | 'price' | 'stock' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}

/**
 * SKU列表响应接口
 */
export interface ISkuListResponse {
  list: ISkuDetail[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * SKU库存统计接口
 */
export interface ISkuStockStats {
  totalSkus: number;
  lowStockSkus: number;
  outOfStockSkus: number;
  totalStockValue: number;
}

/**
 * 批量操作SKU参数接口
 */
export interface ISkuBatchParams {
  ids: string[];
  action: 'delete' | 'enable' | 'disable' | 'adjustStock';
  stockAdjustment?: number; // 库存调整数量（仅当action为adjustStock时需要）
}

/**
 * SKU属性定义接口
 */
export interface ISkuAttribute {
  name: string;
  value: string;
  type?: 'text' | 'number' | 'color' | 'image';
}

/**
 * SKU创建请求
 */
export interface CreateSkuRequest {
  productId: string;
  skuCode: string;
  price: number;
  stock?: number;
  attributes?: Record<string, unknown>;
  status?: number;
}

/**
 * SKU更新请求
 */
export interface UpdateSkuRequest {
  skuCode?: string;
  price?: number;
  stock?: number;
  attributes?: Record<string, unknown>;
  status?: number;
}

/**
 * SKU查询参数
 */
export interface SkuQueryParams {
  page?: number;
  size?: number;
  productId?: string;
  skuCode?: string;
  status?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: string;
}

/**
 * SKU列表响应
 */
export interface SkuListResponse {
  list: ISkuDetail[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * SKU详情响应
 */
export interface SkuDetailResponse {
  id: string;
  productId: string;
  skuCode: string;
  price: number;
  stock: number;
  attributes: Record<string, unknown>;
  status: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    categoryId: string;
    status: number;
  };
}

/**
 * SKU批量操作响应
 */
export interface SkuBatchOperationResponse {
  successCount: number;
  failureCount: number;
  details: Array<{
    id: string;
    success: boolean;
    message?: string;
  }>;
} 