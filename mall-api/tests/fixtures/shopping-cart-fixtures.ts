/**
 * 购物车服务测试 fixtures
 * 提供购物车测试所需的各种数据
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Decimal } from '@prisma/client/runtime/library';
import { 
  IShoppingCart, 
  IShoppingCartDetail,
  IAddToCartParams,
  IUpdateCartParams,
  ICartQueryParams,
  IBatchCartParams,
  ICartStatistics,
  ICartValidation
} from '../../src/types/shopping-cart';

// 基础购物车数据
export const basicCartData: IShoppingCart[] = [
  {
    id: 'cart_001',
    userId: 'user_001',
    skuId: 'sku_001',
    quantity: 2,
    checked: 1,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'cart_002',
    userId: 'user_001',
    skuId: 'sku_002',
    quantity: 1,
    checked: 0,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z')
  },
  {
    id: 'cart_003',
    userId: 'user_002',
    skuId: 'sku_003',
    quantity: 3,
    checked: 1,
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z')
  }
];

// SKU测试数据
export const skuTestData = [
  {
    id: 'sku_001',
    product_id: 'prod_001',
    sku_code: 'SP001-RED-M',
    price: new Decimal(99.90),
    stock: 100,
    attributes: { color: '红色', size: 'M' },
    status: 1,
    product: {
      id: 'prod_001',
      name: '时尚T恤',
      main_image: 'https://example.com/tshirt.jpg',
      category_id: 'cat_001',
      brand: '潮流品牌',
      status: 1
    }
  },
  {
    id: 'sku_002', 
    product_id: 'prod_002',
    sku_code: 'SP002-BLUE-L',
    price: new Decimal(159.00),
    stock: 50,
    attributes: { color: '蓝色', size: 'L' },
    status: 1,
    product: {
      id: 'prod_002',
      name: '舒适牛仔裤',
      main_image: 'https://example.com/jeans.jpg',
      category_id: 'cat_002',
      brand: '经典品牌',
      status: 1
    }
  },
  {
    id: 'sku_003',
    product_id: 'prod_003', 
    sku_code: 'SP003-BLACK-S',
    price: new Decimal(299.00),
    stock: 0, // 无库存
    attributes: { color: '黑色', size: 'S' },
    status: 1,
    product: {
      id: 'prod_003',
      name: '商务外套',
      main_image: 'https://example.com/jacket.jpg',
      category_id: 'cat_003',
      brand: '商务品牌',
      status: 0 // 商品已下架
    }
  }
];

// 添加到购物车测试数据
export const addToCartTestData: IAddToCartParams[] = [
  {
    userId: 'user_001',
    skuId: 'sku_001',
    quantity: 2
  },
  {
    userId: 'user_002',
    skuId: 'sku_002',
    quantity: 1
  },
  {
    userId: 'user_001',
    skuId: 'sku_003', // 无库存SKU
    quantity: 5
  }
];

// 更新购物车测试数据
export const updateCartTestData: IUpdateCartParams[] = [
  {
    quantity: 3,
    checked: 1
  },
  {
    quantity: 1
  },
  {
    checked: 0
  },
  {
    quantity: 0, // 无效数量
    checked: 1
  }
];

// 查询参数测试数据
export const cartQueryTestData: ICartQueryParams[] = [
  {
    userId: 'user_001',
    page: 1,
    size: 10
  },
  {
    userId: 'user_001',
    checked: 1,
    page: 1,
    size: 20
  },
  {
    userId: 'user_002',
    skuId: 'sku_003'
  }
];

// 批量操作测试数据
export const batchOperationTestData: IBatchCartParams[] = [
  {
    ids: ['cart_001', 'cart_002'],
    action: 'check'
  },
  {
    ids: ['cart_002', 'cart_003'],
    action: 'uncheck'
  },
  {
    ids: ['cart_001'],
    action: 'delete'
  }
];

// 购物车详情测试数据
export const cartDetailTestData: IShoppingCartDetail[] = [
  {
    id: 'cart_001',
    userId: 'user_001',
    skuId: 'sku_001',
    quantity: 2,
    checked: 1,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    sku: {
      id: 'sku_001',
      productId: 'prod_001',
      skuCode: 'SP001-RED-M',
      price: new Decimal(99.90),
      stock: 100,
      attributes: { color: '红色', size: 'M' },
      status: 1,
      product: {
        id: 'prod_001',
        name: '时尚T恤',
        mainImage: 'https://example.com/tshirt.jpg',
        categoryId: 'cat_001',
        brand: '潮流品牌',
        status: 1
      }
    },
    totalPrice: 199.80,
    available: true
  }
];

// 统计信息测试数据
export const statisticsTestData: ICartStatistics[] = [
  {
    totalItems: 6,
    checkedItems: 5,
    totalPrice: 857.70,
    checkedPrice: 698.70,
    availableItems: 3,
    unavailableItems: 3
  },
  {
    totalItems: 0,
    checkedItems: 0,
    totalPrice: 0,
    checkedPrice: 0,
    availableItems: 0,
    unavailableItems: 0
  }
];

// 验证结果测试数据
export const validationTestData: ICartValidation[] = [
  {
    valid: true,
    invalidItems: []
  },
  {
    valid: false,
    invalidItems: [
      {
        cartId: 'cart_003',
        skuId: 'sku_003',
        productName: '商务外套',
        reason: 'product_offline'
      },
      {
        cartId: 'cart_004',
        skuId: 'sku_004',
        productName: '限量版鞋子',
        reason: 'out_of_stock',
        currentStock: 0,
        requestQuantity: 2
      },
      {
        cartId: 'cart_005',
        skuId: 'sku_005',
        productName: '热销背包',
        reason: 'insufficient_stock',
        currentStock: 3,
        requestQuantity: 5
      }
    ]
  }
];

// 无效数据测试用例
export const invalidCartData = {
  // 无效的添加请求
  invalidAddRequests: [
    {
      userId: '',
      skuId: 'sku_001',
      quantity: 1
    },
    {
      userId: 'user_001',
      skuId: '',
      quantity: 1
    },
    {
      userId: 'user_001',
      skuId: 'sku_001',
      quantity: 0
    },
    {
      userId: 'user_001',
      skuId: 'sku_001',
      quantity: -1
    }
  ],
  
  // 无效的更新请求
  invalidUpdateRequests: [
    {
      quantity: -1,
      checked: 1
    },
    {
      quantity: 0
    }
  ],
  
  // 无效的查询参数
  invalidQueryParams: [
    {
      userId: '',
      page: 1,
      size: 10
    },
    {
      userId: 'user_001',
      page: 0,
      size: 10
    },
    {
      userId: 'user_001',
      page: 1,
      size: 0
    }
  ]
};

// Mock响应数据
export const mockResponses = {
  addToCartSuccess: {
    id: 'cart_new_001',
    userId: 'user_001',
    skuId: 'sku_001',
    quantity: 2,
    checked: 1,
    totalPrice: 199.80,
    available: true
  },
  
  updateCartSuccess: {
    id: 'cart_001',
    quantity: 3,
    checked: 1,
    totalPrice: 299.70
  },
  
  deleteCartSuccess: true,
  
  batchOperationSuccess: {
    success: 2,
    failed: 0
  },
  
  clearCartSuccess: 3,
  
  cartCountResponse: 6
};

// 测试常量
export const TEST_CONSTANTS = {
  USER_ID: 'test_user_001',
  SKU_ID: 'test_sku_001',
  CART_ID: 'test_cart_001',
  DEFAULT_QUANTITY: 1,
  MAX_QUANTITY: 999,
  MIN_QUANTITY: 1,
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 20,
  MAX_BATCH_SIZE: 100
};

// 边界值测试数据
export const boundaryTestData = {
  quantityLimits: [1, 999, 1000], // 最小值、最大值、超出最大值
  priceLimits: [0.01, 99999.99, 100000.00], // 最小价格、最大价格、超出最大价格
  pageLimits: [1, 100, 101] // 最小页码、最大页码、超出最大页码
};

// 并发测试数据
export const concurrentTestData = {
  sameUserAddSameSku: {
    userId: 'concurrent_user_001',
    skuId: 'concurrent_sku_001',
    quantity: 1,
    concurrentRequests: 5
  },
  
  multipleUsersAddSameSku: {
    skuId: 'popular_sku_001',
    users: ['user_001', 'user_002', 'user_003'],
    quantity: 10
  }
}; 