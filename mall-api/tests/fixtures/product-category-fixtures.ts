/**
 * 商品分类测试数据fixtures
 * 为商品分类服务测试提供模拟数据和测试用例
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { CategoryStatus } from '../../src/types/product';

/**
 * 基础商品分类数据
 * 包含完整的分类层级结构
 */
export const mockCategories = [
  {
    id: 'cat-001',
    name: '新鲜水果',
    parent_id: null,
    level: 1,
    sort: 1,
    status: CategoryStatus.ENABLED,
    image: 'https://example.com/fruit.jpg',
    description: '各种新鲜水果',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    parent: null,
    children: [
      {
        id: 'cat-002',
        name: '进口水果',
        level: 2,
        status: CategoryStatus.ENABLED
      },
      {
        id: 'cat-003',
        name: '国产水果',
        level: 2,
        status: CategoryStatus.ENABLED
      }
    ],
    _count: {
      products: 15
    }
  },
  {
    id: 'cat-002',
    name: '进口水果',
    parent_id: 'cat-001',
    level: 2,
    sort: 1,
    status: CategoryStatus.ENABLED,
    image: 'https://example.com/import-fruit.jpg',
    description: '精选进口水果',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    parent: {
      id: 'cat-001',
      name: '新鲜水果',
      level: 1
    },
    children: [
      {
        id: 'cat-004',
        name: '进口苹果',
        level: 3,
        status: CategoryStatus.ENABLED
      }
    ],
    _count: {
      products: 8
    }
  },
  {
    id: 'cat-003',
    name: '国产水果',
    parent_id: 'cat-001',
    level: 2,
    sort: 2,
    status: CategoryStatus.DISABLED,
    image: 'https://example.com/domestic-fruit.jpg',
    description: '优质国产水果',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    parent: {
      id: 'cat-001',
      name: '新鲜水果',
      level: 1
    },
    children: [],
    _count: {
      products: 0
    }
  },
  {
    id: 'cat-004',
    name: '进口苹果',
    parent_id: 'cat-002',
    level: 3,
    sort: 1,
    status: CategoryStatus.ENABLED,
    image: 'https://example.com/import-apple.jpg',
    description: '精选进口苹果',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    parent: {
      id: 'cat-002',
      name: '进口水果',
      level: 2
    },
    children: [],
    _count: {
      products: 5
    }
  }
];

/**
 * 分类查询参数测试数据
 */
export const categoryQueryParams = {
  valid: [
    {
      page: 1,
      size: 10,
      sortBy: 'sort',
      sortOrder: 'asc' as const
    },
    {
      parentId: 'cat-001',
      level: 2,
      status: CategoryStatus.ENABLED,
      keyword: '水果',
      page: 1,
      size: 20
    },
    {
      status: CategoryStatus.DISABLED,
      sortBy: 'created_at',
      sortOrder: 'desc' as const
    }
  ],
  invalid: [
    {
      page: 0, // 无效页码
      size: -1, // 无效页大小
      sortBy: 'invalid_field',
      sortOrder: 'invalid_order' as any
    },
    {
      parentId: '',
      level: -1,
      status: 999 as any,
      keyword: '',
      page: -1,
      size: 0
    }
  ],
  boundary: [
    {
      page: 999999,
      size: 1000,
      keyword: 'a'.repeat(100)
    },
    {
      parentId: 'non-existent-id',
      level: 999,
      status: CategoryStatus.ENABLED
    }
  ]
};

/**
 * 分类创建请求测试数据
 */
export const categoryCreateRequests = {
  valid: [
    {
      name: '新分类',
      parent_id: null,
      sort: 1,
      status: CategoryStatus.ENABLED,
      image: 'https://example.com/new-category.jpg',
      description: '这是一个新的分类'
    },
    {
      name: '子分类',
      parent_id: 'cat-001',
      sort: 10,
      status: CategoryStatus.ENABLED,
      description: '这是一个子分类'
    },
    {
      name: '三级分类',
      parent_id: 'cat-002',
      sort: 5,
      status: CategoryStatus.DISABLED
    }
  ],
  invalid: [
    {
      name: '', // 空名称
      parent_id: null,
      sort: 1,
      status: CategoryStatus.ENABLED
    },
    {
      name: 'a'.repeat(101), // 超长名称
      parent_id: null,
      sort: 1,
      status: CategoryStatus.ENABLED
    },
    {
      name: '有效分类名',
      parent_id: 'non-existent-parent',
      sort: 1,
      status: CategoryStatus.ENABLED
    },
    {
      name: '有效分类名',
      parent_id: null,
      sort: -1, // 无效排序
      status: 999 as any // 无效状态
    }
  ],
  edge: [
    {
      name: '边界测试分类',
      parent_id: null,
      sort: 999999,
      status: CategoryStatus.ENABLED,
      image: 'https://example.com/' + 'a'.repeat(200) + '.jpg',
      description: 'a'.repeat(1000)
    }
  ]
};

/**
 * 分类更新请求测试数据
 */
export const categoryUpdateRequests = {
  valid: [
    {
      name: '更新后的分类名称',
      description: '更新后的描述',
      sort: 5
    },
    {
      status: CategoryStatus.DISABLED
    },
    {
      name: '部分更新测试',
      image: 'https://example.com/updated.jpg'
    }
  ],
  invalid: [
    {
      name: '', // 空名称
      sort: -1
    },
    {
      parent_id: 'self-reference', // 自引用（需要在测试中特殊处理）
      status: 999 as any
    }
  ],
  partial: [
    { name: '只更新名称' },
    { sort: 99 },
    { status: CategoryStatus.ENABLED },
    { description: '只更新描述' }
  ]
};

/**
 * 分类树形结构数据
 */
export const categoryTreeData = [
  {
    id: 'cat-001',
    name: '新鲜水果',
    parent_id: null,
    level: 1,
    sort: 1,
    status: CategoryStatus.ENABLED,
    children: [
      {
        id: 'cat-002',
        name: '进口水果',
        parent_id: 'cat-001',
        level: 2,
        sort: 1,
        status: CategoryStatus.ENABLED,
        children: [
          {
            id: 'cat-004',
            name: '进口苹果',
            parent_id: 'cat-002',
            level: 3,
            sort: 1,
            status: CategoryStatus.ENABLED,
            children: []
          }
        ]
      },
      {
        id: 'cat-003',
        name: '国产水果',
        parent_id: 'cat-001',
        level: 2,
        sort: 2,
        status: CategoryStatus.DISABLED,
        children: []
      }
    ]
  }
];

/**
 * 分类排序更新数据
 */
export const categorySortUpdates = {
  valid: [
    { id: 'cat-001', sort: 1 },
    { id: 'cat-002', sort: 2 },
    { id: 'cat-003', sort: 3 }
  ],
  invalid: [
    { id: '', sort: 1 }, // 空ID
    { id: 'cat-001', sort: -1 }, // 负数排序
    { id: 'non-existent', sort: 1 } // 不存在的分类
  ]
};

/**
 * 分类删除测试场景
 */
export const categoryDeleteScenarios = [
  {
    categoryId: 'cat-004',
    hasChildren: false,
    hasProducts: false,
    canDelete: true,
    description: '无子分类无商品，可以删除'
  },
  {
    categoryId: 'cat-002',
    hasChildren: true,
    hasProducts: false,
    canDelete: false,
    description: '有子分类，不能删除'
  },
  {
    categoryId: 'cat-001',
    hasChildren: true,
    hasProducts: true,
    canDelete: false,
    description: '有子分类和关联商品，不能删除'
  },
  {
    categoryId: 'non-existent',
    hasChildren: false,
    hasProducts: false,
    canDelete: false,
    description: '分类不存在'
  }
];

/**
 * 响应格式验证数据
 */
export const categoryResponseFormats = {
  list: {
    requiredFields: ['list', 'total', 'page', 'size', 'pages'],
    listItemFields: ['id', 'name', 'parent_id', 'level', 'sort', 'status', 'created_at', 'updated_at']
  },
  detail: {
    requiredFields: ['id', 'name', 'parent_id', 'level', 'sort', 'status', 'created_at', 'updated_at'],
    optionalFields: ['parent', 'children', 'products', '_count']
  },
  tree: {
    requiredFields: ['id', 'name', 'level', 'status'],
    optionalFields: ['children']
  }
};

/**
 * 业务规则验证数据
 */
export const categoryBusinessRules = {
  maxLevel: 3, // 最大分类层级
  maxNameLength: 100, // 分类名称最大长度
  maxDescLength: 1000, // 描述最大长度
  defaultStatus: CategoryStatus.ENABLED, // 默认状态
  defaultSort: 0 // 默认排序
};

/**
 * 常用测试常量
 */
export const CATEGORY_TEST_CONSTANTS = {
  VALID_CATEGORY_ID: 'cat-001',
  INVALID_CATEGORY_ID: 'invalid-cat-id',
  NON_EXISTENT_ID: 'non-existent-cat-id',
  ROOT_CATEGORY_ID: 'cat-001',
  LEAF_CATEGORY_ID: 'cat-004',
  DISABLED_CATEGORY_ID: 'cat-003',
  MAX_CATEGORY_LEVEL: 3,
  DEFAULT_PAGE_SIZE: 20
}; 