/**
 * 积分记录服务层
 * 处理积分记录相关的业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { prisma } from '../config/database';
import { 
  IMemberPoint,
  ICreateMemberPointRequest,
  IMemberPointQueryParams,
  IMemberPointListResponse,
  PointChangeType
} from '../types/member';
import { logger } from '../utils/logger';
import { userMemberService } from './user-member-service';

export class MemberPointService {
  /**
   * 获取积分记录分页列表
   * @param params 查询参数
   * @returns 积分记录分页数据
   */
  async getMemberPointList(params: IMemberPointQueryParams): Promise<IMemberPointListResponse> {
    const { 
      page = 1, 
      size = 10, 
      user_member_id, 
      type, 
      change_min, 
      change_max,
      start_date,
      end_date 
    } = params;
    const skip = (page - 1) * size;

    try {
      // 构建查询条件
      const where: any = {};
      
      if (user_member_id) {
        where.user_member_id = user_member_id;
      }
      
      if (type) {
        where.type = type;
      }

      if (change_min !== undefined || change_max !== undefined) {
        where.change = {};
        if (change_min !== undefined) {
          where.change.gte = change_min;
        }
        if (change_max !== undefined) {
          where.change.lte = change_max;
        }
      }

      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) {
          where.created_at.gte = new Date(start_date);
        }
        if (end_date) {
          where.created_at.lte = new Date(end_date);
        }
      }

      // 查询总数
      const total = await prisma.memberPoint.count({ where });

      // 查询数据
      const list = await prisma.memberPoint.findMany({
        where,
        skip,
        take: size,
        include: {
          user_member: {
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
          }
        },
        orderBy: [
          { created_at: 'desc' }
        ]
      });

      const pages = Math.ceil(total / size);

      logger.info(`获取积分记录列表成功，查询到 ${list.length} 条记录`);

      return {
        list: list as IMemberPoint[],
        total,
        page,
        size,
        pages
      };
    } catch (error) {
      logger.error('获取积分记录列表失败', error);
      throw new Error('获取积分记录列表失败');
    }
  }

  /**
   * 根据ID获取积分记录详情
   * @param id 积分记录ID
   * @returns 积分记录详情
   */
  async getMemberPointById(id: string): Promise<IMemberPoint | null> {
    try {
      const memberPoint = await prisma.memberPoint.findUnique({
        where: { id },
        include: {
          user_member: {
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
          }
        }
      });

      if (memberPoint) {
        logger.info(`获取积分记录详情成功，ID: ${id}`);
      }

      return memberPoint as IMemberPoint | null;
    } catch (error) {
      logger.error(`获取积分记录详情失败，ID: ${id}`, error);
      throw new Error('获取积分记录详情失败');
    }
  }

  /**
   * 创建积分记录
   * @param data 创建数据
   * @returns 创建的积分记录
   */
  async createMemberPoint(data: ICreateMemberPointRequest): Promise<IMemberPoint> {
    try {
      // 检查用户会员是否存在
      const userMember = await userMemberService.getUserMemberById(data.user_member_id);
      if (!userMember) {
        throw new Error('用户会员不存在');
      }

      // 验证积分变化类型
      if (!Object.values(PointChangeType).includes(data.type as PointChangeType)) {
        throw new Error('积分变化类型无效');
      }

      // 在事务中创建积分记录并更新用户积分
      const result = await prisma.$transaction(async (prisma) => {
        // 创建积分记录
        const memberPoint = await prisma.memberPoint.create({
          data: {
            user_member_id: data.user_member_id,
            change: data.change,
            type: data.type,
            remark: data.remark
          },
          include: {
            user_member: {
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
            }
          }
        });

        // 更新用户积分
        const newPoints = Math.max(0, userMember.points + data.change);
        await prisma.userMember.update({
          where: { id: data.user_member_id },
          data: { points: newPoints }
        });

        return memberPoint;
      });

      logger.info(`创建积分记录成功，ID: ${result.id}, 用户会员ID: ${result.user_member_id}, 变化: ${result.change}`);

      return result as IMemberPoint;
    } catch (error) {
      logger.error('创建积分记录失败', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('创建积分记录失败');
    }
  }

  /**
   * 批量创建积分记录
   * @param records 积分记录数组
   * @returns 创建的积分记录数组
   */
  async createMemberPointBatch(records: ICreateMemberPointRequest[]): Promise<IMemberPoint[]> {
    try {
      const results = await prisma.$transaction(async (prisma) => {
        const createdRecords: IMemberPoint[] = [];

        for (const record of records) {
          // 检查用户会员是否存在
          const userMember = await userMemberService.getUserMemberById(record.user_member_id);
          if (!userMember) {
            throw new Error(`用户会员不存在: ${record.user_member_id}`);
          }

          // 创建积分记录
          const memberPoint = await prisma.memberPoint.create({
            data: {
              user_member_id: record.user_member_id,
              change: record.change,
              type: record.type,
              remark: record.remark
            },
            include: {
              user_member: {
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
              }
            }
          });

          // 更新用户积分
          const newPoints = Math.max(0, userMember.points + record.change);
          await prisma.userMember.update({
            where: { id: record.user_member_id },
            data: { points: newPoints }
          });

          createdRecords.push(memberPoint as IMemberPoint);
        }

        return createdRecords;
      });

      logger.info(`批量创建积分记录成功，共创建 ${results.length} 条记录`);

      return results;
    } catch (error) {
      logger.error('批量创建积分记录失败', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('批量创建积分记录失败');
    }
  }

  /**
   * 获取用户积分统计
   * @param userMemberId 用户会员ID
   * @returns 积分统计信息
   */
  async getUserPointStatistics(userMemberId: string): Promise<{
    totalEarned: number;
    totalConsumed: number;
    totalAdjusted: number;
    currentBalance: number;
    recentRecords: IMemberPoint[];
  }> {
    try {
      // 获取用户会员信息
      const userMember = await userMemberService.getUserMemberById(userMemberId);
      if (!userMember) {
        throw new Error('用户会员不存在');
      }

      // 统计各类型积分变化
      const earnedResult = await prisma.memberPoint.aggregate({
        where: {
          user_member_id: userMemberId,
          type: PointChangeType.EARN,
        },
        _sum: {
          change: true
        }
      });

      const consumedResult = await prisma.memberPoint.aggregate({
        where: {
          user_member_id: userMemberId,
          type: PointChangeType.CONSUME,
        },
        _sum: {
          change: true
        }
      });

      const adjustedResult = await prisma.memberPoint.aggregate({
        where: {
          user_member_id: userMemberId,
          type: PointChangeType.ADJUST,
        },
        _sum: {
          change: true
        }
      });

      // 获取最近的积分记录
      const recentRecords = await prisma.memberPoint.findMany({
        where: { user_member_id: userMemberId },
        include: {
          user_member: {
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
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10
      });

      const totalEarned = Math.abs(earnedResult._sum.change || 0);
      const totalConsumed = Math.abs(consumedResult._sum.change || 0);
      const totalAdjusted = adjustedResult._sum.change || 0;

      return {
        totalEarned,
        totalConsumed,
        totalAdjusted,
        currentBalance: userMember.points,
        recentRecords: recentRecords as IMemberPoint[]
      };
    } catch (error) {
      logger.error(`获取用户积分统计失败，用户会员ID: ${userMemberId}`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取用户积分统计失败');
    }
  }

  /**
   * 获取积分变化趋势
   * @param days 天数
   * @returns 积分变化趋势数据
   */
  async getPointChangeTrend(days: number = 30): Promise<Array<{
    date: string;
    totalEarned: number;
    totalConsumed: number;
    netChange: number;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const records = await prisma.memberPoint.findMany({
        where: {
          created_at: {
            gte: startDate
          }
        },
        select: {
          change: true,
          type: true,
          created_at: true
        },
        orderBy: {
          created_at: 'asc'
        }
      });

      // 按日期分组统计
      const trendMap = new Map<string, { earned: number; consumed: number }>();

      records.forEach(record => {
        const date = record.created_at.toISOString().split('T')[0];
        if (!trendMap.has(date)) {
          trendMap.set(date, { earned: 0, consumed: 0 });
        }

        const trend = trendMap.get(date)!;
        if (record.type === PointChangeType.EARN) {
          trend.earned += record.change;
        } else if (record.type === PointChangeType.CONSUME) {
          trend.consumed += Math.abs(record.change);
        }
      });

      // 转换为数组格式
      const result = Array.from(trendMap.entries()).map(([date, data]) => ({
        date,
        totalEarned: data.earned,
        totalConsumed: data.consumed,
        netChange: data.earned - data.consumed
      }));

      logger.info(`获取积分变化趋势成功，时间范围: ${days} 天`);

      return result;
    } catch (error) {
      logger.error('获取积分变化趋势失败', error);
      throw new Error('获取积分变化趋势失败');
    }
  }
}

export const memberPointService = new MemberPointService(); 