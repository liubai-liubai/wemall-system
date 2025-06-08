/**
 * 商品图片管理测试数据fixtures
 * 为商品图片服务测试提供模拟数据和测试用例
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

/**
 * 基础商品图片数据
 * 包含完整的图片信息和关联商品数据
 */
export const mockProductImages = [
  {
    id: 'img-001',
    product_id: 'product-001',
    url: 'https://cdn.example.com/products/product-001/main-1.jpg',
    type: 'main' as const,
    sort: 0,
    created_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-001',
      name: '时尚T恤',
      main_image: 'https://cdn.example.com/products/product-001/main-1.jpg'
    }
  },
  {
    id: 'img-002',
    product_id: 'product-001',
    url: 'https://cdn.example.com/products/product-001/detail-1.jpg',
    type: 'detail' as const,
    sort: 1,
    created_at: new Date('2024-01-01T01:00:00Z'),
    product: {
      id: 'product-001',
      name: '时尚T恤',
      main_image: 'https://cdn.example.com/products/product-001/main-1.jpg'
    }
  },
  {
    id: 'img-003',
    product_id: 'product-001',
    url: 'https://cdn.example.com/products/product-001/detail-2.jpg',
    type: 'detail' as const,
    sort: 2,
    created_at: new Date('2024-01-01T02:00:00Z'),
    product: {
      id: 'product-001',
      name: '时尚T恤',
      main_image: 'https://cdn.example.com/products/product-001/main-1.jpg'
    }
  },
  {
    id: 'img-004',
    product_id: 'product-001',
    url: 'https://cdn.example.com/products/product-001/sku-red-l.jpg',
    type: 'sku' as const,
    sort: 3,
    created_at: new Date('2024-01-01T03:00:00Z'),
    product: {
      id: 'product-001',
      name: '时尚T恤',
      main_image: 'https://cdn.example.com/products/product-001/main-1.jpg'
    }
  },
  {
    id: 'img-005',
    product_id: 'product-002',
    url: 'https://cdn.example.com/products/product-002/main-1.jpg',
    type: 'main' as const,
    sort: 0,
    created_at: new Date('2024-01-02T00:00:00Z'),
    product: {
      id: 'product-002',
      name: '休闲衬衫',
      main_image: 'https://cdn.example.com/products/product-002/main-1.jpg'
    }
  },
  {
    id: 'img-006',
    product_id: 'product-003',
    url: 'https://cdn.example.com/products/product-003/main-1.jpg',
    type: 'main' as const,
    sort: 0,
    created_at: new Date('2024-01-03T00:00:00Z'),
    product: {
      id: 'product-003',
      name: '运动夹克',
      main_image: 'https://cdn.example.com/products/product-003/main-1.jpg'
    }
  }
];

/**
 * 图片查询参数测试数据
 */
export const imageQueryParams = {
  valid: [
    {
      page: 1,
      size: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    },
    {
      product_id: 'product-001',
      type: 'main',
      page: 1,
      size: 20
    },
    {
      type: 'detail',
      sort_by: 'sort',
      sort_order: 'asc',
      page: 1,
      size: 50
    },
    {
      product_id: 'product-001',
      keyword: 'detail',
      page: 2,
      size: 5
    }
  ],
  invalid: [
    {
      page: 0, // 无效页码
      size: -1, // 无效页大小
      sort_by: 'invalid_field',
      sort_order: 'invalid_order'
    },
    {
      product_id: '',
      type: 'invalid_type',
      page: -1,
      size: 0
    },
    {
      page: 'invalid', // 非数字页码
      size: 'invalid', // 非数字页大小
      type: 'unknown'
    }
  ],
  boundary: [
    {
      page: 999999,
      size: 100,
      keyword: 'a'.repeat(200),
      product_id: 'product-' + 'a'.repeat(100)
    },
    {
      product_id: 'non-existent-product',
      type: 'main'
    }
  ],
  edge: [
    {
      page: 1,
      size: 1,
      product_id: 'product-001',
      type: 'sku'
    }
  ]
};

/**
 * 图片创建请求测试数据
 */
export const imageCreateRequests = {
  valid: [
    {
      product_id: 'product-001',
      url: 'https://cdn.example.com/products/product-001/new-main.jpg',
      type: 'main' as const,
      sort: 0
    },
    {
      product_id: 'product-002',
      url: 'https://cdn.example.com/products/product-002/detail-1.jpg',
      type: 'detail' as const,
      sort: 1
    },
    {
      product_id: 'product-003',
      url: 'https://cdn.example.com/products/product-003/sku-variant.jpg',
      type: 'sku' as const
      // sort未指定，应该自动计算
    },
    {
      product_id: 'product-001',
      url: 'https://s3.amazonaws.com/bucket/product-images/high-res.png'
      // type未指定，应该默认为'main'
    }
  ],
  invalid: [
    {
      product_id: '', // 空商品ID
      url: 'https://cdn.example.com/invalid.jpg',
      type: 'main' as const
    },
    {
      product_id: 'product-001',
      url: '', // 空URL
      type: 'detail' as const
    },
    {
      product_id: 'product-001',
      url: 'invalid-url-format', // 无效URL格式
      type: 'main' as const
    },
    {
      product_id: 'non-existent-product', // 不存在的商品
      url: 'https://cdn.example.com/valid.jpg',
      type: 'main' as const
    },
    {
      product_id: 'product-001',
      url: 'https://cdn.example.com/valid.jpg',
      type: 'invalid_type' as any, // 无效图片类型
      sort: -1 // 无效排序值
    },
    {
      product_id: 'product-001',
      url: 'ftp://invalid.protocol.com/image.jpg', // 不支持的协议
      type: 'main' as const
    }
  ],
  edge: [
    {
      product_id: 'product-001',
      url: 'https://cdn.example.com/' + 'a'.repeat(500) + '.jpg', // 超长URL
      type: 'detail' as const,
      sort: 999999 // 极大排序值
    },
    {
      product_id: 'product-001',
      url: 'https://cdn.example.com/image.JPG', // 大写扩展名
      type: 'main' as const,
      sort: 0
    }
  ]
};

/**
 * 图片更新请求测试数据
 */
export const imageUpdateRequests = {
  valid: [
    {
      url: 'https://cdn.example.com/updated/main-new.jpg',
      type: 'main' as const,
      sort: 0
    },
    {
      url: 'https://cdn.example.com/updated/detail-new.jpg'
      // 部分更新，只更新URL
    },
    {
      type: 'sku' as const,
      sort: 5
      // 部分更新，只更新类型和排序
    }
  ],
  invalid: [
    {
      url: '', // 空URL
      type: 'main' as const
    },
    {
      url: 'invalid-url',
      type: 'detail' as const
    },
    {
      type: 'invalid_type' as any,
      sort: -1
    },
    {
      url: 'https://cdn.example.com/valid.jpg',
      type: 'main' as const,
      sort: 'invalid' as any // 非数字排序
    }
  ],
  partial: [
    { url: 'https://cdn.example.com/partial-update.jpg' },
    { type: 'detail' as const },
    { sort: 10 },
    { type: 'sku' as const, sort: 0 }
  ]
};

/**
 * 批量操作请求测试数据
 */
export const imageBatchOperations = {
  batchCreate: {
    valid: [
      {
        product_id: 'product-001',
        images: [
          {
            url: 'https://cdn.example.com/batch/image-1.jpg',
            type: 'detail' as const,
            sort: 10
          },
          {
            url: 'https://cdn.example.com/batch/image-2.jpg',
            type: 'detail' as const,
            sort: 11
          },
          {
            url: 'https://cdn.example.com/batch/image-3.jpg',
            type: 'sku' as const,
            sort: 12
          }
        ]
      }
    ],
    invalid: [
      {
        product_id: '', // 空商品ID
        images: [
          {
            url: 'https://cdn.example.com/invalid.jpg',
            type: 'main' as const
          }
        ]
      },
      {
        product_id: 'product-001',
        images: [] // 空图片列表
      },
      {
        product_id: 'non-existent-product',
        images: [
          {
            url: 'https://cdn.example.com/valid.jpg',
            type: 'main' as const
          }
        ]
      }
    ]
  },
  batchUpdateSort: {
    valid: [
      {
        product_id: 'product-001',
        sorts: [
          { id: 'img-001', sort: 5 },
          { id: 'img-002', sort: 3 },
          { id: 'img-003', sort: 1 }
        ]
      }
    ],
    invalid: [
      {
        product_id: '',
        sorts: [
          { id: 'img-001', sort: 1 }
        ]
      },
      {
        product_id: 'product-001',
        sorts: [] // 空排序列表
      },
      {
        product_id: 'product-001',
        sorts: [
          { id: '', sort: 1 }, // 空图片ID
          { id: 'img-002', sort: -1 } // 无效排序值
        ]
      }
    ]
  },
  batchDelete: {
    valid: [
      ['img-002', 'img-003', 'img-004'],
      ['img-005'],
      ['img-006']
    ],
    invalid: [
      [], // 空ID列表
      [''], // 空ID
      ['img-001', 'img-001'], // 重复ID
      Array.from({length: 51}, (_, i) => `img-${i}`) // 超过限制的批量大小
    ]
  }
};

/**
 * 图片删除场景测试数据
 */
export const imageDeleteScenarios = [
  {
    imageId: 'img-002',
    exists: true,
    isMainImage: false,
    hasReferences: false,
    canDelete: true,
    description: '可以删除的普通详情图片'
  },
  {
    imageId: 'img-001',
    exists: true,
    isMainImage: true,
    hasReferences: true,
    canDelete: false,
    description: '主图且被引用，不能删除'
  },
  {
    imageId: 'img-003',
    exists: true,
    isMainImage: false,
    hasReferences: false,
    canDelete: true,
    description: '可以删除的详情图片'
  },
  {
    imageId: 'non-existent-img',
    exists: false,
    isMainImage: false,
    hasReferences: false,
    canDelete: false,
    description: '图片不存在，不能删除'
  }
];

/**
 * 图片统计数据
 */
export const imageStatsData = {
  expected: {
    total: 6,
    by_type: {
      main: 3,
      detail: 2,
      sku: 1
    },
    recent_uploads: 2, // 最近7天上传的数量
    avg_images_per_product: 2.0 // 平均每个商品的图片数量
  },
  calculation: {
    totalProducts: 3,
    totalImages: 6,
    mainImages: mockProductImages.filter(img => img.type === 'main').length,
    detailImages: mockProductImages.filter(img => img.type === 'detail').length,
    skuImages: mockProductImages.filter(img => img.type === 'sku').length
  }
};

/**
 * 响应格式验证数据
 */
export const imageResponseFormats = {
  list: {
    requiredFields: ['list', 'total', 'page', 'size', 'pages'],
    listItemFields: ['id', 'product_id', 'url', 'type', 'sort', 'created_at'],
    optionalFields: ['product']
  },
  detail: {
    requiredFields: ['id', 'product_id', 'url', 'type', 'sort', 'created_at'],
    optionalFields: ['product'],
    productFields: ['id', 'name', 'main_image']
  },
  stats: {
    requiredFields: ['total', 'by_type', 'recent_uploads', 'avg_images_per_product'],
    typeFields: ['main', 'detail', 'sku']
  }
};

/**
 * 业务规则配置
 */
export const imageBusinessRules = {
  maxUrlLength: 500, // URL最大长度
  minUrlLength: 10, // URL最小长度
  maxSortValue: 999999, // 最大排序值
  minSortValue: 0, // 最小排序值
  maxImagesPerProduct: 20, // 每个商品最大图片数量
  maxBatchSize: 50, // 批量操作最大数量
  supportedProtocols: ['http', 'https'], // 支持的URL协议
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'], // 支持的文件扩展名
  imageTypes: ['main', 'detail', 'sku'] as const, // 支持的图片类型
  defaultType: 'main' as const, // 默认图片类型
  autoSortIncrement: 1 // 自动排序增量
};

/**
 * 常用测试常量
 */
export const IMAGE_TEST_CONSTANTS = {
  VALID_PRODUCT_ID: 'product-001',
  NON_EXISTENT_PRODUCT_ID: 'non-existent-product',
  VALID_IMAGE_ID: 'img-001',
  NON_EXISTENT_IMAGE_ID: 'non-existent-img',
  INVALID_IMAGE_ID: 'invalid-img-format',
  VALID_IMAGE_URL: 'https://cdn.example.com/valid-image.jpg',
  INVALID_IMAGE_URL: 'invalid-url-format',
  MAIN_IMAGE_ID: 'img-001',
  DETAIL_IMAGE_ID: 'img-002',
  SKU_IMAGE_ID: 'img-004',
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 10,
  LARGE_SORT_VALUE: 999999,
  NEGATIVE_SORT_VALUE: -1
};

/**
 * URL验证测试数据
 */
export const imageUrlValidation = {
  validUrls: [
    'https://cdn.example.com/image.jpg',
    'http://localhost:3000/uploads/test.png',
    'https://s3.amazonaws.com/bucket/folder/image.jpeg',
    'https://cdn.example.com/path/to/image.gif',
    'https://example.com/very/long/path/to/image.webp'
  ],
  invalidUrls: [
    '', // 空URL
    'invalid-url', // 无协议
    'ftp://example.com/image.jpg', // 不支持的协议
    'https://', // 不完整URL
    'https://example.com/', // 无文件名
    'javascript:alert("xss")', // XSS攻击
    'a'.repeat(5), // 太短的URL
    'https://example.com/image.txt' // 不支持的文件类型
  ],
  edgeUrls: [
    'https://cdn.example.com/' + 'a'.repeat(400) + '.jpg', // 接近最大长度
    'https://cdn.example.com/IMAGE.JPG', // 大写扩展名
    'https://cdn.example.com/image.jpg?v=123&t=456', // 带查询参数
    'https://cdn.example.com/image.jpg#fragment' // 带片段标识符
  ]
};

/**
 * 图片类型验证数据
 */
export const imageTypeValidation = {
  validTypes: ['main', 'detail', 'sku'] as const,
  invalidTypes: ['', 'invalid', 'banner', 'thumbnail', null, undefined, 123],
  typeUsageCases: {
    main: {
      description: '商品主图，用于列表展示',
      maxCount: 1,
      required: true
    },
    detail: {
      description: '商品详情图，用于详情页展示',
      maxCount: 10,
      required: false
    },
    sku: {
      description: 'SKU图片，用于规格选择',
      maxCount: 20,
      required: false
    }
  }
};

/**
 * 排序逻辑验证数据
 */
export const imageSortValidation = {
  validSorts: [0, 1, 10, 100, 999, 999999],
  invalidSorts: [-1, -100, 'invalid', null, undefined, NaN, Infinity],
  sortScenarios: [
    {
      description: '新图片无指定排序，应自动设置为最大值+1',
      existingSorts: [0, 1, 2, 5],
      expectedNewSort: 6
    },
    {
      description: '空商品无现有图片，新图片排序应为0',
      existingSorts: [],
      expectedNewSort: 0
    },
    {
      description: '指定排序值应直接使用',
      existingSorts: [0, 1, 2],
      specifiedSort: 10,
      expectedNewSort: 10
    }
  ]
}; 