/**
 * 用户会员服务测试数据
 * 提供用户会员相关测试所需的模拟数据和业务规则
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { MemberStatus } from '../../src/types/member';

// 模拟会员等级数据
export const mockMemberLevels = [
  {
    id: 'level-bronze-001',
    name: '青铜会员',
    growth_required: 0,
    icon: 'bronze.png',
    color: '#CD7F32',
    benefits: ['基础优惠'],
    discount_rate: 0.95,
    is_enabled: true,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'level-silver-002', 
    name: '白银会员',
    growth_required: 1000,
    icon: 'silver.png',
    color: '#C0C0C0',
    benefits: ['5%折扣', '免费邮寄'],
    discount_rate: 0.90,
    is_enabled: true,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'level-gold-003',
    name: '黄金会员', 
    growth_required: 5000,
    icon: 'gold.png',
    color: '#FFD700',
    benefits: ['10%折扣', '免费邮寄', '优先客服'],
    discount_rate: 0.85,
    is_enabled: true,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'level-diamond-004',
    name: '钻石会员',
    growth_required: 20000,
    icon: 'diamond.png',
    color: '#B9F2FF',
    benefits: ['15%折扣', '免费邮寄', '优先客服', '专属活动'],
    discount_rate: 0.80,
    is_enabled: true,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  }
];

// 模拟用户数据
export const mockUsers = [
  {
    id: 'user-member-001',
    openid: 'wx_openid_001',
    unionid: 'wx_unionid_001',
    nickname: '张三会员',
    avatar: 'https://example.com/avatar1.jpg',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    gender: 1,
    birthday: new Date('1990-01-15'),
    country: '中国',
    province: '广东省',
    city: '深圳市',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'user-member-002',
    openid: 'wx_openid_002',
    unionid: 'wx_unionid_002',
    nickname: '李四会员',
    avatar: 'https://example.com/avatar2.jpg',
    phone: '13800138002',
    email: 'lisi@example.com',
    gender: 2,
    birthday: new Date('1985-05-20'),
    country: '中国',
    province: '北京市',
    city: '北京市',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'user-member-003',
    openid: 'wx_openid_003',
    unionid: 'wx_unionid_003',
    nickname: '王五会员',
    avatar: 'https://example.com/avatar3.jpg',
    phone: '13800138003',
    email: 'wangwu@example.com',
    gender: 1,
    birthday: new Date('1992-08-10'),
    country: '中国',
    province: '上海市',
    city: '上海市',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'user-member-004',
    openid: 'wx_openid_004',
    unionid: 'wx_unionid_004',
    nickname: '赵六会员',
    avatar: 'https://example.com/avatar4.jpg',
    phone: '13800138004',
    email: null,
    gender: 2,
    birthday: null,
    country: '中国',
    province: '浙江省',
    city: '杭州市',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  }
];

// 模拟用户会员数据
export const mockUserMembers = [
  {
    id: 'member-001-uuid-001',
    user_id: 'user-member-001',
    level_id: 'level-gold-003',
    growth: 6500,
    points: 1250,
    inviter_id: null,
    status: MemberStatus.ENABLED,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-15T00:00:00Z'),
    level: mockMemberLevels[2], // 黄金会员
    user: mockUsers[0]
  },
  {
    id: 'member-002-uuid-002',
    user_id: 'user-member-002',
    level_id: 'level-silver-002',
    growth: 2500,
    points: 800,
    inviter_id: 'user-member-001',
    status: MemberStatus.ENABLED,
    created_at: new Date('2024-01-05T00:00:00Z'),
    updated_at: new Date('2024-01-20T00:00:00Z'),
    level: mockMemberLevels[1], // 白银会员
    user: mockUsers[1]
  },
  {
    id: 'member-003-uuid-003',
    user_id: 'user-member-003',
    level_id: 'level-bronze-001',
    growth: 800,
    points: 300,
    inviter_id: 'user-member-001',
    status: MemberStatus.ENABLED,
    created_at: new Date('2024-01-10T00:00:00Z'),
    updated_at: new Date('2024-01-25T00:00:00Z'),
    level: mockMemberLevels[0], // 青铜会员
    user: mockUsers[2]
  },
  {
    id: 'member-004-uuid-004',
    user_id: 'user-member-004',
    level_id: 'level-diamond-004',
    growth: 25000,
    points: 5000,
    inviter_id: null,
    status: MemberStatus.DISABLED,
    created_at: new Date('2024-01-02T00:00:00Z'),
    updated_at: new Date('2024-01-30T00:00:00Z'),
    level: mockMemberLevels[3], // 钻石会员
    user: mockUsers[3]
  },
  {
    id: 'member-005-uuid-005',
    user_id: 'user-member-005',
    level_id: 'level-bronze-001',
    growth: 200,
    points: 50,
    inviter_id: 'user-member-002',
    status: MemberStatus.ENABLED,
    created_at: new Date('2024-02-01T00:00:00Z'),
    updated_at: new Date('2024-02-01T00:00:00Z'),
    level: mockMemberLevels[0], // 青铜会员
    user: {
      id: 'user-member-005',
      nickname: '新用户会员',
      avatar: 'https://example.com/avatar5.jpg',
      phone: '13800138005'
    }
  }
];

// 查询参数测试数据
export const memberQueryParams = {
  // 基础分页参数
  basicPagination: {
    page: 1,
    size: 10
  },
  
  // 用户筛选
  userFilter: {
    page: 1,
    size: 5,
    user_id: 'user-member-001'
  },
  
  // 等级筛选
  levelFilter: {
    page: 1,
    size: 10,
    level_id: 'level-gold-003'
  },
  
  // 状态筛选
  statusFilter: {
    page: 1,
    size: 10,
    status: MemberStatus.ENABLED
  },
  
  // 成长值范围筛选
  growthRangeFilter: {
    page: 1,
    size: 10,
    growth_min: 1000,
    growth_max: 10000
  },
  
  // 积分范围筛选
  pointsRangeFilter: {
    page: 1,
    size: 10,
    points_min: 500,
    points_max: 2000
  },
  
  // 复杂条件筛选
  complexFilter: {
    page: 1,
    size: 5,
    level_id: 'level-silver-002',
    status: MemberStatus.ENABLED,
    growth_min: 2000,
    points_min: 500
  },
  
  // 边界值测试
  boundaryValues: {
    page: 1,
    size: 1
  },
  
  // 大分页测试
  largePagination: {
    page: 100,
    size: 50
  }
};

// 创建会员请求数据
export const createMemberRequests = {
  // 有效的普通会员创建
  validNormal: {
    user_id: 'user-new-001',
    level_id: 'level-bronze-001',
    growth: 0,
    points: 100,
    status: MemberStatus.ENABLED
  },
  
  // 有效的带邀请人创建
  validWithInviter: {
    user_id: 'user-new-002',
    level_id: 'level-bronze-001',
    growth: 500,
    points: 200,
    inviter_id: 'user-member-001',
    status: MemberStatus.ENABLED
  },
  
  // 高等级会员创建
  validHighLevel: {
    user_id: 'user-new-003',
    level_id: 'level-gold-003',
    growth: 6000,
    points: 1500,
    status: MemberStatus.ENABLED
  },
  
  // 最小化数据创建
  validMinimal: {
    user_id: 'user-new-004',
    level_id: 'level-bronze-001'
  }
};

// 更新会员请求数据
export const updateMemberRequests = {
  // 更新等级
  updateLevel: {
    level_id: 'level-silver-002'
  },
  
  // 更新成长值和积分
  updateGrowthPoints: {
    growth: 3000,
    points: 1000
  },
  
  // 更新状态
  updateStatus: {
    status: MemberStatus.DISABLED
  },
  
  // 更新邀请人
  updateInviter: {
    inviter_id: 'user-member-002'
  },
  
  // 完整更新
  fullUpdate: {
    level_id: 'level-gold-003',
    growth: 7000,
    points: 2000,
    status: MemberStatus.ENABLED,
    inviter_id: 'user-member-001'
  },
  
  // 部分更新
  partialUpdate: {
    points: 1500
  }
};

// 无效请求数据
export const invalidMemberRequests = {
  // 用户不存在
  nonExistentUser: {
    user_id: 'non-existent-user',
    level_id: 'level-bronze-001'
  },
  
  // 等级不存在
  nonExistentLevel: {
    user_id: 'user-member-001',
    level_id: 'non-existent-level'
  },
  
  // 邀请人不存在
  nonExistentInviter: {
    user_id: 'user-new-005',
    level_id: 'level-bronze-001',
    inviter_id: 'non-existent-inviter'
  },
  
  // 无效状态
  invalidStatus: {
    user_id: 'user-new-006',
    level_id: 'level-bronze-001',
    status: 999 as MemberStatus
  },
  
  // 负数成长值
  negativeGrowth: {
    user_id: 'user-new-007',
    level_id: 'level-bronze-001',
    growth: -100
  },
  
  // 负数积分
  negativePoints: {
    user_id: 'user-new-008',
    level_id: 'level-bronze-001',
    points: -50
  },
  
  // 缺少必填字段
  missingFields: {
    // 缺少 user_id 和 level_id
    growth: 100
  },
  
  // 空字符串字段
  emptyFields: {
    user_id: '',
    level_id: ''
  }
};

// 积分和成长值变化测试数据
export const pointsGrowthChanges = {
  // 正常增加
  normalIncrease: {
    pointsChange: 100,
    growthChange: 200
  },
  
  // 正常减少
  normalDecrease: {
    pointsChange: -50,
    growthChange: -100
  },
  
  // 大额增加
  largeIncrease: {
    pointsChange: 1000,
    growthChange: 2000
  },
  
  // 大额减少（测试积分不能为负）
  largeDecrease: {
    pointsChange: -10000,
    growthChange: -5000
  },
  
  // 零变化
  zeroChange: {
    pointsChange: 0,
    growthChange: 0
  },
  
  // 等级升级触发点
  levelUpTrigger: {
    pointsChange: 500,
    growthChange: 3000 // 足以让青铜升级到白银
  }
};

// 统计信息预期结果
export const expectedStatistics = {
  totalMembers: 5,
  activeMembers: 4, // 状态为启用的会员数
  membersByLevel: [
    {
      levelId: 'level-bronze-001',
      levelName: '青铜会员',
      count: 2
    },
    {
      levelId: 'level-silver-002', 
      levelName: '白银会员',
      count: 1
    },
    {
      levelId: 'level-gold-003',
      levelName: '黄金会员',
      count: 1
    },
    {
      levelId: 'level-diamond-004',
      levelName: '钻石会员',
      count: 0 // 被禁用，不统计
    }
  ]
};

// 会员业务规则配置
export const memberBusinessRules = {
  // 成长值规则
  growthRules: {
    min: 0,
    max: 999999,
    upgradeThresholds: {
      bronze: 0,
      silver: 1000,
      gold: 5000,
      diamond: 20000
    }
  },
  
  // 积分规则
  pointsRules: {
    min: 0,
    max: 999999,
    canBeNegative: false,
    earnRatio: 0.1, // 消费1元获得0.1积分
    redeemRatio: 100 // 100积分抵扣1元
  },
  
  // 等级规则
  levelRules: {
    autoUpgrade: true,
    autoDowngrade: false,
    maxLevel: 'diamond',
    benefitsInheritance: true
  },
  
  // 邀请规则
  invitationRules: {
    maxDepth: 3, // 最大邀请层级
    inviterReward: {
      points: 100,
      growth: 50
    },
    inviteeReward: {
      points: 50,
      growth: 20
    }
  },
  
  // 状态规则
  statusRules: {
    defaultStatus: MemberStatus.ENABLED,
    canSelfDisable: false,
    requireApproval: false
  }
};

// 错误测试场景
export const errorScenarios = {
  databaseConnection: {
    error: new Error('Database connection failed'),
    expectedMessage: '获取用户会员列表失败'
  },
  
  userNotFound: {
    error: new Error('用户不存在'),
    expectedMessage: '用户不存在'
  },
  
  memberNotFound: {
    error: new Error('用户会员不存在'),
    expectedMessage: '用户会员不存在'
  },
  
  levelNotFound: {
    error: new Error('会员等级不存在'),
    expectedMessage: '会员等级不存在'
  },
  
  inviterNotFound: {
    error: new Error('邀请人不存在'),
    expectedMessage: '邀请人不存在'
  },
  
  duplicateMember: {
    error: new Error('该用户已有会员信息'),
    expectedMessage: '该用户已有会员信息'
  },
  
    updateFailed: {
    error: new Error('Database update failed'),
    expectedMessage: '更新用户会员失败'
  },

  deleteFailed: {
    error: new Error('Database delete failed'),
    expectedMessage: '删除用户会员失败'
  }
};

// 性能测试数据
export const performanceTestData = {
  // 大数据量测试
  largeDataset: {
    totalMembers: 100000,
    pageSize: 100,
    expectedPages: 1000
  },
  
  // 批量操作测试
  batchOperations: {
    batchSize: 1000,
    maxProcessingTime: 5000 // 5秒
  },
  
  // 并发测试
  concurrencyTest: {
    concurrentUsers: 50,
    operationsPerUser: 10
  }
}; 