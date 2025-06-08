/**
 * 会员积分服务测试装置数据
 * 提供积分记录管理相关的测试数据
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PointChangeType } from '../../src/types/member';

// 模拟积分记录数据
export const mockMemberPoints = [
  {
    id: 'mp_001',
    user_member_id: 'um_001',
    change: 100,
    type: PointChangeType.EARN,
    remark: '购买商品获得积分',
    created_at: new Date('2024-01-15T10:30:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z'),
    user_member: {
      id: 'um_001',
      user_id: 'user_001',
      member_number: 'M001',
      points: 1250,
      level_id: 'level_gold',
      status: 1,
      level: {
        id: 'level_gold',
        name: '黄金会员',
        min_points: 1000,
        discount_rate: 0.08
      },
      user: {
        id: 'user_001',
        nickname: '张小明',
        avatar: 'https://example.com/avatar1.jpg',
        phone: '13800138001'
      }
    }
  },
  {
    id: 'mp_002',
    user_member_id: 'um_001',
    change: -50,
    type: PointChangeType.CONSUME,
    remark: '兑换优惠券消费积分',
    created_at: new Date('2024-01-16T14:20:00Z'),
    updated_at: new Date('2024-01-16T14:20:00Z'),
    user_member: {
      id: 'um_001',
      user_id: 'user_001',
      member_number: 'M001',
      points: 1200,
      level_id: 'level_gold',
      status: 1,
      level: {
        id: 'level_gold',
        name: '黄金会员',
        min_points: 1000,
        discount_rate: 0.08
      },
      user: {
        id: 'user_001',
        nickname: '张小明',
        avatar: 'https://example.com/avatar1.jpg',
        phone: '13800138001'
      }
    }
  },
  {
    id: 'mp_003',
    user_member_id: 'um_002',
    change: 200,
    type: PointChangeType.EARN,
    remark: '签到奖励',
    created_at: new Date('2024-01-17T09:15:00Z'),
    updated_at: new Date('2024-01-17T09:15:00Z'),
    user_member: {
      id: 'um_002',
      user_id: 'user_002',
      member_number: 'M002',
      points: 800,
      level_id: 'level_silver',
      status: 1,
      level: {
        id: 'level_silver',
        name: '白银会员',
        min_points: 500,
        discount_rate: 0.05
      },
      user: {
        id: 'user_002',
        nickname: '李小红',
        avatar: 'https://example.com/avatar2.jpg',
        phone: '13800138002'
      }
    }
  },
  {
    id: 'mp_004',
    user_member_id: 'um_001',
    change: 25,
    type: PointChangeType.ADJUST,
    remark: '系统调整积分',
    created_at: new Date('2024-01-18T16:45:00Z'),
    updated_at: new Date('2024-01-18T16:45:00Z'),
    user_member: {
      id: 'um_001',
      user_id: 'user_001',
      member_number: 'M001',
      points: 1275,
      level_id: 'level_gold',
      status: 1,
      level: {
        id: 'level_gold',
        name: '黄金会员',
        min_points: 1000,
        discount_rate: 0.08
      },
      user: {
        id: 'user_001',
        nickname: '张小明',
        avatar: 'https://example.com/avatar1.jpg',
        phone: '13800138001'
      }
    }
  },
  {
    id: 'mp_005',
    user_member_id: 'um_003',
    change: -100,
    type: PointChangeType.CONSUME,
    remark: '积分抵扣订单金额',
    created_at: new Date('2024-01-19T11:30:00Z'),
    updated_at: new Date('2024-01-19T11:30:00Z'),
    user_member: {
      id: 'um_003',
      user_id: 'user_003',
      member_number: 'M003',
      points: 300,
      level_id: 'level_bronze',
      status: 1,
      level: {
        id: 'level_bronze',
        name: '青铜会员',
        min_points: 0,
        discount_rate: 0.02
      },
      user: {
        id: 'user_003',
        nickname: '王大明',
        avatar: 'https://example.com/avatar3.jpg',
        phone: '13800138003'
      }
    }
  },
  {
    id: 'mp_006',
    user_member_id: 'um_002',
    change: -25,
    type: PointChangeType.ADJUST,
    remark: '积分过期扣除',
    created_at: new Date('2024-01-20T08:00:00Z'),
    updated_at: new Date('2024-01-20T08:00:00Z'),
    user_member: {
      id: 'um_002',
      user_id: 'user_002',
      member_number: 'M002',
      points: 775,
      level_id: 'level_silver',
      status: 1,
      level: {
        id: 'level_silver',
        name: '白银会员',
        min_points: 500,
        discount_rate: 0.05
      },
      user: {
        id: 'user_002',
        nickname: '李小红',
        avatar: 'https://example.com/avatar2.jpg',
        phone: '13800138002'
      }
    }
  }
];

// 积分查询参数测试数据
export const memberPointQueryParams = {
  valid: [
    {
      page: 1,
      size: 10,
      user_member_id: 'um_001',
      type: PointChangeType.EARN
    },
    {
      page: 2,
      size: 5,
      change_min: 50,
      change_max: 200
    },
    {
      page: 1,
      size: 20,
      start_date: '2024-01-15',
      end_date: '2024-01-20'
    },
    {
      page: 1,
      size: 10,
      user_member_id: 'um_002',
      type: PointChangeType.CONSUME,
      change_min: 20
    }
  ],
  invalid: [
    {
      page: 0,
      size: 10
    },
    {
      page: 1,
      size: 0
    },
    {
      page: -1,
      size: 5
    },
    {
      page: 1,
      size: 1001
    }
  ],
  boundary: [
    {
      page: 1,
      size: 1
    },
    {
      page: 1,
      size: 100
    },
    {
      page: 1000,
      size: 10
    }
  ],
  edge: [
    {
      page: 1,
      size: 10,
      change_min: 0,
      change_max: 0
    },
    {
      page: 1,
      size: 10,
      start_date: '2024-01-01',
      end_date: '2024-01-01'
    }
  ]
};

// 积分创建请求测试数据
export const memberPointCreateRequests = {
  valid: [
    {
      user_member_id: 'um_001',
      change: 100,
      type: PointChangeType.EARN,
      remark: '购买商品获得积分'
    },
    {
      user_member_id: 'um_002',
      change: -50,
      type: PointChangeType.CONSUME,
      remark: '兑换商品消费积分'
    },
    {
      user_member_id: 'um_003',
      change: 25,
      type: PointChangeType.ADJUST,
      remark: '系统调整积分'
    },
    {
      user_member_id: 'um_001',
      change: -25,
      type: PointChangeType.ADJUST,
      remark: '积分过期扣除'
    }
  ],
  invalid: [
    {
      user_member_id: '',
      change: 100,
      type: PointChangeType.EARN,
      remark: '用户会员ID为空'
    },
    {
      user_member_id: 'um_001',
      change: 0,
      type: PointChangeType.EARN,
      remark: '积分变化为0'
    },
    {
      user_member_id: 'um_001',
      change: 100,
      type: 'INVALID_TYPE' as any,
      remark: '无效的积分类型'
    },
    {
      user_member_id: 'um_001',
      change: 100,
      type: PointChangeType.EARN,
      remark: ''
    }
  ],
  boundary: [
    {
      user_member_id: 'um_001',
      change: 1,
      type: PointChangeType.EARN,
      remark: '最小正积分变化'
    },
    {
      user_member_id: 'um_001',
      change: -1,
      type: PointChangeType.CONSUME,
      remark: '最小负积分变化'
    },
    {
      user_member_id: 'um_001',
      change: 10000,
      type: PointChangeType.EARN,
      remark: '大额积分获得'
    },
    {
      user_member_id: 'um_001',
      change: -10000,
      type: PointChangeType.CONSUME,
      remark: '大额积分消费'
    }
  ]
};

// 批量积分操作测试数据
export const memberPointBatchData = {
  valid: [
    [
      {
        user_member_id: 'um_001',
        change: 50,
        type: PointChangeType.EARN,
        remark: '批量奖励1'
      },
      {
        user_member_id: 'um_002',
        change: 75,
        type: PointChangeType.EARN,
        remark: '批量奖励2'
      }
    ],
    [
      {
        user_member_id: 'um_001',
        change: -20,
        type: PointChangeType.CONSUME,
        remark: '批量消费1'
      },
      {
        user_member_id: 'um_002',
        change: -30,
        type: PointChangeType.CONSUME,
        remark: '批量消费2'
      },
      {
        user_member_id: 'um_003',
        change: -10,
        type: PointChangeType.CONSUME,
        remark: '批量消费3'
      }
    ]
  ],
  invalid: [
    [],
    [
      {
        user_member_id: '',
        change: 50,
        type: PointChangeType.EARN,
        remark: '用户会员ID为空'
      }
    ],
    [
      {
        user_member_id: 'um_001',
        change: 0,
        type: PointChangeType.EARN,
        remark: '积分变化为0'
      }
    ]
  ],
  boundary: [
    [
      {
        user_member_id: 'um_001',
        change: 1,
        type: PointChangeType.EARN,
        remark: '单个记录'
      }
    ]
  ]
};

// 积分统计数据
export const memberPointStatistics = {
  expected: {
    um_001: {
      totalEarned: 125,
      totalConsumed: 50,
      totalAdjusted: 25,
      currentBalance: 1275,
      recentRecordsCount: 3
    },
    um_002: {
      totalEarned: 200,
      totalConsumed: 0,
      totalAdjusted: -25,
      currentBalance: 775,
      recentRecordsCount: 2
    },
    um_003: {
      totalEarned: 0,
      totalConsumed: 100,
      totalAdjusted: 0,
      currentBalance: 300,
      recentRecordsCount: 1
    }
  }
};

// 积分趋势数据
export const memberPointTrendData = {
  input: {
    days: 7,
    expectedDates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-20']
  },
  expected: [
    {
      date: '2024-01-15',
      totalEarned: 100,
      totalConsumed: 0,
      netChange: 100
    },
    {
      date: '2024-01-16',
      totalEarned: 0,
      totalConsumed: 50,
      netChange: -50
    },
    {
      date: '2024-01-17',
      totalEarned: 200,
      totalConsumed: 0,
      netChange: 200
    },
    {
      date: '2024-01-18',
      totalEarned: 0,
      totalConsumed: 0,
      netChange: 25
    },
    {
      date: '2024-01-19',
      totalEarned: 0,
      totalConsumed: 100,
      netChange: -100
    },
    {
      date: '2024-01-20',
      totalEarned: 0,
      totalConsumed: 0,
      netChange: -25
    }
  ]
};

// 积分删除场景测试数据
export const memberPointDeleteScenarios = {
  valid: [
    {
      id: 'mp_001',
      canDelete: true,
      reason: '正常删除'
    }
  ],
  invalid: [
    {
      id: 'mp_non_existent',
      canDelete: false,
      reason: '积分记录不存在'
    },
    {
      id: 'mp_002',
      canDelete: false,
      reason: '已关联其他业务数据'
    }
  ]
};

// 响应格式验证数据
export const memberPointResponseFormats = {
  list: {
    list: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  },
  detail: {
    id: '',
    user_member_id: '',
    change: 0,
    type: PointChangeType.EARN,
    remark: '',
    created_at: new Date(),
    updated_at: new Date()
  },
  statistics: {
    totalEarned: 0,
    totalConsumed: 0,
    totalAdjusted: 0,
    currentBalance: 0,
    recentRecords: []
  },
  trend: [
    {
      date: '',
      totalEarned: 0,
      totalConsumed: 0,
      netChange: 0
    }
  ]
};

// 业务规则配置
export const memberPointBusinessRules = {
  pointLimits: {
    maxSingleChange: 10000,
    minSingleChange: -10000,
    maxDailyEarn: 50000,
    maxDailyConsume: 20000,
    maxBalance: 1000000
  },
  validTypes: [
    PointChangeType.EARN,
    PointChangeType.CONSUME,
    PointChangeType.ADJUST
  ],
  remarkConstraints: {
    maxLength: 200,
    minLength: 1,
    allowedChars: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_.,!?()（）]+$/
  },
  queryConstraints: {
    maxPageSize: 100,
    minPageSize: 1,
    defaultPageSize: 10,
    maxPage: 10000,
    maxDateRange: 365
  }
};

// 错误场景测试数据
export const memberPointErrorScenarios = [
  {
    type: 'MEMBER_NOT_FOUND',
    input: {
      user_member_id: 'um_non_existent',
      change: 100,
      type: PointChangeType.EARN,
      remark: '不存在的用户会员'
    },
    expectedError: '用户会员不存在'
  },
  {
    type: 'INVALID_POINT_TYPE',
    input: {
      user_member_id: 'um_001',
      change: 100,
      type: 'INVALID_TYPE' as any,
      remark: '无效积分类型'
    },
    expectedError: '积分变化类型无效'
  },
  {
    type: 'NEGATIVE_BALANCE',
    input: {
      user_member_id: 'um_001',
      change: -20000,
      type: PointChangeType.CONSUME,
      remark: '超额消费导致负积分'
    },
    expectedError: '积分余额不足'
  },
  {
    type: 'CONCURRENT_UPDATE',
    input: {
      user_member_id: 'um_001',
      change: 100,
      type: PointChangeType.EARN,
      remark: '并发更新冲突'
    },
    expectedError: '并发更新冲突'
  }
];

// 性能测试数据
export const memberPointPerformanceData = {
  largeDataset: {
    recordCount: 10000,
    userCount: 1000,
    queryTimeout: 5000
  },
  batchLimits: {
    maxBatchSize: 1000,
    recommendedBatchSize: 100,
    minBatchSize: 1
  }
}; 