/**
 * SKU管理测试数据fixtures
 * 为SKU服务测试提供模拟数据和测试用例
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Decimal } from '@prisma/client/runtime/library';

/**
 * 基础SKU数据
 * 包含完整的SKU信息和关联商品数据
 */
export const mockSkus = [
  {
    id: 'sku-001',
    product_id: 'product-001',
    sku_code: 'SKU001-RED-L',
    price: new Decimal(99.99),
    stock: 100,
    attributes: {
      color: '红色',
      size: 'L',
      material: '纯棉'
    },
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-001',
      name: '时尚T恤',
      category_id: 'cat-001',
      status: 1
    }
  },
  {
    id: 'sku-002',
    product_id: 'product-001',
    sku_code: 'SKU001-BLUE-M',
    price: new Decimal(89.99),
    stock: 50,
    attributes: {
      color: '蓝色',
      size: 'M',
      material: '纯棉'
    },
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-001',
      name: '时尚T恤',
      category_id: 'cat-001',
      status: 1
    }
  },
  {
    id: 'sku-003',
    product_id: 'product-002',
    sku_code: 'SKU002-WHITE-S',
    price: new Decimal(79.99),
    stock: 0,
    attributes: {
      color: '白色',
      size: 'S',
      material: '混纺'
    },
    status: 0, // 已禁用
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-002',
      name: '休闲衬衫',
      category_id: 'cat-002',
      status: 0 // 商品已下架
    }
  },
  {
    id: 'sku-004',
    product_id: 'product-003',
    sku_code: 'SKU003-BLACK-XL',
    price: new Decimal(129.99),
    stock: 200,
    attributes: {
      color: '黑色',
      size: 'XL',
      material: '涤纶'
    },
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-003',
      name: '运动夹克',
      category_id: 'cat-003',
      status: 1
    }
  }
];

/**
 * SKU查询参数测试数据
 */
export const skuQueryParams = {
  valid: [
    {
      page: 1,
      size: 10,
      sort: 'created_at',
      order: 'desc'
    },
    {
      productId: 'product-001',
      status: 1,
      minPrice: 50,
      maxPrice: 150,
      page: 1,
      size: 20
    },
    {
      skuCode: 'SKU001',
      sort: 'price',
      order: 'asc'
    }
  ],
  invalid: [
    {
      page: 0, // 无效页码
      size: -1, // 无效页大小
      sort: 'invalid_field',
      order: 'invalid_order'
    },
    {
      productId: '',
      status: 999,
      minPrice: -1,
      maxPrice: -1,
      page: -1,
      size: 0
    }
  ],
  boundary: [
    {
      page: 999999,
      size: 1000,
      minPrice: 0.01,
      maxPrice: 999999.99
    },
    {
      productId: 'non-existent-product',
      skuCode: 'a'.repeat(100)
    }
  ]
};

/**
 * SKU创建请求测试数据
 */
export const skuCreateRequests = {
  valid: [
    {
      productId: 'product-001',
      skuCode: 'NEW-SKU-001',
      price: 99.99,
      stock: 100,
      attributes: {
        color: '绿色',
        size: 'L'
      },
      status: 1
    },
    {
      productId: 'product-002',
      skuCode: 'NEW-SKU-002',
      price: 49.99,
      stock: 0, // 允许0库存
      attributes: {},
      status: 1
    },
    {
      productId: 'product-003',
      skuCode: 'NEW-SKU-003',
      price: 199.99,
      stock: 500,
      attributes: {
        color: '紫色',
        size: 'XXL',
        material: '真丝'
      }
      // status 可选，默认为1
    }
  ],
  invalid: [
    {
      productId: '', // 空商品ID
      skuCode: 'INVALID-SKU-001',
      price: 99.99,
      stock: 100,
      status: 1
    },
    {
      productId: 'product-001',
      skuCode: '', // 空SKU编码
      price: 99.99,
      stock: 100,
      status: 1
    },
    {
      productId: 'product-001',
      skuCode: 'INVALID-SKU-002',
      price: -1, // 负价格
      stock: -1, // 负库存
      status: 999 // 无效状态
    },
    {
      productId: 'non-existent-product',
      skuCode: 'INVALID-SKU-003',
      price: 99.99,
      stock: 100,
      status: 1
    }
  ],
  edge: [
    {
      productId: 'product-001',
      skuCode: 'a'.repeat(100), // 超长SKU编码
      price: 999999.99, // 极高价格
      stock: 999999, // 极大库存
      attributes: {
        longAttribute: 'a'.repeat(1000)
      },
      status: 1
    }
  ]
};

/**
 * SKU更新请求测试数据
 */
export const skuUpdateRequests = {
  valid: [
    {
      skuCode: 'UPDATED-SKU-001',
      price: 119.99,
      stock: 150,
      status: 1
    },
    {
      price: 59.99 // 只更新价格
    },
    {
      stock: 200 // 只更新库存
    },
    {
      attributes: {
        color: '橙色',
        size: 'XXL'
      }
    }
  ],
  invalid: [
    {
      skuCode: '', // 空编码
      price: -1, // 负价格
      stock: -1 // 负库存
    },
    {
      price: 'invalid_price', // 无效价格类型
      stock: 'invalid_stock', // 无效库存类型
      status: 999 // 无效状态
    }
  ],
  partial: [
    { skuCode: '部分更新-编码' },
    { price: 88.88 },
    { stock: 333 },
    { status: 0 },
    { attributes: { newAttr: '新属性' } }
  ]
};

/**
 * SKU库存调整测试数据
 */
export const skuStockAdjustments = {
  valid: [
    {
      skuId: 'sku-001',
      adjustment: 50, // 增加库存
      reason: '采购入库'
    },
    {
      skuId: 'sku-002',
      adjustment: -10, // 减少库存
      reason: '销售出库'
    },
    {
      skuId: 'sku-004',
      adjustment: 0, // 无调整
      reason: '库存盘点'
    }
  ],
  invalid: [
    {
      skuId: '', // 空SKU ID
      adjustment: 50,
      reason: '无效操作'
    },
    {
      skuId: 'sku-001',
      adjustment: 'invalid', // 无效调整数量
      reason: '无效操作'
    },
    {
      skuId: 'non-existent-sku',
      adjustment: 50,
      reason: 'SKU不存在'
    }
  ],
  boundary: [
    {
      skuId: 'sku-001',
      adjustment: 999999, // 极大调整量
      reason: '边界测试'
    },
    {
      skuId: 'sku-002',
      adjustment: -999999, // 极大减少量
      reason: '边界测试'
    }
  ]
};

/**
 * SKU批量操作测试数据
 */
export const skuBatchOperations = {
  valid: [
    {
      operation: 'updatePrice',
      skuIds: ['sku-001', 'sku-002'],
      data: { priceMultiplier: 1.1 } // 价格上涨10%
    },
    {
      operation: 'updateStatus',
      skuIds: ['sku-003', 'sku-004'],
      data: { status: 0 } // 批量禁用
    },
    {
      operation: 'adjustStock',
      skuIds: ['sku-001', 'sku-002', 'sku-004'],
      data: { adjustment: 20, reason: '批量补货' }
    }
  ],
  invalid: [
    {
      operation: 'invalid_operation',
      skuIds: ['sku-001'],
      data: {}
    },
    {
      operation: 'updatePrice',
      skuIds: [], // 空ID列表
      data: { priceMultiplier: 1.1 }
    },
    {
      operation: 'updatePrice',
      skuIds: ['sku-001'],
      data: { priceMultiplier: -1 } // 无效倍数
    }
  ]
};

/**
 * SKU库存统计测试数据
 */
export const skuStockStats = {
  expected: {
    totalSkus: 4,
    activeSkus: 3,
    inactiveSkus: 1,
    totalStock: 350, // 100+50+0+200
    lowStockSkus: 1, // sku-003库存为0
    outOfStockSkus: 1, // sku-003库存为0
    averagePrice: 97.49, // (99.99+89.99+79.99+129.99)/4
    totalValue: 34122.50 // 价格×库存的总和
  },
  thresholds: {
    lowStockThreshold: 10,
    outOfStockThreshold: 0
  }
};

/**
 * SKU删除场景测试数据
 */
export const skuDeleteScenarios = [
  {
    skuId: 'sku-004',
    hasCartItems: false,
    hasOrders: false,
    canDelete: true,
    description: '无购物车记录无订单记录，可以删除'
  },
  {
    skuId: 'sku-001',
    hasCartItems: true,
    hasOrders: false,
    canDelete: false,
    description: '有购物车记录，不能删除'
  },
  {
    skuId: 'sku-002',
    hasCartItems: false,
    hasOrders: true,
    canDelete: false,
    description: '有订单记录，不能删除'
  },
  {
    skuId: 'non-existent-sku',
    hasCartItems: false,
    hasOrders: false,
    canDelete: false,
    description: 'SKU不存在'
  }
];

/**
 * 响应格式验证数据
 */
export const skuResponseFormats = {
  list: {
    requiredFields: ['list', 'total', 'page', 'size', 'pages'],
    listItemFields: ['id', 'product_id', 'sku_code', 'price', 'stock', 'status', 'created_at', 'updated_at']
  },
  detail: {
    requiredFields: ['id', 'product_id', 'sku_code', 'price', 'stock', 'attributes', 'status', 'created_at', 'updated_at'],
    optionalFields: ['product']
  },
  stats: {
    requiredFields: ['totalSkus', 'activeSkus', 'totalStock', 'lowStockSkus', 'outOfStockSkus'],
    optionalFields: ['averagePrice', 'totalValue']
  }
};

/**
 * 业务规则验证数据
 */
export const skuBusinessRules = {
  maxSkuCodeLength: 100, // SKU编码最大长度
  maxPrice: 999999.99, // 最大价格
  minPrice: 0.01, // 最小价格
  maxStock: 999999, // 最大库存
  minStock: 0, // 最小库存
  defaultStatus: 1, // 默认状态（启用）
  lowStockThreshold: 10, // 低库存阈值
  outOfStockThreshold: 0 // 缺货阈值
};

/**
 * 常用测试常量
 */
export const SKU_TEST_CONSTANTS = {
  VALID_SKU_ID: 'sku-001',
  INVALID_SKU_ID: 'invalid-sku-id',
  NON_EXISTENT_ID: 'non-existent-sku-id',
  ACTIVE_SKU_ID: 'sku-001',
  INACTIVE_SKU_ID: 'sku-003',
  OUT_OF_STOCK_SKU_ID: 'sku-003',
  HIGH_STOCK_SKU_ID: 'sku-004',
  VALID_PRODUCT_ID: 'product-001',
  INVALID_PRODUCT_ID: 'invalid-product-id',
  DEFAULT_PAGE_SIZE: 10,
  MAX_BATCH_SIZE: 100
}; 