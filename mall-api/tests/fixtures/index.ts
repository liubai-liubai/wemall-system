/**
 * 测试数据工厂
 * @author 刘白 & AI Assistant
 */

import { 
  generateTestId, 
  generateTestTimestamp, 
  generateRandomString, 
  generateRandomNumber 
} from '../helpers/test-utils';

// 导出库存管理相关测试数据
export * from './product-stock-fixtures';
export * from './shopping-cart-fixtures';

// 产品相关测试数据
export const ProductFixtures = {
  // 基础产品数据
  basicProduct: () => ({
    id: generateTestId(),
    name: '测试商品',
    slug: 'test-product',
    description: '这是一个测试商品',
    content: '<p>测试商品详细内容</p>',
    categoryId: generateTestId(),
    brand: '测试品牌',
    tags: '测试,商品,标签',
    status: 'ACTIVE' as const,
    sort: 1,
    seoTitle: '测试商品SEO标题',
    seoKeywords: '测试,商品,关键词',
    seoDescription: '测试商品SEO描述',
    createdAt: generateTestTimestamp(),
    updatedAt: generateTestTimestamp()
  }),

  // 带SKU的完整产品数据
  productWithSkus: () => {
    const product = ProductFixtures.basicProduct();
    return {
      ...product,
      skus: [
        SkuFixtures.basicSku(product.id),
        SkuFixtures.basicSku(product.id, { name: '测试SKU-变体2' })
      ]
    };
  }
};

// SKU相关测试数据
export const SkuFixtures = {
  // 基础SKU数据
  basicSku: (productId: string, overrides: any = {}) => ({
    id: generateTestId(),
    productId,
    skuCode: `SKU-${generateRandomString(8)}`,
    name: '测试SKU',
    price: 9999, // 99.99元
    originalPrice: 12999, // 129.99元
    weight: 500, // 500g
    volume: 1000, // 1000cm³
    barcode: '1234567890123',
    image: 'https://example.com/test-sku.jpg',
    status: 'ACTIVE' as const,
    sort: 1,
    createdAt: generateTestTimestamp(),
    updatedAt: generateTestTimestamp(),
    ...overrides
  }),

  // 带库存的SKU数据
  skuWithStock: (productId: string, stockQuantity: number = 100) => {
    const sku = SkuFixtures.basicSku(productId);
    return {
      ...sku,
      stocks: [StockFixtures.basicStock(sku.id, { totalStock: stockQuantity, availableStock: stockQuantity })]
    };
  }
};

// 库存相关测试数据
export const StockFixtures = {
  // 基础库存数据
  basicStock: (skuId: string, overrides: any = {}) => ({
    id: generateTestId(),
    skuId,
    warehouseId: generateTestId(),
    stockType: 'NORMAL' as const,
    totalStock: 100,
    availableStock: 90,
    lockedStock: 10,
    safetyStock: 20,
    createdAt: generateTestTimestamp(),
    updatedAt: generateTestTimestamp(),
    ...overrides
  }),

  // 零库存数据
  emptyStock: (skuId: string) => 
    StockFixtures.basicStock(skuId, {
      totalStock: 0,
      availableStock: 0,
      lockedStock: 0
    }),

  // 库存充足数据
  abundantStock: (skuId: string) => 
    StockFixtures.basicStock(skuId, {
      totalStock: 1000,
      availableStock: 1000,
      lockedStock: 0
    }),

  // 库存不足数据
  lowStock: (skuId: string) => 
    StockFixtures.basicStock(skuId, {
      totalStock: 5,
      availableStock: 2,
      lockedStock: 3,
      safetyStock: 10
    })
};

// 库存日志测试数据
export const StockLogFixtures = {
  // 基础库存日志
  basicLog: (stockId: string, overrides: any = {}) => ({
    id: generateTestId(),
    stockId,
    operationType: 'IN' as const,
    quantityChange: 100,
    beforeQuantity: 0,
    afterQuantity: 100,
    reason: '入库',
    operator: '系统',
    operatorId: generateTestId(),
    remark: '测试入库操作',
    relatedOrderId: null,
    createdAt: generateTestTimestamp(),
    ...overrides
  }),

  // 入库日志
  inboundLog: (stockId: string, quantity: number = 100) =>
    StockLogFixtures.basicLog(stockId, {
      operationType: 'IN',
      quantityChange: quantity,
      reason: '商品入库'
    }),

  // 出库日志
  outboundLog: (stockId: string, quantity: number = 10) =>
    StockLogFixtures.basicLog(stockId, {
      operationType: 'OUT',
      quantityChange: -quantity,
      reason: '订单出库'
    }),

  // 预留日志
  reserveLog: (stockId: string, quantity: number = 5) =>
    StockLogFixtures.basicLog(stockId, {
      operationType: 'RESERVE',
      quantityChange: quantity,
      reason: '订单预留'
    }),

  // 释放日志
  releaseLog: (stockId: string, quantity: number = 5) =>
    StockLogFixtures.basicLog(stockId, {
      operationType: 'RELEASE',
      quantityChange: -quantity,
      reason: '取消预留'
    })
};

// 购物车相关测试数据
export const CartFixtures = {
  // 基础购物车项
  basicCartItem: (userId: string, skuId: string, overrides: any = {}) => ({
    id: generateTestId(),
    userId,
    skuId,
    quantity: 2,
    addedAt: generateTestTimestamp(),
    updatedAt: generateTestTimestamp(),
    ...overrides
  }),

  // 用户完整购物车
  userCart: (userId: string, skuIds: string[] = []) => {
    if (skuIds.length === 0) {
      skuIds = [generateTestId(), generateTestId()];
    }
    return skuIds.map(skuId => CartFixtures.basicCartItem(userId, skuId));
  }
};

// 用户相关测试数据
export const UserFixtures = {
  // 基础用户数据
  basicUser: (overrides: any = {}) => ({
    id: generateTestId(),
    openid: `test_openid_${generateRandomString(10)}`,
    unionid: `test_unionid_${generateRandomString(10)}`,
    nickname: '测试用户',
    avatar: 'https://example.com/avatar.jpg',
    gender: 1,
    language: 'zh_CN',
    city: '深圳',
    province: '广东',
    country: '中国',
    phone: '13800138000',
    email: 'test@example.com',
    status: 'ACTIVE' as const,
    registeredAt: generateTestTimestamp(),
    lastLoginAt: generateTestTimestamp(),
    createdAt: generateTestTimestamp(),
    updatedAt: generateTestTimestamp(),
    ...overrides
  }),

  // VIP用户数据
  vipUser: () => UserFixtures.basicUser({
    nickname: 'VIP测试用户',
    member: {
      level: 'VIP',
      points: 10000
    }
  })
};

// 管理员相关测试数据
export const AdminFixtures = {
  // 基础管理员数据
  basicAdmin: (overrides: any = {}) => ({
    id: generateTestId(),
    username: `admin_${generateRandomString(6)}`,
    password: '$2a$10$test.hash.password',
    realName: '测试管理员',
    email: 'admin@example.com',
    phone: '13800138001',
    avatar: 'https://example.com/admin-avatar.jpg',
    departmentId: generateTestId(),
    status: 'ACTIVE' as const,
    lastLoginAt: generateTestTimestamp(),
    lastLoginIp: '127.0.0.1',
    createdAt: generateTestTimestamp(),
    updatedAt: generateTestTimestamp(),
    ...overrides
  }),

  // 超级管理员数据
  superAdmin: () => AdminFixtures.basicAdmin({
    username: 'superadmin',
    realName: '超级管理员',
    roles: ['SUPER_ADMIN']
  })
};

// 分页查询参数
export const PaginationFixtures = {
  firstPage: {
    page: 1,
    size: 10
  },
  
  secondPage: {
    page: 2,
    size: 10
  },
  
  largePage: {
    page: 1,
    size: 50
  }
};

// API响应格式
export const ResponseFixtures = {
  success: (data: any = null) => ({
    code: 200,
    message: '操作成功',
    data,
    timestamp: Date.now()
  }),

  error: (message: string = '操作失败', code: number = 400) => ({
    code,
    message,
    data: null,
    timestamp: Date.now()
  }),

  pageSuccess: (list: any[] = [], total: number = 0, page: number = 1, size: number = 10) => ({
    code: 200,
    message: '查询成功',
    data: {
      list,
      total,
      page,
      size,
      pages: Math.ceil(total / size)
    },
    timestamp: Date.now()
  })
};

// 错误场景数据
export const ErrorFixtures = {
  notFound: {
    code: 404,
    message: '资源不存在'
  },
  
  unauthorized: {
    code: 401,
    message: '未授权访问'
  },
  
  forbidden: {
    code: 403,
    message: '权限不足'
  },
  
  validation: {
    code: 400,
    message: '参数验证失败'
  },
  
  internal: {
    code: 500,
    message: '内部服务器错误'
  }
}; 