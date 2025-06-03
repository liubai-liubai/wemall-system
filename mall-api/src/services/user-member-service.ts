/**
 * 用户会员服务层
 * 处理用户会员相关的业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { prisma } from '../config/database.js';
import { 
  IUserMember,
  ICreateUserMemberRequest,
  IUpdateUserMemberRequest,
  IUserMemberQueryParams,
  IUserMemberListResponse,
  MemberStatus
} from '../types/member.js';
import { logger } from '../utils/logger.js';
import { memberLevelService } from './member-level-service.js';

export class UserMemberService {
  /**
   * 获取用户会员分页列表
   * @param params 查询参数
   * @returns 用户会员分页数据
   */
  async getUserMemberList(params: IUserMemberQueryParams): Promise<IUserMemberListResponse> {
    const { 
      page = 1, 
      size = 10, 
      user_id, 
      level_id, 
      status, 
      growth_min, 
      growth_max,
      points_min,
      points_max 
    } = params;
    const skip = (page - 1) * size;

    try {
      // 构建查询条件
      const where: any = {};
      
      if (user_id) {
        where.user_id = user_id;
      }
      
      if (level_id) {
        where.level_id = level_id;
      }
      
      if (status !== undefined) {
        where.status = status;
      }

      if (growth_min !== undefined || growth_max !== undefined) {
        where.growth = {};
        if (growth_min !== undefined) {
          where.growth.gte = growth_min;
        }
        if (growth_max !== undefined) {
          where.growth.lte = growth_max;
        }
      }

      if (points_min !== undefined || points_max !== undefined) {
        where.points = {};
        if (points_min !== undefined) {
          where.points.gte = points_min;
        }
        if (points_max !== undefined) {
          where.points.lte = points_max;
        }
      }

      // 查询总数
      const total = await prisma.userMember.count({ where });

      // 查询数据
      const list = await prisma.userMember.findMany({
        where,
        skip,
        take: size,
        include: {
          level: true,
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              phone: true
            }
          }
        },
        orderBy: [
          { growth: 'desc' },
          { created_at: 'desc' }
        ]
      });

      const pages = Math.ceil(total / size);

      logger.info(`获取用户会员列表成功，查询到 ${list.length} 条记录`);

      return {
        list: list as IUserMember[],
        total,
        page,
        size,
        pages
      };
    } catch (error) {
      logger.error('获取用户会员列表失败', error);
      throw new Error('获取用户会员列表失败');
    }
  }

  /**
   * 根据ID获取用户会员详情
   * @param id 用户会员ID
   * @returns 用户会员详情
   */
  async getUserMemberById(id: string): Promise<IUserMember | null> {
    try {
      const userMember = await prisma.userMember.findUnique({
        where: { id },
        include: {
          level: true,
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              phone: true,
              email: true,
              gender: true,
              birthday: true,
              created_at: true
            }
          }
        }
      });

      if (userMember) {
        logger.info(`获取用户会员详情成功，ID: ${id}`);
      }

      return userMember as IUserMember | null;
    } catch (error) {
      logger.error(`获取用户会员详情失败，ID: ${id}`, error);
      throw new Error('获取用户会员详情失败');
    }
  }

  /**
   * 根据用户ID获取会员信息
   * @param userId 用户ID
   * @returns 用户会员信息
   */
  async getUserMemberByUserId(userId: string): Promise<IUserMember | null> {
    try {
      const userMember = await prisma.userMember.findUnique({
        where: { user_id: userId },
        include: {
          level: true,
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              phone: true
            }
          }
        }
      });

      return userMember as IUserMember | null;
    } catch (error) {
      logger.error(`根据用户ID获取会员信息失败，用户ID: ${userId}`, error);
      throw new Error('根据用户ID获取会员信息失败');
    }
  }

  /**
   * 创建用户会员
   * @param data 创建数据
   * @returns 创建的用户会员
   */
  async createUserMember(data: ICreateUserMemberRequest): Promise<IUserMember> {
    try {
      // 检查用户是否已存在会员信息
      const existingMember = await prisma.userMember.findUnique({
        where: { user_id: data.user_id }
      });

      if (existingMember) {
        throw new Error('该用户已有会员信息');
      }

      // 检查用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: data.user_id }
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      // 检查等级是否存在
      const level = await memberLevelService.getMemberLevelById(data.level_id);
      if (!level) {
        throw new Error('会员等级不存在');
      }

      // 如果有邀请人，检查邀请人是否存在
      if (data.inviter_id) {
        const inviter = await this.getUserMemberByUserId(data.inviter_id);
        if (!inviter) {
          throw new Error('邀请人不存在');
        }
      }

      const userMember = await prisma.userMember.create({
        data: {
          user_id: data.user_id,
          level_id: data.level_id,
          growth: data.growth ?? 0,
          points: data.points ?? 0,
          inviter_id: data.inviter_id,
          status: data.status ?? MemberStatus.ENABLED
        },
        include: {
          level: true,
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              phone: true
            }
          }
        }
      });

      logger.info(`创建用户会员成功，ID: ${userMember.id}, 用户ID: ${userMember.user_id}`);

      return userMember as IUserMember;
    } catch (error) {
      logger.error('创建用户会员失败', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('创建用户会员失败');
    }
  }

  /**
   * 更新用户会员
   * @param id 用户会员ID
   * @param data 更新数据
   * @returns 更新后的用户会员
   */
  async updateUserMember(id: string, data: IUpdateUserMemberRequest): Promise<IUserMember> {
    try {
      // 检查会员是否存在
      const existingMember = await prisma.userMember.findUnique({
        where: { id }
      });

      if (!existingMember) {
        throw new Error('用户会员不存在');
      }

      // 如果更新等级，检查等级是否存在
      if (data.level_id) {
        const level = await memberLevelService.getMemberLevelById(data.level_id);
        if (!level) {
          throw new Error('会员等级不存在');
        }
      }

      // 如果更新邀请人，检查邀请人是否存在
      if (data.inviter_id) {
        const inviter = await this.getUserMemberByUserId(data.inviter_id);
        if (!inviter) {
          throw new Error('邀请人不存在');
        }
      }

      const userMember = await prisma.userMember.update({
        where: { id },
        data,
        include: {
          level: true,
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              phone: true
            }
          }
        }
      });

      logger.info(`更新用户会员成功，ID: ${id}`);

      return userMember as IUserMember;
    } catch (error) {
      logger.error(`更新用户会员失败，ID: ${id}`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('更新用户会员失败');
    }
  }

  /**
   * 删除用户会员
   * @param id 用户会员ID
   */
  async deleteUserMember(id: string): Promise<void> {
    try {
      // 检查会员是否存在
      const existingMember = await prisma.userMember.findUnique({
        where: { id }
      });

      if (!existingMember) {
        throw new Error('用户会员不存在');
      }

      await prisma.userMember.delete({
        where: { id }
      });

      logger.info(`删除用户会员成功，ID: ${id}`);
    } catch (error) {
      logger.error(`删除用户会员失败，ID: ${id}`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('删除用户会员失败');
    }
  }

  /**
   * 更新用户成长值
   * @param userId 用户ID
   * @param growthChange 成长值变化
   * @returns 更新后的用户会员信息
   */
  async updateUserGrowth(userId: string, growthChange: number): Promise<IUserMember> {
    try {
      const userMember = await this.getUserMemberByUserId(userId);
      if (!userMember) {
        throw new Error('用户会员信息不存在');
      }

      const newGrowth = userMember.growth + growthChange;
      
      // 根据新的成长值自动升级等级
      const newLevel = await memberLevelService.getMemberLevelByGrowth(newGrowth);
      
      const updateData: IUpdateUserMemberRequest = {
        growth: newGrowth
      };

      // 如果找到新等级且与当前等级不同，则升级
      if (newLevel && newLevel.id !== userMember.level_id) {
        updateData.level_id = newLevel.id;
        logger.info(`用户 ${userId} 等级升级：${userMember.level?.name} -> ${newLevel.name}`);
      }

      const updatedMember = await this.updateUserMember(userMember.id, updateData);

      logger.info(`更新用户成长值成功，用户ID: ${userId}, 变化: ${growthChange}, 新成长值: ${newGrowth}`);

      return updatedMember;
    } catch (error) {
      logger.error(`更新用户成长值失败，用户ID: ${userId}`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('更新用户成长值失败');
    }
  }

  /**
   * 更新用户积分
   * @param userId 用户ID
   * @param pointsChange 积分变化
   * @returns 更新后的用户会员信息
   */
  async updateUserPoints(userId: string, pointsChange: number): Promise<IUserMember> {
    try {
      const userMember = await this.getUserMemberByUserId(userId);
      if (!userMember) {
        throw new Error('用户会员信息不存在');
      }

      const newPoints = Math.max(0, userMember.points + pointsChange); // 积分不能为负

      const updatedMember = await this.updateUserMember(userMember.id, {
        points: newPoints
      });

      logger.info(`更新用户积分成功，用户ID: ${userId}, 变化: ${pointsChange}, 新积分: ${newPoints}`);

      return updatedMember;
    } catch (error) {
      logger.error(`更新用户积分失败，用户ID: ${userId}`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('更新用户积分失败');
    }
  }

  /**
   * 获取会员统计信息
   * @returns 会员统计数据
   */
  async getMemberStatistics(): Promise<{
    totalMembers: number;
    activeMembers: number;
    membersByLevel: Array<{
      levelId: string;
      levelName: string;
      count: number;
    }>;
  }> {
    try {
      // 总会员数
      const totalMembers = await prisma.userMember.count();

      // 活跃会员数（状态为启用）
      const activeMembers = await prisma.userMember.count({
        where: { status: MemberStatus.ENABLED }
      });

      // 按等级统计会员数
      const membersByLevel = await prisma.userMember.groupBy({
        by: ['level_id'],
        _count: {
          id: true
        },
        where: { status: MemberStatus.ENABLED }
      });

      // 获取等级详情
      const levelDetails = await Promise.all(
        membersByLevel.map(async (item) => {
          const level = await memberLevelService.getMemberLevelById(item.level_id);
          return {
            levelId: item.level_id,
            levelName: level?.name || '未知等级',
            count: item._count.id
          };
        })
      );

      return {
        totalMembers,
        activeMembers,
        membersByLevel: levelDetails
      };
    } catch (error) {
      logger.error('获取会员统计信息失败', error);
      throw new Error('获取会员统计信息失败');
    }
  }
}

export const userMemberService = new UserMemberService(); 