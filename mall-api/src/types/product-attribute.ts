/**
 * 商品属性管理类型定义
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

// ================================
// 基础接口定义
// ================================

/**
 * 商品属性基础信息接口
 */
export interface IProductAttribute {
  id: string;
  productId: string;
  name: string;
  value: string;
  createdAt: Date;
}

/**
 * 商品属性详情接口（包含关联商品信息）
 */
export interface IProductAttributeDetail extends IProductAttribute {
  product?: {
    id: string;
    name: string;
    status: number;
  };
}

// ================================
// 请求类型定义
// ================================

/**
 * 创建商品属性请求
 */
export interface CreateProductAttributeRequest {
  productId: string;
  name: string;
  value: string;
}

/**
 * 更新商品属性请求
 */
export interface UpdateProductAttributeRequest {
  name?: string;
  value?: string;
}

/**
 * 批量创建商品属性请求
 */
export interface BatchCreateAttributesRequest {
  productId: string;
  attributes: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * 批量操作商品属性请求
 */
export interface BatchAttributeOperationRequest {
  ids: string[];
  operation: 'delete' | 'update';
  updateData?: {
    name?: string;
    value?: string;
  };
}

/**
 * 商品属性查询请求
 */
export interface ProductAttributeQueryRequest {
  page?: number;
  size?: number;
  productId?: string;
  name?: string;
  value?: string;
  keyword?: string; // 支持名称或值的模糊搜索
}

// ================================
// 响应类型定义
// ================================

/**
 * 商品属性响应
 */
export interface ProductAttributeResponse {
  id: string;
  productId: string;
  name: string;
  value: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    status: number;
  };
}

/**
 * 商品属性列表响应
 */
export interface ProductAttributeListResponse {
  list: ProductAttributeResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * 批量操作结果响应
 */
export interface BatchAttributeOperationResponse {
  successCount: number;
  failureCount: number;
  failures: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * 商品属性统计响应
 */
export interface ProductAttributeStatsResponse {
  totalAttributes: number;
  totalProducts: number;
  avgAttributesPerProduct: number;
  topAttributeNames: Array<{
    name: string;
    count: number;
  }>;
  topAttributeValues: Array<{
    value: string;
    count: number;
  }>;
}

// ================================
// 数据库模型映射类型
// ================================

/**
 * Prisma ProductAttribute 模型映射
 */
export interface PrismaProductAttribute {
  id: string;
  product_id: string;
  name: string;
  value: string;
  created_at: Date;
  product?: {
    id: string;
    name: string;
    status: number;
  };
}

// ================================
// 服务层类型定义
// ================================

/**
 * 创建商品属性服务请求
 */
export interface CreateAttributeServiceRequest {
  productId: string;
  name: string;
  value: string;
}

/**
 * 更新商品属性服务请求
 */
export interface UpdateAttributeServiceRequest {
  name?: string;
  value?: string;
}

/**
 * 商品属性查询选项
 */
export interface AttributeQueryOptions {
  page: number;
  size: number;
  productId?: string;
  name?: string;
  value?: string;
  keyword?: string;
  includeProduct?: boolean;
} 