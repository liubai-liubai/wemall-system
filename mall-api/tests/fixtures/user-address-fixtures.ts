/**
 * 用户地址服务测试数据
 * 包含地址CRUD操作、默认地址管理、地址验证等测试数据
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import {
  IUserAddress,
  CreateUserAddressRequest,
  UpdateUserAddressRequest,
  UserAddressQueryParams,
  AddressStatistics,
  AddressValidationResult
} from '../../src/types/user';

// 模拟用户地址数据 - 完整的数据结构
export const mockUserAddresses: Array<any> = [
  {
    id: 'addr-1-uuid-string-001',
    user_member_id: 'member-1-uuid-001',
    consignee: '张三',
    phone: '13800138001',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    address: '三里屯街道工体北路8号院',
    is_default: 1,
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:00:00Z'),
    user_member: {
      id: 'member-1-uuid-001',
      user_id: 'user-1-uuid-001',
      user: {
        id: 'user-1-uuid-001',
        nickname: '张三',
        phone: '13800138001',
        avatar: 'https://example.com/avatar1.jpg'
      }
    }
  },
  {
    id: 'addr-2-uuid-string-002',
    user_member_id: 'member-1-uuid-001',
    consignee: '张三',
    phone: '13800138001',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    address: '陆家嘴金融贸易区世纪大道100号',
    is_default: 0,
    created_at: new Date('2024-01-20T14:30:00Z'),
    updated_at: new Date('2024-01-20T14:30:00Z'),
    user_member: {
      id: 'member-1-uuid-001',
      user_id: 'user-1-uuid-001',
      user: {
        id: 'user-1-uuid-001',
        nickname: '张三',
        phone: '13800138001',
        avatar: 'https://example.com/avatar1.jpg'
      }
    }
  },
  {
    id: 'addr-3-uuid-string-003',
    user_member_id: 'member-2-uuid-002',
    consignee: '李四',
    phone: '13900139002',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '科技园南区高新南四道18号',
    is_default: 1,
    created_at: new Date('2024-01-25T09:15:00Z'),
    updated_at: new Date('2024-01-25T09:15:00Z'),
    user_member: {
      id: 'member-2-uuid-002',
      user_id: 'user-2-uuid-002',
      user: {
        id: 'user-2-uuid-002',
        nickname: '李四',
        phone: '13900139002',
        avatar: 'https://example.com/avatar2.jpg'
      }
    }
  },
  {
    id: 'addr-4-uuid-string-004',
    user_member_id: 'member-2-uuid-002',
    consignee: '李四',
    phone: '13900139002',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    address: '珠江新城花城大道85号',
    is_default: 0,
    created_at: new Date('2024-02-01T16:45:00Z'),
    updated_at: new Date('2024-02-01T16:45:00Z'),
    user_member: {
      id: 'member-2-uuid-002',
      user_id: 'user-2-uuid-002',
      user: {
        id: 'user-2-uuid-002',
        nickname: '李四',
        phone: '13900139002',
        avatar: 'https://example.com/avatar2.jpg'
      }
    }
  },
  {
    id: 'addr-5-uuid-string-005',
    user_member_id: 'member-3-uuid-003',
    consignee: '王五',
    phone: '13700137003',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    address: '文三路508号天苑大厦',
    is_default: 1,
    created_at: new Date('2024-02-05T11:20:00Z'),
    updated_at: new Date('2024-02-05T11:20:00Z'),
    user_member: {
      id: 'member-3-uuid-003',
      user_id: 'user-3-uuid-003',
      user: {
        id: 'user-3-uuid-003',
        nickname: '王五',
        phone: '13700137003',
        avatar: 'https://example.com/avatar3.jpg'
      }
    }
  },
  {
    id: 'addr-6-uuid-string-006',
    user_member_id: 'member-3-uuid-003',
    consignee: '王五办公',
    phone: '13700137003',
    province: '浙江省',
    city: '杭州市',
    district: '余杭区',
    address: '五常街道文一西路969号',
    is_default: 0,
    created_at: new Date('2024-02-10T13:55:00Z'),
    updated_at: new Date('2024-02-10T13:55:00Z'),
    user_member: {
      id: 'member-3-uuid-003',
      user_id: 'user-3-uuid-003',
      user: {
        id: 'user-3-uuid-003',
        nickname: '王五',
        phone: '13700137003',
        avatar: 'https://example.com/avatar3.jpg'
      }
    }
  }
];

// 地址查询参数测试数据
export const addressQueryParams: Record<string, UserAddressQueryParams> = {
  // 基础分页查询
  basicPagination: {
    page: 1,
    size: 10,
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  
  // 用户筛选查询
  userFilter: {
    userId: 'user-1-uuid-001',
    page: 1,
    size: 20
  },
  
  // 地区筛选查询
  regionFilter: {
    province: '广东省',
    city: '深圳市',
    page: 1,
    size: 10
  },
  
  // 默认地址筛选
  defaultFilter: {
    isDefault: true,
    page: 1,
    size: 10
  },
  
  // 复杂条件查询
  complexFilter: {
    userId: 'user-2-uuid-002',
    province: '广东省',
    isDefault: false,
    page: 1,
    size: 5,
    sortBy: 'updated_at',
    sortOrder: 'asc'
  },
  
  // 边界值测试
  boundaryValues: {
    page: 1,
    size: 1,
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  
  // 无效参数测试
  invalidParams: {
    page: 0, // 无效页码
    size: -1, // 无效页大小
    sortBy: 'invalid_field' as any,
    sortOrder: 'invalid_order' as any
  }
};

// 创建地址请求数据
export const createAddressRequests: Record<string, CreateUserAddressRequest> = {
  // 有效的创建请求 - 默认地址
  validDefault: {
    receiverName: '赵六',
    receiverPhone: '13600136006',
    province: '江苏省',
    city: '南京市',
    district: '鼓楼区',
    detailAddress: '中山路18号德基广场二期',
    isDefault: true
  },
  
  // 有效的创建请求 - 普通地址
  validNormal: {
    receiverName: '钱七',
    receiverPhone: '13500135007',
    province: '四川省',
    city: '成都市',
    district: '高新区',
    detailAddress: '天府二街138号蜀都中心',
    isDefault: false
  },
  
  // 包含邮政编码的地址
  withPostalCode: {
    receiverName: '孙八',
    receiverPhone: '13400134008',
    province: '湖北省',
    city: '武汉市',
    district: '武昌区',
    detailAddress: '中南路99号保利广场',
    postalCode: '430071',
    isDefault: false
  },
  
  // 包含标签的地址
  withLabel: {
    receiverName: '周九',
    receiverPhone: '13300133009',
    province: '河南省',
    city: '郑州市',
    district: '金水区',
    detailAddress: '花园路1号紫荆山',
    label: '公司',
    isDefault: false
  },
  
  // 长地址测试
  longAddress: {
    receiverName: '吴十',
    receiverPhone: '13200132010',
    province: '山东省',
    city: '青岛市',
    district: '市南区',
    detailAddress: '香港中路61号远洋大厦A座15楼1508室（靠近五四广场，地铁3号线五四广场站D出口）',
    isDefault: false
  },
  
  // 最小长度测试
  minLength: {
    receiverName: '李明',
    receiverPhone: '13800138000',
    province: '京',
    city: '京',
    district: '东',
    detailAddress: '测试地址123号',
    isDefault: false
  }
};

// 更新地址请求数据
export const updateAddressRequests: Record<string, UpdateUserAddressRequest> = {
  // 更新收件人信息
  updateReceiver: {
    receiverName: '张三丰',
    receiverPhone: '13800138888'
  },
  
  // 更新地址信息
  updateAddress: {
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    detailAddress: '中关村大街27号中关村大厦'
  },
  
  // 设置为默认地址
  setDefault: {
    isDefault: true
  },
  
  // 取消默认地址
  unsetDefault: {
    isDefault: false
  },
  
  // 完整更新
  fullUpdate: {
    receiverName: '新收件人',
    receiverPhone: '13999999999',
    province: '上海市',
    city: '上海市',
    district: '黄浦区',
    detailAddress: '南京东路100号',
    isDefault: true
  },
  
  // 部分更新
  partialUpdate: {
    receiverName: '部分更新姓名'
  }
};

// 无效请求数据 - 用于验证测试
export const invalidRequests: Record<string, any> = {
  // 收件人姓名无效
  invalidReceiverName: {
    receiverName: 'A', // 太短
    receiverPhone: '13800138001',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detailAddress: '测试地址',
    isDefault: false
  },
  
  // 手机号无效
  invalidPhone: {
    receiverName: '测试用户',
    receiverPhone: '1234567890', // 格式错误
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detailAddress: '测试地址',
    isDefault: false
  },
  
  // 详细地址太短
  shortDetailAddress: {
    receiverName: '测试用户',
    receiverPhone: '13800138001',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detailAddress: '123', // 太短
    isDefault: false
  },
  
  // 详细地址太长
  longDetailAddress: {
    receiverName: '测试用户',
    receiverPhone: '13800138001',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detailAddress: 'A'.repeat(101), // 超过100字符
    isDefault: false
  },
  
  // 邮政编码无效
  invalidPostalCode: {
    receiverName: '测试用户',
    receiverPhone: '13800138001',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detailAddress: '测试地址123号',
    postalCode: '12345', // 格式错误
    isDefault: false
  },
  
  // 标签太长
  longLabel: {
    receiverName: '测试用户',
    receiverPhone: '13800138001',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detailAddress: '测试地址123号',
    label: '这是一个超过十个字符的标签测试',
    isDefault: false
  },
  
  // 缺少必填字段
  missingRequired: {
    receiverName: '测试用户',
    // 缺少 receiverPhone
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detailAddress: '测试地址123号',
    isDefault: false
  },
  
  // 空字符串字段
  emptyFields: {
    receiverName: '',
    receiverPhone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: false
  }
};

// 地址统计数据
export const mockAddressStatistics: AddressStatistics = {
  totalAddresses: 6,
  defaultAddresses: 3,
  provinceStats: [
    { province: '广东省', count: 2 },
    { province: '浙江省', count: 2 },
    { province: '北京市', count: 1 },
    { province: '上海市', count: 1 }
  ],
  labelStats: []
};

// 地址验证结果测试数据
export const addressValidationResults: Record<string, AddressValidationResult> = {
  // 验证成功
  validResult: {
    isValid: true,
    errors: [],
    normalizedAddress: {
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detailAddress: '三里屯街道工体北路8号院'
    }
  },
  
  // 验证失败 - 多个错误
  invalidResult: {
    isValid: false,
    errors: [
      '收件人姓名长度应在2-20个字符之间',
      '手机号格式不正确',
      '详细地址长度应在5-100个字符之间'
    ],
    normalizedAddress: undefined
  },
  
  // 验证失败 - 单个错误
  singleErrorResult: {
    isValid: false,
    errors: ['手机号格式不正确'],
    normalizedAddress: undefined
  }
};

// 测试用的用户和会员数据
export const testUsers = {
  user1: {
    id: 'user-1-uuid-001',
    openId: 'wx-openid-001',
    nickname: '张三',
    avatar: 'https://example.com/avatar1.jpg',
    phone: '13800138001',
    gender: 1,
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  user2: {
    id: 'user-2-uuid-002',
    openId: 'wx-openid-002',
    nickname: '李四',
    avatar: 'https://example.com/avatar2.jpg',
    phone: '13900139002',
    gender: 2,
    status: 1,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  user3: {
    id: 'user-3-uuid-003',
    openId: 'wx-openid-003',
    nickname: '王五',
    avatar: 'https://example.com/avatar3.jpg',
    phone: '13700137003',
    gender: 1,
    status: 1,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
};

// 测试用的会员数据
export const testUserMembers = {
  member1: {
    id: 'member-1-uuid-001',
    user_id: 'user-1-uuid-001',
    member_level_id: 'level-1-uuid-001',
    points: 1000,
    growth_value: 2000,
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  member2: {
    id: 'member-2-uuid-002',
    user_id: 'user-2-uuid-002',
    member_level_id: 'level-2-uuid-002',
    points: 2000,
    growth_value: 3000,
    status: 1,
    created_at: new Date('2024-01-02T00:00:00Z'),
    updated_at: new Date('2024-01-02T00:00:00Z')
  },
  member3: {
    id: 'member-3-uuid-003',
    user_id: 'user-3-uuid-003',
    member_level_id: 'level-1-uuid-001',
    points: 500,
    growth_value: 1000,
    status: 1,
    created_at: new Date('2024-01-03T00:00:00Z'),
    updated_at: new Date('2024-01-03T00:00:00Z')
  }
};

// 业务规则配置
export const addressBusinessRules = {
  // 收件人姓名规则
  receiverNameRules: {
    minLength: 2,
    maxLength: 20,
    allowedChars: /^[\u4e00-\u9fa5a-zA-Z\s]+$/ // 中文、英文、空格
  },
  
  // 手机号规则
  phoneRules: {
    pattern: /^1[3-9]\d{9}$/,
    length: 11
  },
  
  // 地址字段规则
  addressRules: {
    province: { minLength: 1, maxLength: 20 },
    city: { minLength: 1, maxLength: 20 },
    district: { minLength: 1, maxLength: 20 },
    detailAddress: { minLength: 5, maxLength: 100 }
  },
  
  // 邮政编码规则
  postalCodeRules: {
    pattern: /^\d{6}$/,
    length: 6
  },
  
  // 标签规则
  labelRules: {
    maxLength: 10,
    allowedLabels: ['家', '公司', '学校', '其他']
  },
  
  // 地址数量限制
  limits: {
    maxAddressesPerUser: 10,
    defaultAddressLimit: 1
  }
};

// 性能测试数据
export const performanceTestData = {
  // 大量地址数据生成器
  generateLargeAddressList: (count: number): Array<any> => {
    const addresses: Array<any> = [];
    for (let i = 1; i <= count; i++) {
      addresses.push({
        id: `addr-perf-${i.toString().padStart(6, '0')}`,
        user_member_id: `member-perf-${Math.ceil(i / 3).toString().padStart(6, '0')}`,
        consignee: `测试用户${i}`,
        phone: `138${i.toString().padStart(8, '0')}`,
        province: `省份${Math.ceil(i / 100)}`,
        city: `城市${Math.ceil(i / 50)}`,
        district: `区县${Math.ceil(i / 20)}`,
        address: `详细地址${i}号`,
        is_default: i % 10 === 1 ? 1 : 0,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    return addresses;
  },
  
  // 批量操作测试数据
  batchOperationLimits: {
    maxBatchCreate: 50,
    maxBatchUpdate: 100,
    maxBatchDelete: 200
  }
};

// 错误场景测试数据
export const errorScenarios = {
  // 数据库连接错误
  databaseError: {
    type: 'CONNECTION_ERROR',
    message: 'Database connection failed'
  },
  
  // 用户不存在错误
  userNotFoundError: {
    type: 'USER_NOT_FOUND',
    message: '用户不存在'
  },
  
  // 地址不存在错误
  addressNotFoundError: {
    type: 'ADDRESS_NOT_FOUND',
    message: '地址不存在'
  },
  
  // 权限错误
  permissionError: {
    type: 'PERMISSION_DENIED',
    message: '无权限操作此地址'
  },
  
  // 数据验证错误
  validationError: {
    type: 'VALIDATION_ERROR',
    message: '数据验证失败'
  },
  
  // 业务规则错误
  businessRuleError: {
    type: 'BUSINESS_RULE_ERROR',
    message: '违反业务规则'
  }
};

// 并发测试数据
export const concurrencyTestData = {
  // 并发设置默认地址场景
  concurrentDefaultAddressSetting: {
    userMemberId: 'member-1-uuid-001',
    addressIds: [
      'addr-1-uuid-string-001',
      'addr-2-uuid-string-002'
    ]
  },
  
  // 并发创建地址场景
  concurrentAddressCreation: {
    userMemberId: 'member-1-uuid-001',
    requests: [
      createAddressRequests.validDefault,
      createAddressRequests.validNormal
    ]
  }
}; 