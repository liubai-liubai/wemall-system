/**
 * 商品图片类型定义
 * @author 刘白 & AI Assistant
 */

// 商品图片实体
export interface IProductImage {
  id: string;
  product_id: string;
  url: string;
  type: 'main' | 'detail' | 'sku';
  sort: number;
  created_at: Date;
}

// 创建商品图片请求
export interface ICreateProductImageRequest {
  product_id: string;
  url: string;
  type?: 'main' | 'detail' | 'sku';
  sort?: number;
}

// 更新商品图片请求
export interface IUpdateProductImageRequest {
  url?: string;
  type?: 'main' | 'detail' | 'sku';
  sort?: number;
}

// 批量创建商品图片请求
export interface IBatchCreateProductImageRequest {
  product_id: string;
  images: {
    url: string;
    type?: 'main' | 'detail' | 'sku';
    sort?: number;
  }[];
}

// 批量更新排序请求
export interface IBatchUpdateSortRequest {
  product_id: string;
  sorts: {
    id: string;
    sort: number;
  }[];
}

// 商品图片查询条件
export interface IProductImageQuery {
  page?: number;
  size?: number;
  product_id?: string;
  type?: 'main' | 'detail' | 'sku';
  keyword?: string;
  sort_by?: 'sort' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// 商品图片响应
export interface IProductImageResponse extends IProductImage {
  product?: {
    id: string;
    name: string;
    main_image?: string;
  };
}

// 分页响应
export interface IProductImagePageResponse {
  list: IProductImageResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// 统计信息
export interface IProductImageStats {
  total: number;
  by_type: {
    main: number;
    detail: number;
    sku: number;
  };
  recent_uploads: number;
  avg_images_per_product: number;
}

// 商品图片服务接口
export interface IProductImageService {
  // 基础CRUD
  create(data: ICreateProductImageRequest): Promise<IProductImageResponse>;
  findById(id: string): Promise<IProductImageResponse | null>;
  update(id: string, data: IUpdateProductImageRequest): Promise<IProductImageResponse>;
  delete(id: string): Promise<void>;
  
  // 查询操作
  findByProductId(productId: string, type?: string): Promise<IProductImageResponse[]>;
  findWithPagination(query: IProductImageQuery): Promise<IProductImagePageResponse>;
  
  // 批量操作
  batchCreate(data: IBatchCreateProductImageRequest): Promise<IProductImageResponse[]>;
  batchUpdateSort(data: IBatchUpdateSortRequest): Promise<void>;
  batchDelete(ids: string[]): Promise<void>;
  
  // 业务操作
  setMainImage(productId: string, imageId: string): Promise<void>;
  getImagesByType(productId: string, type: 'main' | 'detail' | 'sku'): Promise<IProductImageResponse[]>;
  reorderImages(productId: string, imageIds: string[]): Promise<void>;
  
  // 统计信息
  getStats(): Promise<IProductImageStats>;
} 