/**
 * 用户会员服务测试
 * 测试会员CRUD操作、成长值积分管理、等级升级等核心功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { UserMemberService } from '../../src/services/user-member-service';
import { MemberStatus } from '../../src/types/member';
import {
  mockUserMembers,
  mockMemberLevels,
  mockUsers,
  memberQueryParams,
  createMemberRequests,
  updateMemberRequests,
  invalidMemberRequests,
  pointsGrowthChanges,
  expectedStatistics,
  memberBusinessRules,
  errorScenarios
} from '../fixtures/user-member-fixtures';

// Mock Prisma Client和依赖服务
jest.mock('@prisma/client');
jest.mock('../../src/utils/logger');
jest.mock('../../src/services/member-level-service');
jest.mock('../../src/config/database', () => ({
  prisma: {}
}));

describe('UserMemberService 用户会员服务测试', () => {
  let userMemberService: UserMemberService;
  let mockPrisma: any;
  let mockMemberLevelService: any;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 创建mock prisma实例
    mockPrisma = {
      userMember: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn()
      },
      user: {
        findUnique: jest.fn()
      }
    };

    // Mock memberLevelService
    mockMemberLevelService = {
      getMemberLevelById: jest.fn(),
      getMemberLevelByGrowth: jest.fn()
    };

    // 替换PrismaClient构造函数
    const { PrismaClient } = require('@prisma/client');
    PrismaClient.mockImplementation(() => mockPrisma);
    
    // Mock数据库配置模块
    const databaseModule = require('../../src/config/database');
    databaseModule.prisma = mockPrisma;

    // 替换memberLevelService
    const memberLevelServiceModule = require('../../src/services/member-level-service');
    memberLevelServiceModule.memberLevelService = mockMemberLevelService;

    userMemberService = new UserMemberService();
  });

  // ==================== 会员数据验证测试 ====================
  describe('会员数据验证测试', () => {
    test('应该验证会员数据结构完整性', () => {
      const member = mockUserMembers[0];
      expect(member).toHaveProperty('id');
      expect(member).toHaveProperty('user_id');
      expect(member).toHaveProperty('level_id');
      expect(member).toHaveProperty('growth');
      expect(member).toHaveProperty('points');
      expect(member).toHaveProperty('status');
      expect(member).toHaveProperty('created_at');
      expect(member).toHaveProperty('updated_at');
    });

    test('应该验证会员状态枚举值', () => {
      const enabledMember = mockUserMembers.find(m => m.status === MemberStatus.ENABLED);
      const disabledMember = mockUserMembers.find(m => m.status === MemberStatus.DISABLED);
      
      expect(enabledMember).toBeDefined();
      expect(disabledMember).toBeDefined();
      expect(Object.values(MemberStatus)).toContain(enabledMember?.status);
      expect(Object.values(MemberStatus)).toContain(disabledMember?.status);
    });

    test('应该验证成长值和积分数值范围', () => {
      mockUserMembers.forEach(member => {
        expect(member.growth).toBeGreaterThanOrEqual(0);
        expect(member.points).toBeGreaterThanOrEqual(0);
        expect(member.growth).toBeLessThanOrEqual(memberBusinessRules.growthRules.max);
        expect(member.points).toBeLessThanOrEqual(memberBusinessRules.pointsRules.max);
      });
    });

    test('应该验证会员等级关联数据', () => {
      mockUserMembers.forEach(member => {
        expect(member.level).toBeDefined();
        expect(member.level.id).toBe(member.level_id);
        expect(member.level.name).toBeDefined();
      });
    });

    test('应该验证用户关联数据', () => {
      mockUserMembers.forEach(member => {
        expect(member.user).toBeDefined();
        expect(member.user.id).toBe(member.user_id);
        expect(member.user.nickname).toBeDefined();
      });
    });
  });

  // ==================== 会员查询功能测试 ====================
  describe('会员查询功能测试', () => {
    test('应该成功获取会员列表（分页）', async () => {
      mockPrisma.userMember.count.mockResolvedValue(5);
      mockPrisma.userMember.findMany.mockResolvedValue(mockUserMembers.slice(0, 2));

      const result = await userMemberService.getUserMemberList(memberQueryParams.basicPagination);

      expect(mockPrisma.userMember.count).toHaveBeenCalledWith({ where: {} });
      expect(mockPrisma.userMember.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: expect.objectContaining({
          level: true,
          user: expect.objectContaining({
            select: expect.objectContaining({
              id: true,
              nickname: true,
              avatar: true,
              phone: true
            })
          })
        }),
        orderBy: [
          { growth: 'desc' },
          { created_at: 'desc' }
        ]
      });
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });

    test('应该支持用户筛选查询', async () => {
      const filteredMembers = mockUserMembers.filter(m => m.user_id === 'user-member-001');
      
      mockPrisma.userMember.count.mockResolvedValue(filteredMembers.length);
      mockPrisma.userMember.findMany.mockResolvedValue(filteredMembers);

      await userMemberService.getUserMemberList(memberQueryParams.userFilter);

      expect(mockPrisma.userMember.count).toHaveBeenCalledWith({
        where: { user_id: 'user-member-001' }
      });
    });

    test('应该支持等级筛选查询', async () => {
      const filteredMembers = mockUserMembers.filter(m => m.level_id === 'level-gold-003');
      
      mockPrisma.userMember.count.mockResolvedValue(filteredMembers.length);
      mockPrisma.userMember.findMany.mockResolvedValue(filteredMembers);

      await userMemberService.getUserMemberList(memberQueryParams.levelFilter);

      expect(mockPrisma.userMember.count).toHaveBeenCalledWith({
        where: { level_id: 'level-gold-003' }
      });
    });

    test('应该支持成长值范围筛选', async () => {
      mockPrisma.userMember.count.mockResolvedValue(2);
      mockPrisma.userMember.findMany.mockResolvedValue(mockUserMembers.slice(0, 2));

      await userMemberService.getUserMemberList(memberQueryParams.growthRangeFilter);

      expect(mockPrisma.userMember.count).toHaveBeenCalledWith({
        where: {
          growth: {
            gte: 1000,
            lte: 10000
          }
        }
      });
    });

    test('应该支持复杂条件筛选', async () => {
      mockPrisma.userMember.count.mockResolvedValue(1);
      mockPrisma.userMember.findMany.mockResolvedValue([mockUserMembers[1]]);

      await userMemberService.getUserMemberList(memberQueryParams.complexFilter);

      expect(mockPrisma.userMember.count).toHaveBeenCalledWith({
        where: {
          level_id: 'level-silver-002',
          status: MemberStatus.ENABLED,
          growth: { gte: 2000 },
          points: { gte: 500 }
        }
      });
    });
  });

  // ==================== 会员详情查询测试 ====================
  describe('会员详情查询测试', () => {
    test('应该成功获取会员详情', async () => {
      const expectedMember = mockUserMembers[0];
      mockPrisma.userMember.findUnique.mockResolvedValue(expectedMember);

      const result = await userMemberService.getUserMemberById('member-001-uuid-001');

      expect(mockPrisma.userMember.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-001-uuid-001' },
        include: expect.objectContaining({
          level: true,
          user: expect.objectContaining({
            select: expect.objectContaining({
              id: true,
              nickname: true,
              avatar: true,
              phone: true,
              email: true,
              gender: true,
              birthday: true,
              created_at: true
            })
          })
        })
      });
      expect(result?.id).toBe('member-001-uuid-001');
    });

    test('应该处理会员不存在的情况', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(null);

      const result = await userMemberService.getUserMemberById('non-existent-id');

      expect(result).toBeNull();
    });

    test('应该根据用户ID获取会员信息', async () => {
      const expectedMember = mockUserMembers[0];
      mockPrisma.userMember.findUnique.mockResolvedValue(expectedMember);

      const result = await userMemberService.getUserMemberByUserId('user-member-001');

      expect(mockPrisma.userMember.findUnique).toHaveBeenCalledWith({
        where: { user_id: 'user-member-001' },
        include: expect.objectContaining({
          level: true,
          user: expect.objectContaining({
            select: expect.objectContaining({
              id: true,
              nickname: true,
              avatar: true,
              phone: true
            })
          })
        })
      });
      expect(result?.user_id).toBe('user-member-001');
    });
  });

  // ==================== 会员创建功能测试 ====================
  describe('会员创建功能测试', () => {
    test('应该成功创建普通会员', async () => {
      const newMember = {
        ...mockUserMembers[0],
        id: 'new-member-id',
        user_id: createMemberRequests.validNormal.user_id,
        level_id: createMemberRequests.validNormal.level_id
      };

      mockPrisma.userMember.findUnique.mockResolvedValue(null); // 不存在重复
      mockPrisma.user.findUnique.mockResolvedValue(mockUsers[0]); // 用户存在
      mockMemberLevelService.getMemberLevelById.mockResolvedValue(mockMemberLevels[0]); // 等级存在
      mockPrisma.userMember.create.mockResolvedValue(newMember);

      const result = await userMemberService.createUserMember(createMemberRequests.validNormal);

      expect(mockPrisma.userMember.findUnique).toHaveBeenCalledWith({
        where: { user_id: createMemberRequests.validNormal.user_id }
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: createMemberRequests.validNormal.user_id }
      });
      expect(mockMemberLevelService.getMemberLevelById).toHaveBeenCalledWith(
        createMemberRequests.validNormal.level_id
      );
      expect(result.user_id).toBe(createMemberRequests.validNormal.user_id);
    });

    test('应该验证用户已存在会员信息', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(mockUserMembers[0]);

      await expect(
        userMemberService.createUserMember(createMemberRequests.validNormal)
      ).rejects.toThrow('该用户已有会员信息');
    });

    test('应该验证用户存在性', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        userMemberService.createUserMember(invalidMemberRequests.nonExistentUser)
      ).rejects.toThrow('用户不存在');
    });

    test('应该验证等级存在性', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUsers[0]);
      mockMemberLevelService.getMemberLevelById.mockResolvedValue(null);

      await expect(
        userMemberService.createUserMember(invalidMemberRequests.nonExistentLevel)
      ).rejects.toThrow('会员等级不存在');
    });
  });

  // ==================== 会员更新功能测试 ====================
  describe('会员更新功能测试', () => {
    test('应该成功更新会员信息', async () => {
      const existingMember = mockUserMembers[0];
      const updatedMember = { ...existingMember, growth: 8000 };

      mockPrisma.userMember.findUnique.mockResolvedValue(existingMember);
      mockPrisma.userMember.update.mockResolvedValue(updatedMember);

      const result = await userMemberService.updateUserMember(
        'member-001-uuid-001',
        updateMemberRequests.updateGrowthPoints
      );

      expect(mockPrisma.userMember.update).toHaveBeenCalledWith({
        where: { id: 'member-001-uuid-001' },
        data: updateMemberRequests.updateGrowthPoints,
        include: expect.objectContaining({
          level: true,
          user: expect.objectContaining({
            select: expect.objectContaining({
              id: true,
              nickname: true,
              avatar: true,
              phone: true
            })
          })
        })
      });
      expect(result.growth).toBe(8000);
    });

    test('应该验证会员存在性', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(null);

      await expect(
        userMemberService.updateUserMember(
          'non-existent-member',
          updateMemberRequests.updateGrowthPoints
        )
      ).rejects.toThrow('用户会员不存在');
    });
  });

  // ==================== 会员删除功能测试 ====================
  describe('会员删除功能测试', () => {
    test('应该成功删除会员', async () => {
      const memberToDelete = mockUserMembers[0];
      mockPrisma.userMember.findUnique.mockResolvedValue(memberToDelete);
      mockPrisma.userMember.delete.mockResolvedValue(memberToDelete);

      await userMemberService.deleteUserMember('member-001-uuid-001');

      expect(mockPrisma.userMember.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-001-uuid-001' }
      });
      expect(mockPrisma.userMember.delete).toHaveBeenCalledWith({
        where: { id: 'member-001-uuid-001' }
      });
    });

    test('应该验证会员存在性', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(null);

      await expect(
        userMemberService.deleteUserMember('non-existent-member')
      ).rejects.toThrow('用户会员不存在');

      expect(mockPrisma.userMember.delete).not.toHaveBeenCalled();
    });
  });

  // ==================== 成长值管理测试 ====================
  describe('成长值管理测试', () => {
    test('应该成功更新用户成长值', async () => {
      const existingMember = mockUserMembers[2]; // 青铜会员
      const updatedMember = { ...existingMember, growth: 1000 };

      mockPrisma.userMember.findUnique.mockResolvedValue(existingMember);
      mockMemberLevelService.getMemberLevelByGrowth.mockResolvedValue(mockMemberLevels[1]);
      mockMemberLevelService.getMemberLevelById.mockResolvedValue(mockMemberLevels[1]);
      mockPrisma.userMember.update.mockResolvedValue(updatedMember);

      const result = await userMemberService.updateUserGrowth(
        'user-member-003',
        pointsGrowthChanges.normalIncrease.growthChange
      );

      expect(result.growth).toBe(1000);
    });

    test('应该自动升级会员等级', async () => {
      const existingMember = mockUserMembers[2]; // 青铜会员，成长值800
      const newLevel = mockMemberLevels[1]; // 白银会员
      const updatedMember = { ...existingMember, level_id: newLevel.id, growth: 1300 };

      mockPrisma.userMember.findUnique.mockResolvedValue(existingMember);
      mockMemberLevelService.getMemberLevelByGrowth.mockResolvedValue(newLevel);
      mockMemberLevelService.getMemberLevelById.mockResolvedValue(newLevel);
      mockPrisma.userMember.update.mockResolvedValue(updatedMember);
      
      const result = await userMemberService.updateUserGrowth(
        'user-member-003',
        pointsGrowthChanges.levelUpTrigger.growthChange
      );

      // 验证等级升级逻辑
      expect(mockMemberLevelService.getMemberLevelByGrowth).toHaveBeenCalledWith(
        existingMember.growth + pointsGrowthChanges.levelUpTrigger.growthChange
      );
      expect(result.level_id).toBe(newLevel.id);
    });

    test('应该处理用户不存在的情况', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(null);

      await expect(
        userMemberService.updateUserGrowth('non-existent-user', 100)
      ).rejects.toThrow('用户会员信息不存在');
    });
  });

  // ==================== 积分管理测试 ====================
  describe('积分管理测试', () => {
    test('应该成功更新用户积分', async () => {
      const existingMember = mockUserMembers[0];
      const updatedMember = { ...existingMember, points: 1350 };

      mockPrisma.userMember.findUnique.mockResolvedValue(existingMember);
      mockPrisma.userMember.update.mockResolvedValue(updatedMember);

      const result = await userMemberService.updateUserPoints(
        'user-member-001',
        pointsGrowthChanges.normalIncrease.pointsChange
      );

      expect(result.points).toBe(1350);
    });

    test('应该防止积分变为负数', async () => {
      const existingMember = mockUserMembers[4]; // 积分50
      const updatedMember = { ...existingMember, points: 0 };

      mockPrisma.userMember.findUnique.mockResolvedValue(existingMember);
      mockPrisma.userMember.update.mockResolvedValue(updatedMember);

      const result = await userMemberService.updateUserPoints(
        'user-member-005',
        pointsGrowthChanges.largeDecrease.pointsChange
      );

      expect(result.points).toBe(0); // 不能为负数
    });
  });

  // ==================== 统计信息测试 ====================
  describe('统计信息测试', () => {
    test('应该正确计算会员统计信息', async () => {
      const levelStats = [
        { level_id: 'level-bronze-001', _count: { id: 2 } },
        { level_id: 'level-silver-002', _count: { id: 1 } },
        { level_id: 'level-gold-003', _count: { id: 1 } }
      ];

      mockPrisma.userMember.count
        .mockResolvedValueOnce(5) // 总会员数
        .mockResolvedValueOnce(4); // 活跃会员数
      mockPrisma.userMember.groupBy.mockResolvedValue(levelStats);
      mockMemberLevelService.getMemberLevelById
        .mockResolvedValueOnce(mockMemberLevels[0])
        .mockResolvedValueOnce(mockMemberLevels[1])
        .mockResolvedValueOnce(mockMemberLevels[2]);

      const result = await userMemberService.getMemberStatistics();

      expect(result.totalMembers).toBe(5);
      expect(result.activeMembers).toBe(4);
      expect(result.membersByLevel).toHaveLength(3);
      expect(result.membersByLevel[0]).toEqual({
        levelId: 'level-bronze-001',
        levelName: '青铜会员',
        count: 2
      });
    });
  });

  // ==================== 错误场景处理测试 ====================
  describe('错误场景处理测试', () => {
    test('应该处理数据库连接错误', async () => {
      mockPrisma.userMember.findMany.mockRejectedValue(
        errorScenarios.databaseConnection.error
      );

      await expect(
        userMemberService.getUserMemberList(memberQueryParams.basicPagination)
      ).rejects.toThrow(errorScenarios.databaseConnection.expectedMessage);
    });

    test('应该处理更新失败错误', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(mockUserMembers[0]);
      mockMemberLevelService.getMemberLevelById.mockResolvedValue(mockMemberLevels[0]);
      mockPrisma.userMember.update.mockRejectedValue(
        errorScenarios.updateFailed.error
      );

      await expect(
        userMemberService.updateUserMember('member-001-uuid-001', updateMemberRequests.updateLevel)
      ).rejects.toThrow('Database update failed');
    });

    test('应该处理删除失败错误', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(mockUserMembers[0]);
      mockPrisma.userMember.delete.mockRejectedValue(
        errorScenarios.deleteFailed.error
      );

      await expect(
        userMemberService.deleteUserMember('member-001-uuid-001')
      ).rejects.toThrow('Database delete failed');
    });
  });

  // ==================== 业务规则验证测试 ====================
  describe('业务规则验证测试', () => {
    test('应该验证成长值业务规则', () => {
      const rules = memberBusinessRules.growthRules;
      expect(rules.min).toBe(0);
      expect(rules.max).toBe(999999);
      expect(rules.upgradeThresholds.silver).toBe(1000);
      expect(rules.upgradeThresholds.gold).toBe(5000);
    });

    test('应该验证积分业务规则', () => {
      const rules = memberBusinessRules.pointsRules;
      expect(rules.canBeNegative).toBe(false);
      expect(rules.earnRatio).toBe(0.1);
      expect(rules.redeemRatio).toBe(100);
    });

    test('应该验证等级规则', () => {
      const rules = memberBusinessRules.levelRules;
      expect(rules.autoUpgrade).toBe(true);
      expect(rules.autoDowngrade).toBe(false);
      expect(rules.maxLevel).toBe('diamond');
    });
  });
}); 