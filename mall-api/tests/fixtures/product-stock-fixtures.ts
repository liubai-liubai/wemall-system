/**
 * 商品库存测试数据集
 * @author 刘白 & AI Assistant
 */

import {
  IProductStock,
  IProductStockLog,
  ICreateStockRequest,
  IUpdateStockRequest,
  IStockAdjustRequest,
  IBatchStockAdjustRequest,
  IStockResponse,
  IStockLogResponse,
  StockType,
  StockLogType
} from '../../src/types/product-stock';

// 基础库存数据
export const mockStockData: IProductStock[] = [
  {
    id: 'stock-001',
    product_id: 'product-001',
    sku_id: 'sku-001',
    warehouse_id: 'warehouse-001',
    stock_type: 'sellable',
    quantity: 100,
    warning_line: 10,
    updated_at: new Date('2023-12-01T10:00:00Z'),
    created_at: new Date('2023-12-01T09:00:00Z')
  },
  {
    id: 'stock-002',
    product_id: 'product-001',
    sku_id: 'sku-001',
    warehouse_id: 'warehouse-001',
    stock_type: 'locked',
    quantity: 5,
    warning_line: 0,
    updated_at: new Date('2023-12-01T11:00:00Z'),
    created_at: new Date('2023-12-01T09:00:00Z')
  },
  {
    id: 'stock-003',
    product_id: 'product-002',
    sku_id: 'sku-002',
    warehouse_id: 'warehouse-001',
    stock_type: 'sellable',
    quantity: 5,
    warning_line: 10,
    updated_at: new Date('2023-12-01T12:00:00Z'),
    created_at: new Date('2023-12-01T09:00:00Z')
  },
  {
    id: 'stock-004',
    product_id: 'product-003',
    sku_id: 'sku-003',
    warehouse_id: 'warehouse-002',
    stock_type: 'sellable',
    quantity: 0,
    warning_line: 5,
    updated_at: new Date('2023-12-01T13:00:00Z'),
    created_at: new Date('2023-12-01T09:00:00Z')
  }
];

// 库存日志数据
export const mockStockLogData: IProductStockLog[] = [
  {
    id: 'log-001',
    stock_id: 'stock-001',
    change: 50,
    type: 'in',
    order_id: undefined,
    remark: '入库补货',
    created_at: new Date('2023-12-01T10:00:00Z')
  },
  {
    id: 'log-002',
    stock_id: 'stock-001',
    change: -10,
    type: 'out',
    order_id: 'order-001',
    remark: '订单销售',
    created_at: new Date('2023-12-01T11:00:00Z')
  },
  {
    id: 'log-003',
    stock_id: 'stock-001',
    change: -5,
    type: 'lock',
    order_id: 'order-002',
    remark: '订单锁定',
    created_at: new Date('2023-12-01T12:00:00Z')
  },
  {
    id: 'log-004',
    stock_id: 'stock-003',
    change: -10,
    type: 'adjust',
    order_id: undefined,
    remark: '库存盘点调整',
    created_at: new Date('2023-12-01T13:00:00Z')
  }
];

// 创建库存请求数据
export const createStockRequests: ICreateStockRequest[] = [
  {
    product_id: 'product-001',
    sku_id: 'sku-001',
    warehouse_id: 'warehouse-001',
    stock_type: 'sellable',
    quantity: 100,
    warning_line: 10
  },
  {
    product_id: 'product-002',
    sku_id: 'sku-002',
    warehouse_id: 'warehouse-001',
    stock_type: 'sellable',
    quantity: 50,
    warning_line: 5
  },
  {
    product_id: 'product-003',
    sku_id: 'sku-003',
    warehouse_id: 'warehouse-002',
    stock_type: 'sellable',
    quantity: 0,
    warning_line: 10
  }
];

// 无效的创建库存请求数据
export const invalidCreateStockRequests = [
  {
    // 缺少product_id
    sku_id: 'sku-001',
    warehouse_id: 'warehouse-001',
    stock_type: 'sellable' as StockType,
    quantity: 100,
    warning_line: 10
  },
  {
    product_id: 'product-001',
    // 缺少sku_id
    warehouse_id: 'warehouse-001',
    stock_type: 'sellable' as StockType,
    quantity: 100,
    warning_line: 10
  },
  {
    product_id: 'nonexistent-product',
    sku_id: 'sku-001',
    warehouse_id: 'warehouse-001',
    stock_type: 'sellable' as StockType,
    quantity: 100,
    warning_line: 10
  },
  {
    product_id: 'product-001',
    sku_id: 'nonexistent-sku',
    warehouse_id: 'warehouse-001',
    stock_type: 'sellable' as StockType,
    quantity: 100,
    warning_line: 10
  }
];

// 更新库存请求数据
export const updateStockRequests: IUpdateStockRequest[] = [
  {
    quantity: 150,
    warning_line: 15
  },
  {
    quantity: 0,
    warning_line: 5
  },
  {
    stock_type: 'warning'
  }
];

// 库存调整请求数据
export const stockAdjustRequests: IStockAdjustRequest[] = [
  {
    stock_id: 'stock-001',
    change: 50,
    type: 'in',
    order_id: undefined,
    remark: '入库补货'
  },
  {
    stock_id: 'stock-001',
    change: -10,
    type: 'out',
    order_id: 'order-001',
    remark: '订单销售'
  },
  {
    stock_id: 'stock-001',
    change: -5,
    type: 'lock',
    order_id: 'order-002',
    remark: '订单锁定'
  },
  {
    stock_id: 'stock-001',
    change: 3,
    type: 'adjust',
    order_id: undefined,
    remark: '库存盘点调整'
  }
];

// 无效的库存调整请求数据
export const invalidStockAdjustRequests: IStockAdjustRequest[] = [
  {
    stock_id: 'nonexistent-stock',
    change: 50,
    type: 'in',
    order_id: undefined,
    remark: '测试无效库存ID'
  },
  {
    stock_id: 'stock-001',
    change: -200, // 超过当前库存的负调整
    type: 'out',
    order_id: 'order-003',
    remark: '库存不足测试'
  }
];

// 批量库存调整请求数据
export const batchStockAdjustRequest: IBatchStockAdjustRequest = {
  adjustments: [
    {
      stock_id: 'stock-001',
      change: 10,
      type: 'in',
      order_id: undefined,
      remark: '批量入库1'
    },
    {
      stock_id: 'stock-003',
      change: 20,
      type: 'in',
      order_id: undefined,
      remark: '批量入库2'
    }
  ]
};

// 无效的批量库存调整请求（重复库存ID）
export const invalidBatchStockAdjustRequest: IBatchStockAdjustRequest = {
  adjustments: [
    {
      stock_id: 'stock-001',
      change: 10,
      type: 'in',
      order_id: undefined,
      remark: '批量入库1'
    },
    {
      stock_id: 'stock-001', // 重复的库存ID
      change: 5,
      type: 'in',
      order_id: undefined,
      remark: '批量入库2'
    }
  ]
};

// Mock库存响应数据
export const mockStockResponse: IStockResponse = {
  id: 'stock-001',
  product_id: 'product-001',
  sku_id: 'sku-001',
  warehouse_id: 'warehouse-001',
  stock_type: 'sellable',
  quantity: 100,
  warning_line: 10,
  updated_at: new Date('2023-12-01T10:00:00Z'),
  created_at: new Date('2023-12-01T09:00:00Z'),
  product: {
    id: 'product-001',
    name: '精品苹果',
    main_image: 'https://example.com/apple.jpg'
  },
  sku: {
    id: 'sku-001',
    sku_code: 'APPLE-RED-500G',
    price: 12.50,
    attributes: { color: 'red', weight: '500g' }
  },
  is_low_stock: false
};

// Mock低库存响应数据
export const mockLowStockResponse: IStockResponse = {
  id: 'stock-003',
  product_id: 'product-002',
  sku_id: 'sku-002',
  warehouse_id: 'warehouse-001',
  stock_type: 'sellable',
  quantity: 5,
  warning_line: 10,
  updated_at: new Date('2023-12-01T12:00:00Z'),
  created_at: new Date('2023-12-01T09:00:00Z'),
  product: {
    id: 'product-002',
    name: '进口橙子',
    main_image: 'https://example.com/orange.jpg'
  },
  sku: {
    id: 'sku-002',
    sku_code: 'ORANGE-IM-1KG',
    price: 25.00,
    attributes: { type: 'imported', weight: '1kg' }
  },
  is_low_stock: true
};

// Mock库存日志响应数据
export const mockStockLogResponse: IStockLogResponse = {
  id: 'log-001',
  stock_id: 'stock-001',
  change: 50,
  type: 'in',
  order_id: undefined,
  remark: '入库补货',
  created_at: new Date('2023-12-01T10:00:00Z'),
  stock: {
    id: 'stock-001',
    product_id: 'product-001',
    sku_id: 'sku-001',
    quantity: 150
  },
  product: {
    id: 'product-001',
    name: '精品苹果'
  },
  sku: {
    id: 'sku-001',
    sku_code: 'APPLE-RED-500G'
  }
};

// 测试用的库存类型值
export const stockTypes: StockType[] = ['sellable', 'locked', 'warning'];
export const invalidStockTypes = ['invalid', '', null, undefined, 123];

// 测试用的库存日志类型值
export const stockLogTypes: StockLogType[] = ['in', 'out', 'lock', 'unlock', 'adjust'];
export const invalidStockLogTypes = ['invalid', '', null, undefined, 123];

// 测试用的数量值
export const validQuantities = [0, 1, 10, 100, 1000, 9999];
export const invalidQuantities = [-1, -10, 0.5, 'invalid', null, undefined, NaN, Infinity];

// 测试用的预警线值
export const validWarningLines = [0, 1, 5, 10, 50, 100];
export const invalidWarningLines = [-1, -10, 0.5, 'invalid', null, undefined, NaN];

// 库存锁定测试数据
export const stockLockTestCases = [
  {
    stockId: 'stock-001',
    lockQuantity: 10,
    orderId: 'order-001',
    description: '正常库存锁定'
  },
  {
    stockId: 'stock-001',
    lockQuantity: 5,
    orderId: undefined,
    description: '无订单ID的库存锁定'
  },
  {
    stockId: 'stock-001',
    lockQuantity: 200,
    orderId: 'order-002',
    description: '库存不足的锁定测试',
    shouldFail: true
  },
  {
    stockId: 'nonexistent-stock',
    lockQuantity: 10,
    orderId: 'order-003',
    description: '不存在的库存ID锁定测试',
    shouldFail: true
  }
];

// 库存释放测试数据
export const stockReleaseTestCases = [
  {
    stockId: 'stock-002',
    releaseQuantity: 3,
    orderId: 'order-001',
    description: '正常库存释放'
  },
  {
    stockId: 'stock-002',
    releaseQuantity: 10,
    orderId: 'order-002',
    description: '释放数量超过锁定库存',
    shouldFail: true
  },
  {
    stockId: 'nonexistent-stock',
    releaseQuantity: 5,
    orderId: 'order-003',
    description: '不存在的库存ID释放测试',
    shouldFail: true
  }
]; 