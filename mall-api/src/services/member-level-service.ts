/**
 * 会员等级服务层
 * 处理会员等级相关的业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { prisma } from '../config/database';
import { 
  IMemberLevel,
  ICreateMemberLevelRequest,
  IUpdateMemberLevelRequest,
  IMemberLevelQueryParams,
  IMemberLevelListResponse,
  MemberStatus
} from '../types/member';
import { logger } from '../utils/logger';

export class MemberLevelService {
  /**
   * 获取会员等级分页列表
   * @param params 查询参数
   * @returns 会员等级分页数据
   */
  async getMemberLevelList(params: IMemberLevelQueryParams): Promise<IMemberLevelListResponse> {
    const { page = 1, size = 10, name, status } = params;
    const skip = (page - 1) * size;

    try {
      // 构建查询条件
      const where: any = {};
      
      if (name) {
        where.name = {
          contains: name
        };
      }
      
      if (status !== undefined) {
        where.status = status;
      }

      // 查询总数
      const total = await prisma.memberLevel.count({ where });

      // 查询数据
      const list = await prisma.memberLevel.findMany({
        where,
        skip,
        take: size,
        orderBy: [
          { growth_min: 'asc' },
          { created_at: 'desc' }
        ]
      });

      const pages = Math.ceil(total / size);

      logger.info(`获取会员等级列表成功，查询到 ${list.length} 条记录`);

      return {
        list: list as IMemberLevel[],
        total,
        page,
        size,
        pages
      };
    } catch (error) {
      logger.error('获取会员等级列表失败', error);
      throw new Error('获取会员等级列表失败');
    }
  }

  /**
   * 根据ID获取会员等级详情
   * @param id 会员等级ID
   * @returns 会员等级详情
   */
  async getMemberLevelById(id: string): Promise<IMemberLevel | null> {
    try {
      const memberLevel = await prisma.memberLevel.findUnique({
        where: { id }
      });

      if (memberLevel) {
        logger.info(`获取会员等级详情成功，ID: ${id}`);
      }

      return memberLevel as IMemberLevel | null;
    } catch (error) {
      logger.error(`获取会员等级详情失败，ID: ${id}`, error);
      throw new Error('获取会员等级详情失败');
    }
  }

  /**
   * 创建会员等级
   * @param data 创建数据
   * @returns 创建的会员等级
   */
  async createMemberLevel(data: ICreateMemberLevelRequest): Promise<IMemberLevel> {
    try {
      // 检查名称是否已存在
      const existingLevel = await prisma.memberLevel.findFirst({
        where: { name: data.name }
      });

      if (existingLevel) {
        throw new Error('会员等级名称已存在');
      }

      // 检查成长值范围是否冲突
      const conflictLevel = await prisma.memberLevel.findFirst({
        where: {
          OR: [
            {
              AND: [
                { growth_min: { lte: data.growth_min } },
                { growth_max: { gte: data.growth_min } }
              ]
            },
            {
              AND: [
                { growth_min: { lte: data.growth_max } },
                { growth_max: { gte: data.growth_max } }
              ]
            },
            {
              AND: [
                { growth_min: { gte: data.growth_min } },
                { growth_max: { lte: data.growth_max } }
              ]
            }
          ]
        }
      });

      if (conflictLevel) {
        throw new Error('成长值范围与现有等级冲突');
      }

      // 验证成长值范围
      if (data.growth_min >= data.growth_max) {
        throw new Error('成长值下限必须小于上限');
      }

      const memberLevel = await prisma.memberLevel.create({
        data: {
          name: data.name,
          description: data.description,
          growth_min: data.growth_min,
          growth_max: data.growth_max,
          privileges: data.privileges,
          status: data.status ?? MemberStatus.ENABLED
        }
      });

      logger.info(`创建会员等级成功，ID: ${memberLevel.id}, 名称: ${memberLevel.name}`);

      return memberLevel as IMemberLevel;
    } catch (error) {
      logger.error('创建会员等级失败', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('创建会员等级失败');
    }
  }

  /**
   * 更新会员等级
   * @param id 会员等级ID
   * @param data 更新数据
   * @returns 更新后的会员等级
   */
  async updateMemberLevel(id: string, data: IUpdateMemberLevelRequest): Promise<IMemberLevel> {
    try {
      // 检查等级是否存在
      const existingLevel = await prisma.memberLevel.findUnique({
        where: { id }
      });

      if (!existingLevel) {
        throw new Error('会员等级不存在');
      }

      // 如果更新名称，检查是否重复
      if (data.name && data.name !== existingLevel.name) {
        const duplicateLevel = await prisma.memberLevel.findFirst({
          where: { 
            name: data.name,
            id: { not: id }
          }
        });

        if (duplicateLevel) {
          throw new Error('会员等级名称已存在');
        }
      }

      // 如果更新成长值范围，检查是否冲突
      if (data.growth_min !== undefined || data.growth_max !== undefined) {
        const newGrowthMin = data.growth_min ?? existingLevel.growth_min;
        const newGrowthMax = data.growth_max ?? existingLevel.growth_max;

        if (newGrowthMin >= newGrowthMax) {
          throw new Error('成长值下限必须小于上限');
        }

        const conflictLevel = await prisma.memberLevel.findFirst({
          where: {
            id: { not: id },
            OR: [
              {
                AND: [
                  { growth_min: { lte: newGrowthMin } },
                  { growth_max: { gte: newGrowthMin } }
                ]
              },
              {
                AND: [
                  { growth_min: { lte: newGrowthMax } },
                  { growth_max: { gte: newGrowthMax } }
                ]
              },
              {
                AND: [
                  { growth_min: { gte: newGrowthMin } },
                  { growth_max: { lte: newGrowthMax } }
                ]
              }
            ]
          }
        });

        if (conflictLevel) {
          throw new Error('成长值范围与现有等级冲突');
        }
      }

      const memberLevel = await prisma.memberLevel.update({
        where: { id },
        data
      });

      logger.info(`更新会员等级成功，ID: ${id}`);

      return memberLevel as IMemberLevel;
    } catch (error) {
      logger.error(`更新会员等级失败，ID: ${id}`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('更新会员等级失败');
    }
  }

  /**
   * 删除会员等级
   * @param id 会员等级ID
   */
  async deleteMemberLevel(id: string): Promise<void> {
    try {
      // 检查等级是否存在
      const existingLevel = await prisma.memberLevel.findUnique({
        where: { id }
      });

      if (!existingLevel) {
        throw new Error('会员等级不存在');
      }

      // 检查是否有用户使用该等级
      const userCount = await prisma.userMember.count({
        where: { level_id: id }
      });

      if (userCount > 0) {
        throw new Error('该等级下还有用户，无法删除');
      }

      await prisma.memberLevel.delete({
        where: { id }
      });

      logger.info(`删除会员等级成功，ID: ${id}`);
    } catch (error) {
      logger.error(`删除会员等级失败，ID: ${id}`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('删除会员等级失败');
    }
  }

  /**
   * 根据成长值获取会员等级
   * @param growth 成长值
   * @returns 会员等级
   */
  async getMemberLevelByGrowth(growth: number): Promise<IMemberLevel | null> {
    try {
      const memberLevel = await prisma.memberLevel.findFirst({
        where: {
          growth_min: { lte: growth },
          growth_max: { gte: growth },
          status: MemberStatus.ENABLED
        },
        orderBy: { growth_min: 'desc' }
      });

      return memberLevel as IMemberLevel | null;
    } catch (error) {
      logger.error(`根据成长值获取会员等级失败，成长值: ${growth}`, error);
      throw new Error('根据成长值获取会员等级失败');
    }
  }

  /**
   * 获取所有启用的会员等级
   * @returns 启用的会员等级列表
   */
  async getEnabledMemberLevels(): Promise<IMemberLevel[]> {
    try {
      const levels = await prisma.memberLevel.findMany({
        where: { status: MemberStatus.ENABLED },
        orderBy: { growth_min: 'asc' }
      });

      return levels as IMemberLevel[];
    } catch (error) {
      logger.error('获取启用的会员等级失败', error);
      throw new Error('获取启用的会员等级失败');
    }
  }
}

export const memberLevelService = new MemberLevelService(); 