/**
 * 商品属性管理测试数据fixtures
 * 为商品属性服务测试提供模拟数据和测试用例
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

/**
 * 基础商品属性数据
 * 包含完整的属性信息和关联商品数据
 */
export const mockProductAttributes = [
  {
    id: 'attr-001',
    product_id: 'product-001',
    name: '颜色',
    value: '红色',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-001',
      name: '时尚T恤',
      status: 1
    }
  },
  {
    id: 'attr-002',
    product_id: 'product-001',
    name: '尺寸',
    value: 'L',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-001',
      name: '时尚T恤',
      status: 1
    }
  },
  {
    id: 'attr-003',
    product_id: 'product-001',
    name: '材质',
    value: '纯棉',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-001',
      name: '时尚T恤',
      status: 1
    }
  },
  {
    id: 'attr-004',
    product_id: 'product-002',
    name: '颜色',
    value: '蓝色',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-002',
      name: '休闲衬衫',
      status: 0 // 商品已下架
    }
  },
  {
    id: 'attr-005',
    product_id: 'product-003',
    name: '防水等级',
    value: 'IPX5',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    product: {
      id: 'product-003',
      name: '运动夹克',
      status: 1
    }
  }
];

/**
 * 属性查询参数测试数据
 */
export const attributeQueryParams = {
  valid: [
    {
      page: 1,
      size: 10,
      sortBy: 'created_at',
      sortOrder: 'desc'
    },
    {
      product_id: 'product-001',
      name: '颜色',
      page: 1,
      size: 20
    },
    {
      name: '尺寸',
      value: 'L',
      sortBy: 'name',
      sortOrder: 'asc'
    }
  ],
  invalid: [
    {
      page: 0, // 无效页码
      size: -1, // 无效页大小
      sortBy: 'invalid_field',
      sortOrder: 'invalid_order'
    },
    {
      product_id: '',
      name: '',
      value: '',
      page: -1,
      size: 0
    }
  ],
  boundary: [
    {
      page: 999999,
      size: 1000,
      name: 'a'.repeat(100),
      value: 'a'.repeat(500)
    },
    {
      product_id: 'non-existent-product',
      name: 'non-existent-attribute'
    }
  ],
  edge: [
    {
      page: 1,
      size: 100,
      product_id: 'product-001',
      name: 'a',
      value: 'v'
    }
  ]
};

/**
 * 属性创建请求测试数据
 */
export const attributeCreateRequests = {
  valid: [
    {
      product_id: 'product-001',
      name: '重量',
      value: '500g'
    },
    {
      product_id: 'product-002',
      name: '品牌',
      value: '优质品牌'
    },
    {
      product_id: 'product-003',
      name: '适用季节',
      value: '四季'
    }
  ],
  invalid: [
    {
      product_id: '', // 空商品ID
      name: '无效属性',
      value: '无效值'
    },
    {
      product_id: 'product-001',
      name: '', // 空属性名
      value: '有效值'
    },
    {
      product_id: 'product-001',
      name: '有效属性名',
      value: '' // 空属性值
    },
    {
      product_id: 'non-existent-product',
      name: '有效属性名',
      value: '有效值'
    },
    {
      product_id: 'product-001',
      name: '颜色', // 重复属性名
      value: '绿色'
    }
  ],
  edge: [
    {
      product_id: 'product-001',
      name: 'a'.repeat(100), // 超长属性名
      value: 'a'.repeat(1000) // 超长属性值
    }
  ],
  batch: [
    {
      product_id: 'product-001',
      attributes: [
        { name: '产地', value: '中国' },
        { name: '保质期', value: '24个月' },
        { name: '包装规格', value: '单件装' }
      ]
    }
  ]
};

/**
 * 属性更新请求测试数据
 */
export const attributeUpdateRequests = {
  valid: [
    {
      name: '更新后的颜色',
      value: '深红色'
    },
    {
      value: '更新后的值' // 只更新值
    },
    {
      name: '更新后的名称' // 只更新名称
    }
  ],
  invalid: [
    {
      name: '', // 空名称
      value: ''  // 空值
    },
    {
      name: 'a'.repeat(101), // 超长名称
      value: 'a'.repeat(1001) // 超长值
    }
  ],
  partial: [
    { name: '部分更新名称' },
    { value: '部分更新值' }
  ],
  batch: [
    {
      updates: [
        {
          id: 'attr-001',
          data: { name: '批量更新名称1', value: '批量更新值1' }
        },
        {
          id: 'attr-002', 
          data: { value: '批量更新值2' }
        }
      ]
    }
  ]
};

/**
 * 批量创建属性测试数据
 */
export const batchCreateRequests = {
  valid: [
    {
      product_id: 'product-001',
      attributes: [
        { name: '产地', value: '中国' },
        { name: '保质期', value: '24个月' },
        { name: '包装规格', value: '单件装' }
      ]
    },
    {
      product_id: 'product-002',
      attributes: [
        { name: '款式', value: '休闲' },
        { name: '领型', value: '圆领' }
      ]
    }
  ],
  invalid: [
    {
      product_id: '', // 空商品ID
      attributes: [
        { name: '无效属性', value: '无效值' }
      ]
    },
    {
      product_id: 'product-001',
      attributes: [] // 空属性列表
    },
    {
      product_id: 'product-001',
      attributes: [
        { name: '', value: '无效名称' }, // 空名称
        { name: '有效名称', value: '' } // 空值
      ]
    },
    {
      product_id: 'product-001',
      attributes: [
        { name: '颜色', value: '白色' }, // 重复现有属性
        { name: '重复名称', value: '值1' },
        { name: '重复名称', value: '值2' } // 批量内重复
      ]
    }
  ]
};

/**
 * 批量操作请求测试数据 (别名：attributeBatchOperations)
 */
export const attributeBatchOperations = {
  update: [
    {
      updates: [
        {
          id: 'attr-001',
          data: { name: '批量更新名称1', value: '批量更新值1' }
        },
        {
          id: 'attr-002', 
          data: { value: '批量更新值2' }
        }
      ]
    }
  ],
  delete: [
    {
      attributeIds: ['attr-004', 'attr-005', 'attr-006']
    }
  ]
};

/**
 * 批量操作请求测试数据
 */
export const batchOperationRequests = {
  valid: [
    {
      operation: 'delete',
      attributeIds: ['attr-004', 'attr-005']
    },
    {
      operation: 'updateValue',
      attributeIds: ['attr-001', 'attr-002'],
      data: { value: '批量更新值' }
    }
  ],
  invalid: [
    {
      operation: 'invalid_operation',
      attributeIds: ['attr-001']
    },
    {
      operation: 'delete',
      attributeIds: [] // 空ID列表
    },
    {
      operation: 'updateValue',
      attributeIds: ['attr-001'],
      data: {} // 空更新数据
    }
  ]
};

/**
 * 属性删除场景测试数据
 */
export const attributeDeleteScenarios = [
  {
    attributeId: 'attr-005',
    hasRelatedData: false,
    canDelete: true,
    description: '无关联数据，可以删除'
  },
  {
    attributeId: 'attr-001',
    hasRelatedData: true,
    canDelete: false,
    description: '有关联数据，不能删除'
  },
  {
    attributeId: 'non-existent-attr',
    hasRelatedData: false,
    canDelete: false,
    description: '属性不存在'
  }
];

/**
 * 属性统计测试数据
 */
export const attributeStatsData = {
  expected: {
    totalAttributes: 5,
    activeProductAttributes: 4, // 属于状态为1的商品的属性数量
    inactiveProductAttributes: 1, // 属于状态为0的商品的属性数量
    uniqueAttributeNames: 4, // 颜色、尺寸、材质、防水等级
    averageAttributesPerProduct: 1.67, // 5属性/3商品
    commonAttributeNames: ['颜色'] // 出现在多个商品中的属性名
  }
};

/**
 * 响应格式验证数据
 */
export const attributeResponseFormats = {
  list: {
    requiredFields: ['list', 'total', 'page', 'size', 'pages'],
    listItemFields: ['id', 'product_id', 'name', 'value', 'created_at', 'updated_at']
  },
  detail: {
    requiredFields: ['id', 'product_id', 'name', 'value', 'created_at', 'updated_at'],
    optionalFields: ['product']
  },
  batch: {
    requiredFields: ['success', 'failed', 'total'],
    failureItemFields: ['id', 'error']
  },
  batchOperation: {
    requiredFields: ['successCount', 'failureCount', 'failures'],
    failureItemFields: ['id', 'error']
  },
  stats: {
    requiredFields: ['totalAttributes', 'activeProductAttributes'],
    optionalFields: ['uniqueAttributeNames', 'averageAttributesPerProduct', 'commonAttributeNames']
  }
};

/**
 * 业务规则验证数据
 */
export const attributeBusinessRules = {
  maxNameLength: 100, // 属性名最大长度
  maxValueLength: 500, // 属性值最大长度 (修正为500以匹配测试)
  minNameLength: 1, // 属性名最小长度
  minValueLength: 1, // 属性值最小长度
  maxAttributesPerProduct: 50, // 每个商品最大属性数量
  maxBatchSize: 50, // 批量操作最大数量
  allowDuplicateNames: true // 是否允许同一商品下有重复的属性名称
};

/**
 * 常用属性名称和值
 */
export const commonAttributeData = {
  standardNames: ['颜色', '尺寸', '材质', '重量', '品牌', '产地', '型号', '规格'],
  colorValues: ['红色', '蓝色', '白色', '黑色', '绿色', '黄色', '紫色', '橙色'],
  sizeValues: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  materialValues: ['纯棉', '涤纶', '混纺', '真丝', '羊毛', '尼龙', '皮革'],
  validationPatterns: {
    weight: /^\d+(\.\d+)?(g|kg|mg)$/,
    dimensions: /^\d+(\.\d+)?[x×]\d+(\.\d+)?[x×]\d+(\.\d+)?(cm|mm|m)$/,
    model: /^[A-Z0-9\-_]+$/
  }
};

/**
 * 常用测试常量
 */
export const ATTRIBUTE_TEST_CONSTANTS = {
  VALID_ATTRIBUTE_ID: 'attr-001',
  INVALID_ATTRIBUTE_ID: 'invalid-attr-id',
  NON_EXISTENT_ID: 'non-existent-attr-id',
  VALID_PRODUCT_ID: 'product-001',
  INVALID_PRODUCT_ID: 'invalid-product-id',
  NON_EXISTENT_PRODUCT_ID: 'non-existent-product-id',
  DUPLICATE_ATTRIBUTE_NAME: '颜色',
  UNIQUE_ATTRIBUTE_NAME: '独特属性名',
  DEFAULT_PAGE_SIZE: 20,
  MAX_BATCH_SIZE: 100
};

/**
 * 属性值验证测试数据
 */
export const attributeValueValidation = {
  validValues: [
    '红色',
    'L',
    '500g',
    'IPX5',
    '纯棉100%',
    'Made in China',
    '24个月',
    '30cm×20cm×10cm'
  ],
  invalidValues: [
    '', // 空值
    '   ', // 只有空格
    '\t\n', // 只有制表符和换行
    'a'.repeat(1001) // 超长值
  ],
  specialCharacterValues: [
    '含特殊字符!@#$%',
    '包含数字123',
    '多种符号-_+=',
    '中英混合English',
    '带换行\n符号',
    '带制表符\t字符'
  ]
};

/**
 * 属性名称验证测试数据
 */
export const attributeNameValidation = {
  validNames: [
    '颜色',
    '尺寸',
    '材质',
    '重量',
    '品牌',
    '型号',
    '规格参数',
    '技术指标'
  ],
  invalidNames: [
    '', // 空名称
    '   ', // 只有空格
    '\t\n', // 只有制表符和换行
    'a'.repeat(101) // 超长名称
  ],
  borderlineNames: [
    'a', // 最短有效名称
    'a'.repeat(100), // 最长有效名称
    '数字123', // 包含数字
    'English', // 英文名称
    '中英混合Name', // 中英混合
    '带符号-属性' // 包含符号
  ]
}; 