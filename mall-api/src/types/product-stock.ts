/**
 * 库存管理类型定义
 * @author 刘白 & AI Assistant
 */

// 库存类型枚举
export type StockType = 'sellable' | 'locked' | 'warning';

// 库存变动类型枚举
export type StockLogType = 'in' | 'out' | 'lock' | 'unlock' | 'adjust';

// 库存实体
export interface IProductStock {
  id: string;
  product_id: string;
  sku_id: string;
  warehouse_id?: string;
  stock_type: StockType;
  quantity: number;
  warning_line: number;
  updated_at: Date;
  created_at: Date;
}

// 库存日志实体
export interface IProductStockLog {
  id: string;
  stock_id: string;
  change: number;
  type: StockLogType;
  order_id?: string;
  remark?: string;
  created_at: Date;
}

// 创建库存请求
export interface ICreateStockRequest {
  product_id: string;
  sku_id: string;
  warehouse_id?: string;
  stock_type?: StockType;
  quantity?: number;
  warning_line?: number;
}

// 更新库存请求
export interface IUpdateStockRequest {
  quantity?: number;
  warning_line?: number;
  stock_type?: StockType;
}

// 库存调整请求
export interface IStockAdjustRequest {
  stock_id: string;
  change: number;
  type: StockLogType;
  order_id?: string;
  remark?: string;
}

// 批量库存调整请求
export interface IBatchStockAdjustRequest {
  adjustments: IStockAdjustRequest[];
}

// 库存查询条件
export interface IStockQuery {
  page?: number;
  size?: number;
  product_id?: string;
  sku_id?: string;
  warehouse_id?: string;
  stock_type?: StockType;
  low_stock?: boolean; // 是否查询低库存
  keyword?: string;
  sort_by?: 'quantity' | 'warning_line' | 'updated_at' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// 库存日志查询条件
export interface IStockLogQuery {
  page?: number;
  size?: number;
  stock_id?: string;
  product_id?: string;
  sku_id?: string;
  type?: StockLogType;
  order_id?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'created_at';
  sort_order?: 'asc' | 'desc';
}

// 库存响应
export interface IStockResponse extends IProductStock {
  product?: {
    id: string;
    name: string;
    main_image?: string;
  };
  sku?: {
    id: string;
    sku_code: string;
    price: number;
    attributes?: any;
  };
  is_low_stock?: boolean; // 是否为低库存
}

// 库存日志响应
export interface IStockLogResponse extends IProductStockLog {
  stock?: {
    id: string;
    product_id: string;
    sku_id: string;
    quantity: number;
  };
  product?: {
    id: string;
    name: string;
  };
  sku?: {
    id: string;
    sku_code: string;
  };
}

// 分页响应
export interface IStockPageResponse {
  list: IStockResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface IStockLogPageResponse {
  list: IStockLogResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// 库存统计信息
export interface IStockStats {
  total_stocks: number;
  total_quantity: number;
  low_stock_count: number;
  out_of_stock_count: number;
  warning_count: number;
  by_stock_type: {
    sellable: number;
    locked: number;
    warning: number;
  };
  recent_adjustments: number; // 最近7天调整次数
  top_products: {
    product_id: string;
    product_name: string;
    total_quantity: number;
  }[];
}

// 库存预警信息
export interface IStockAlert {
  id: string;
  product_id: string;
  product_name: string;
  sku_id: string;
  sku_name: string;
  current_quantity: number;
  warning_line: number;
  shortage: number; // 缺货数量
  alert_level: 'warning' | 'critical'; // 预警级别
}

// 库存服务接口
export interface IProductStockService {
  // 基础CRUD
  create(data: ICreateStockRequest): Promise<IStockResponse>;
  findById(id: string): Promise<IStockResponse | null>;
  update(id: string, data: IUpdateStockRequest): Promise<IStockResponse>;
  delete(id: string): Promise<void>;
  
  // 查询操作
  findWithPagination(query: IStockQuery): Promise<IStockPageResponse>;
  findBySku(skuId: string): Promise<IStockResponse | null>;
  findByProduct(productId: string): Promise<IStockResponse[]>;
  
  // 库存调整
  adjustStock(data: IStockAdjustRequest): Promise<IStockLogResponse>;
  batchAdjustStock(data: IBatchStockAdjustRequest): Promise<IStockLogResponse[]>;
  
  // 库存锁定/解锁
  lockStock(stockId: string, quantity: number, orderId?: string): Promise<void>;
  unlockStock(stockId: string, quantity: number, orderId?: string): Promise<void>;
  
  // 库存预警
  getStockAlerts(): Promise<IStockAlert[]>;
  getLowStocks(warningLine?: number): Promise<IStockResponse[]>;
  
  // 日志查询
  getStockLogs(query: IStockLogQuery): Promise<IStockLogPageResponse>;
  getStockHistory(stockId: string): Promise<IStockLogResponse[]>;
  
  // 统计信息
  getStats(): Promise<IStockStats>;
  
  // 业务操作
  checkStockAvailability(skuId: string, quantity: number): Promise<boolean>;
  reserveStock(skuId: string, quantity: number, orderId: string): Promise<void>;
  releaseStock(skuId: string, quantity: number, orderId: string): Promise<void>;
} 