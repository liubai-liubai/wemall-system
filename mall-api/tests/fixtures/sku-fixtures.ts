/**
 * SKU服务测试 fixtures
 * 提供SKU管理测试所需的各种数据
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Decimal } from '@prisma/client/runtime/library';
import {
  ISkuCreateParams,
  ISkuUpdateParams,
  ISkuQueryParams,
  ISkuDetail,
  ISkuStockStats,
  ISkuBatchParams
} from '../../src/types/sku';

// 基础SKU数据
export const basicSkuData: ISkuDetail[] = [
  {
    id: 'sku_001',
    productId: 'prod_001',
    skuCode: 'SP001-RED-M',
    price: 99.90,
    stock: 100,
    attributes: { color: '红色', size: 'M' },
    status: 1,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'prod_001',
      name: '时尚T恤',
      categoryId: 'cat_001',
      status: 1
    }
  },
  {
    id: 'sku_002',
    productId: 'prod_001',
    skuCode: 'SP001-BLUE-L',
    price: 109.90,
    stock: 50,
    attributes: { color: '蓝色', size: 'L' },
    status: 1,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    product: {
      id: 'prod_001',
      name: '时尚T恤',
      categoryId: 'cat_001',
      status: 1
    }
  },
  {
    id: 'sku_003',
    productId: 'prod_002',
    skuCode: 'SP002-BLACK-S',
    price: 299.00,
    stock: 0, // 无库存
    attributes: { color: '黑色', size: 'S' },
    status: 0, // 已禁用
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z'),
    product: {
      id: 'prod_002',
      name: '商务外套',
      categoryId: 'cat_002',
      status: 1
    }
  },
  {
    id: 'sku_004',
    productId: 'prod_003',
    skuCode: 'SP003-WHITE-XL',
    price: 79.90,
    stock: 5, // 低库存
    attributes: { color: '白色', size: 'XL' },
    status: 1,
    createdAt: new Date('2024-01-04T00:00:00Z'),
    updatedAt: new Date('2024-01-04T00:00:00Z'),
    product: {
      id: 'prod_003',
      name: '休闲衬衫',
      categoryId: 'cat_003',
      status: 1
    }
  }
];

// SKU创建测试数据
export const skuCreateTestData: ISkuCreateParams[] = [
  {
    productId: 'prod_001',
    skuCode: 'SP001-GREEN-M',
    price: 119.90,
    stock: 80,
    attributes: { color: '绿色', size: 'M' },
    status: 1
  },
  {
    productId: 'prod_002',
    skuCode: 'SP002-NAVY-L',
    price: 259.00,
    stock: 30,
    attributes: { color: '深蓝色', size: 'L' },
    status: 1
  },
  {
    productId: 'prod_invalid', // 无效商品ID
    skuCode: 'SP999-TEST',
    price: 99.90,
    stock: 10
  }
];

// SKU更新测试数据
export const skuUpdateTestData: ISkuUpdateParams[] = [
  {
    skuCode: 'SP001-RED-M-V2',
    price: 129.90,
    stock: 120,
    attributes: { color: '红色', size: 'M', version: 'V2' },
    status: 1
  },
  {
    price: 89.90, // 只更新价格
  },
  {
    stock: 0, // 只更新库存
    status: 0 // 同时更新状态
  },
  {
    skuCode: 'SP001-RED-M', // 重复的SKU编码
    price: 99.90
  }
];

// SKU查询参数测试数据
export const skuQueryTestData: ISkuQueryParams[] = [
  {
    page: 1,
    size: 10
  },
  {
    page: 1,
    size: 20,
    productId: 'prod_001'
  },
  {
    page: 1,
    size: 10,
    skuCode: 'SP001',
    status: 1
  },
  {
    page: 1,
    size: 10,
    minPrice: 100,
    maxPrice: 300,
    sort: 'price',
    order: 'asc'
  },
  {
    page: 2,
    size: 5,
    sort: 'stock',
    order: 'desc'
  }
];

// 批量操作测试数据
export const skuBatchTestData: ISkuBatchParams[] = [
  {
    ids: ['sku_001', 'sku_002'],
    action: 'enable'
  },
  {
    ids: ['sku_003', 'sku_004'],
    action: 'disable'
  },
  {
    ids: ['sku_001'],
    action: 'delete'
  },
  {
    ids: ['sku_002', 'sku_004'],
    action: 'adjustStock',
    stockAdjustment: 10
  },
  {
    ids: ['sku_001', 'sku_002'],
    action: 'adjustStock',
    stockAdjustment: -200 // 导致负库存的调整
  }
];

// SKU库存统计测试数据
export const skuStockStatsTestData: ISkuStockStats[] = [
  {
    totalSkus: 10,
    lowStockSkus: 3,
    outOfStockSkus: 2,
    totalStockValue: 1500
  },
  {
    totalSkus: 0,
    lowStockSkus: 0,
    outOfStockSkus: 0,
    totalStockValue: 0
  }
];

// 无效数据测试用例
export const invalidSkuData = {
  // 无效的创建请求
  invalidCreateRequests: [
    {
      productId: '', // 空商品ID
      skuCode: 'SP001-TEST',
      price: 99.90,
      stock: 10
    },
    {
      productId: 'prod_001',
      skuCode: '', // 空SKU编码
      price: 99.90,
      stock: 10
    },
    {
      productId: 'prod_001',
      skuCode: 'SP001-TEST',
      price: -1, // 负价格
      stock: 10
    },
    {
      productId: 'prod_001',
      skuCode: 'SP001-TEST',
      price: 99.90,
      stock: -1 // 负库存
    }
  ],
  
  // 无效的更新请求
  invalidUpdateRequests: [
    {
      skuCode: '', // 空SKU编码
      price: 99.90
    },
    {
      price: -1 // 负价格
    },
    {
      stock: -1 // 负库存
    },
    {
      status: 2 // 无效状态值
    }
  ],
  
  // 无效的查询参数
  invalidQueryParams: [
    {
      page: 0, // 无效页码
      size: 10
    },
    {
      page: 1,
      size: 0 // 无效页大小
    },
    {
      page: 1,
      size: 10,
      minPrice: 100,
      maxPrice: 50 // 最小价格大于最大价格
    },
    {
      page: 1,
      size: 10,
      sort: 'invalid_field' // 无效排序字段
    }
  ]
};

// Mock响应数据
export const mockSkuResponses = {
  createSuccess: {
    id: 'sku_new_001',
    productId: 'prod_001',
    skuCode: 'SP001-GREEN-M',
    price: 119.90,
    stock: 80,
    attributes: { color: '绿色', size: 'M' },
    status: 1
  },
  
  updateSuccess: {
    id: 'sku_001',
    skuCode: 'SP001-RED-M-V2',
    price: 129.90,
    stock: 120
  },
  
  deleteSuccess: true,
  
  listResponse: {
    list: basicSkuData.slice(0, 2),
    total: 10,
    page: 1,
    size: 2,
    pages: 5
  },
  
  batchOperationSuccess: {
    successCount: 2,
    failureCount: 0,
    details: [
      { id: 'sku_001', success: true },
      { id: 'sku_002', success: true }
    ]
  },
  
  stockStatsResponse: {
    totalSkus: 10,
    lowStockSkus: 3,
    outOfStockSkus: 2,
    totalStockValue: 1500
  }
};

// 测试常量
export const SKU_TEST_CONSTANTS = {
  VALID_PRODUCT_ID: 'test_product_001',
  VALID_SKU_CODE: 'TEST-SKU-001',
  INVALID_SKU_ID: 'invalid_sku_id',
  DEFAULT_PRICE: 99.90,
  DEFAULT_STOCK: 100,
  LOW_STOCK_THRESHOLD: 10,
  MAX_PRICE: 99999.99,
  MIN_PRICE: 0.01,
  MAX_STOCK: 999999,
  MIN_STOCK: 0
};

// 边界值测试数据
export const skuBoundaryTestData = {
  priceValues: [0.01, 99999.99, 100000.00], // 最小值、最大值、超出范围
  stockValues: [0, 999999, 1000000], // 最小值、最大值、超出范围
  skuCodeLengths: [
    'A', // 最短
    'A'.repeat(50), // 正常长度
    'A'.repeat(100) // 可能过长
  ],
  attributeComplexity: [
    {}, // 空属性
    { color: '红色' }, // 简单属性
    { 
      color: '红色',
      size: 'M',
      material: '棉',
      style: '休闲',
      season: '春季'
    } // 复杂属性
  ]
};

// 业务规则测试数据
export const skuBusinessRules = {
  // SKU编码规则
  validSkuCodes: [
    'SP001-RED-M',
    'PROD-001-VAR-001',
    'SKU_TEST_123',
    'item-red-size-large'
  ],
  
  invalidSkuCodes: [
    '', // 空编码
    '   ', // 空白字符
    'SP001 RED M', // 包含空格
    'SP001@RED#M' // 包含特殊字符
  ],
  
  // 状态转换规则
  statusTransitions: [
    { from: 0, to: 1, valid: true }, // 禁用 -> 启用
    { from: 1, to: 0, valid: true }, // 启用 -> 禁用
    { from: 1, to: 2, valid: false }, // 无效状态
    { from: 0, to: -1, valid: false } // 无效状态
  ],
  
  // 库存调整规则
  stockAdjustments: [
    { current: 100, adjustment: 50, expected: 150 },
    { current: 100, adjustment: -50, expected: 50 },
    { current: 100, adjustment: -100, expected: 0 },
    { current: 100, adjustment: -150, valid: false }, // 导致负库存
    { current: 0, adjustment: -1, valid: false } // 导致负库存
  ]
};

// 性能测试数据
export const skuPerformanceTestData = {
  largeBatchSize: 1000,
  smallBatchSize: 10,
  mediumBatchSize: 100,
  
  // 大量SKU数据生成函数
  generateSkuData: (count: number) => {
    const skus = [];
    for (let i = 0; i < count; i++) {
      skus.push({
        productId: `prod_${String(i).padStart(3, '0')}`,
        skuCode: `SKU-${String(i).padStart(6, '0')}`,
        price: Math.round((Math.random() * 1000 + 10) * 100) / 100,
        stock: Math.floor(Math.random() * 1000),
        attributes: {
          color: ['红色', '蓝色', '绿色', '黑色', '白色'][i % 5],
          size: ['S', 'M', 'L', 'XL', 'XXL'][i % 5]
        },
        status: Math.random() > 0.1 ? 1 : 0 // 90%启用，10%禁用
      });
    }
    return skus;
  }
}; 