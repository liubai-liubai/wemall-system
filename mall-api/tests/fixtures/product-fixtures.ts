/**
 * 商品测试数据fixtures
 * @author 刘白 & AI Assistant
 */

import { ProductStatus, CategoryStatus } from '../../src/types/product';

/**
 * 模拟商品数据
 * @author 刘白 & AI Assistant
 */
export const mockProducts = [
  {
    id: 'product-001',
    name: '精品苹果',
    categoryId: 'category-001',
    brand: '优鲜农场',
    description: '新鲜优质苹果，口感甜脆',
    mainImage: 'https://example.com/apple1.jpg',
    price: 12.50,
    marketPrice: 15.00,
    status: ProductStatus.ONLINE,
    stock: 100,
    sales: 50,
    sort: 1,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: 'product-002',
    name: '进口橙子',
    categoryId: 'category-001',
    brand: '进口精选',
    description: '进口优质橙子，维C含量丰富',
    mainImage: 'https://example.com/orange1.jpg',
    price: 25.00,
    marketPrice: 30.00,
    status: ProductStatus.OFFLINE,
    stock: 50,
    sales: 20,
    sort: 2,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-10T10:00:00Z')
  },
  {
    id: 'product-003',
    name: '优质香蕉',
    categoryId: 'category-001',
    brand: '热带果园',
    description: '香甜可口的香蕉',
    mainImage: 'https://example.com/banana.jpg',
    price: 8.00,
    marketPrice: 10.00,
    status: ProductStatus.ONLINE,
    stock: 200,
    sales: 100,
    sort: 3,
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z')
  }
];

/**
 * 模拟商品分类数据
 * @author 刘白 & AI Assistant
 */
export const mockCategories = [
  {
    id: 'category-001',
    name: '新鲜水果',
    parentId: null,
    level: 1,
    sort: 1,
    status: CategoryStatus.ENABLED,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'category-002',
    name: '进口水果',
    parentId: 'category-001',
    level: 2,
    sort: 1,
    status: CategoryStatus.ENABLED,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'category-003',
    name: '有机水果',
    parentId: 'category-001',
    level: 2,
    sort: 2,
    status: CategoryStatus.DISABLED,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  }
];

/**
 * 商品查询参数测试数据
 * @author 刘白 & AI Assistant
 */
export const mockProductQueryParams = {
  valid: {
    page: 1,
    size: 10,
    keyword: '苹果',
    status: ProductStatus.ONLINE,
    categoryId: 'category-001',
    brand: '优鲜农场',
    minPrice: 10,
    maxPrice: 50,
    hasStock: true,
    sortBy: 'created_at',
    sortOrder: 'desc' as const
  },
  invalid: {
    page: 0,
    size: -1,
    keyword: '',
    status: 999 as any,
    categoryId: '',
    brand: '',
    minPrice: -1,
    maxPrice: -1,
    hasStock: 'invalid' as any,
    sortBy: 'invalid_field',
    sortOrder: 'invalid_order' as any
  },
  edge: {
    page: 999999,
    size: 1000,
    keyword: 'a'.repeat(100),
    status: ProductStatus.OFFLINE,
    categoryId: 'category-999',
    brand: 'a'.repeat(50),
    minPrice: 999999,
    maxPrice: 999999,
    hasStock: false,
    sortBy: 'updated_at',
    sortOrder: 'asc' as const
  }
};

/**
 * 商品创建请求测试数据
 * @author 刘白 & AI Assistant
 */
export const mockProductCreateRequests = {
  valid: {
    name: '新商品',
    categoryId: 'category-001',
    brand: '新品牌',
    description: '这是一个新商品',
    mainImage: 'https://example.com/new-product.jpg',
    price: 20.00,
    marketPrice: 25.00,
    status: ProductStatus.ONLINE,
    stock: 100,
    sort: 1
  },
  invalid: {
    name: '', // 空名称
    categoryId: '',
    brand: '',
    description: '',
    mainImage: '',
    price: -1, // 负价格
    marketPrice: -1,
    status: 999 as any,
    stock: -1,
    sort: -1
  },
  edge: {
    name: 'a'.repeat(200), // 超长名称
    categoryId: 'category-999',
    brand: 'a'.repeat(100),
    description: 'a'.repeat(2000),
    mainImage: 'https://example.com/' + 'a'.repeat(200) + '.jpg',
    price: 999999.99,
    marketPrice: 999999.99,
    status: ProductStatus.OFFLINE,
    stock: 999999,
    sort: 999999
  }
};

/**
 * 商品更新请求测试数据
 * @author 刘白 & AI Assistant
 */
export const mockProductUpdateRequests = {
  valid: {
    name: '更新商品名称',
    description: '更新商品描述',
    price: 30.00,
    stock: 200
  },
  partial: {
    name: '部分更新'
  },
  invalid: {
    name: '',
    description: '',
    price: -1,
    stock: -1
  }
};

/**
 * 分类创建请求测试数据
 * @author 刘白 & AI Assistant
 */
export const mockCategoryCreateRequests = {
  valid: {
    name: '新分类',
    parentId: 'category-001',
    sort: 1,
    status: CategoryStatus.ENABLED
  },
  invalid: {
    name: '',
    parentId: '',
    sort: -1,
    status: 999 as any
  }
};

/**
 * 商品响应格式测试数据
 * @author 刘白 & AI Assistant
 */
export const mockProductResponses = {
  productList: {
    code: 200,
    message: '获取商品列表成功',
    data: {
      list: mockProducts,
      total: 100,
      page: 1,
      size: 10,
      pages: 10
    },
    timestamp: Date.now()
  },
  productDetail: {
    code: 200,
    message: '获取商品详情成功',
    data: mockProducts[0],
    timestamp: Date.now()
  },
  productCreate: {
    code: 201,
    message: '创建商品成功',
    data: mockProducts[0],
    timestamp: Date.now()
  },
  productUpdate: {
    code: 200,
    message: '更新商品成功',
    data: mockProducts[0],
    timestamp: Date.now()
  },
  productDelete: {
    code: 200,
    message: '删除商品成功',
    data: null,
    timestamp: Date.now()
  }
};

/**
 * 商品统计数据测试
 * @author 刘白 & AI Assistant
 */
export const mockProductStats = {
  totalProducts: 1000,
  onlineProducts: 800,
  offlineProducts: 200,
  totalCategories: 50,
  activeCategories: 45,
  totalSkus: 2000,
  lowStockProducts: 20
}; 