/**
 * 用户会员信息控制器
 * 处理用户会员信息相关的HTTP请求
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { userMemberService } from '../services/user-member-service';
import { success, error } from '../utils/response';
import { 
  IUserMemberQueryParams,
  ICreateUserMemberRequest,
  IUpdateUserMemberRequest
} from '../types/member';

export class UserMemberController {
  /**
   * @swagger
   * /api/v1/member/users:
   *   get:
   *     tags:
   *       - 用户会员管理
   *     summary: 获取用户会员分页列表
   *     description: 根据查询条件获取用户会员分页列表
   *     parameters:
   *       - name: page
   *         in: query
   *         description: 页码
   *         schema:
   *           type: integer
   *           default: 1
   *       - name: size
   *         in: query
   *         description: 每页数量
   *         schema:
   *           type: integer
   *           default: 10
   *       - name: user_id
   *         in: query
   *         description: 用户ID
   *         schema:
   *           type: string
   *       - name: level_id
   *         in: query
   *         description: 会员等级ID
   *         schema:
   *           type: string
   *       - name: status
   *         in: query
   *         description: 状态（0-禁用，1-启用）
   *         schema:
   *           type: integer
   *           enum: [0, 1]
   *       - name: growth_min
   *         in: query
   *         description: 成长值下限
   *         schema:
   *           type: integer
   *       - name: growth_max
   *         in: query
   *         description: 成长值上限
   *         schema:
   *           type: integer
   *       - name: points_min
   *         in: query
   *         description: 积分下限
   *         schema:
   *           type: integer
   *       - name: points_max
   *         in: query
   *         description: 积分上限
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: 成功
   *                 data:
   *                   type: object
   *                   properties:
   *                     list:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             description: 会员ID
   *                           user_id:
   *                             type: string
   *                             description: 用户ID
   *                           level_id:
   *                             type: string
   *                             description: 等级ID
   *                           growth:
   *                             type: integer
   *                             description: 成长值
   *                           points:
   *                             type: integer
   *                             description: 积分
   *                           inviter_id:
   *                             type: string
   *                             description: 邀请人ID
   *                           status:
   *                             type: integer
   *                             description: 状态
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *                           updated_at:
   *                             type: string
   *                             format: date-time
   *                           level:
   *                             type: object
   *                             description: 等级信息
   *                           user:
   *                             type: object
   *                             description: 用户信息
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     size:
   *                       type: integer
   *                     pages:
   *                       type: integer
   */
  async getUserMemberList(ctx: Context): Promise<void> {
    try {
      const params: IUserMemberQueryParams = {
        page: Number(ctx.query.page) || 1,
        size: Number(ctx.query.size) || 10,
        user_id: ctx.query.user_id as string,
        level_id: ctx.query.level_id as string,
        status: ctx.query.status ? Number(ctx.query.status) : undefined,
        growth_min: ctx.query.growth_min ? Number(ctx.query.growth_min) : undefined,
        growth_max: ctx.query.growth_max ? Number(ctx.query.growth_max) : undefined,
        points_min: ctx.query.points_min ? Number(ctx.query.points_min) : undefined,
        points_max: ctx.query.points_max ? Number(ctx.query.points_max) : undefined,
      };

      const result = await userMemberService.getUserMemberList(params);
      ctx.body = success(result, '获取用户会员列表成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户会员列表失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/users/{id}:
   *   get:
   *     tags:
   *       - 用户会员管理
   *     summary: 获取用户会员详情
   *     description: 根据ID获取用户会员详细信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 会员ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: 成功
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     user_id:
   *                       type: string
   *                     level_id:
   *                       type: string
   *                     growth:
   *                       type: integer
   *                     points:
   *                       type: integer
   *                     inviter_id:
   *                       type: string
   *                     status:
   *                       type: integer
   *                     created_at:
   *                       type: string
   *                       format: date-time
   *                     updated_at:
   *                       type: string
   *                       format: date-time
   *                     level:
   *                       type: object
   *                     user:
   *                       type: object
   *       404:
   *         description: 会员不存在
   */
  async getUserMemberById(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const userMember = await userMemberService.getUserMemberById(id);
      
      if (!userMember) {
        ctx.body = error('用户会员不存在', 404);
        return;
      }
      
      ctx.body = success(userMember, '获取用户会员详情成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户会员详情失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/users/by-user/{userId}:
   *   get:
   *     tags:
   *       - 用户会员管理
   *     summary: 根据用户ID获取会员信息
   *     description: 根据用户ID获取用户的会员信息
   *     parameters:
   *       - name: userId
   *         in: path
   *         required: true
   *         description: 用户ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: 成功
   *                 data:
   *                   type: object
   *                   nullable: true
   *       404:
   *         description: 会员信息不存在
   */
  async getUserMemberByUserId(ctx: Context): Promise<void> {
    try {
      const { userId } = ctx.params;
      const userMember = await userMemberService.getUserMemberByUserId(userId);
      
      if (!userMember) {
        ctx.body = error('用户会员信息不存在', 404);
        return;
      }
      
      ctx.body = success(userMember, '获取用户会员信息成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户会员信息失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/users:
   *   post:
   *     tags:
   *       - 用户会员管理
   *     summary: 创建用户会员
   *     description: 为用户创建会员信息
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - user_id
   *               - level_id
   *             properties:
   *               user_id:
   *                 type: string
   *                 description: 用户ID
   *               level_id:
   *                 type: string
   *                 description: 会员等级ID
   *               growth:
   *                 type: integer
   *                 description: 初始成长值
   *                 default: 0
   *               points:
   *                 type: integer
   *                 description: 初始积分
   *                 default: 0
   *               inviter_id:
   *                 type: string
   *                 description: 邀请人用户ID
   *               status:
   *                 type: integer
   *                 description: 状态（0-禁用，1-启用）
   *                 enum: [0, 1]
   *                 default: 1
   *     responses:
   *       200:
   *         description: 创建成功
   *       400:
   *         description: 参数错误
   */
  async createUserMember(ctx: Context): Promise<void> {
    try {
      const data: ICreateUserMemberRequest = ctx.request.body as ICreateUserMemberRequest;
      
      // 基础参数验证
      if (!data.user_id || !data.user_id.trim()) {
        ctx.body = error('用户ID不能为空', 400);
        return;
      }
      
      if (!data.level_id || !data.level_id.trim()) {
        ctx.body = error('会员等级ID不能为空', 400);
        return;
      }
      
      if (data.growth !== undefined && data.growth < 0) {
        ctx.body = error('成长值不能为负数', 400);
        return;
      }
      
      if (data.points !== undefined && data.points < 0) {
        ctx.body = error('积分不能为负数', 400);
        return;
      }
      
      const userMember = await userMemberService.createUserMember(data);
      ctx.body = success(userMember, '创建用户会员成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建用户会员失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/users/{id}:
   *   put:
   *     tags:
   *       - 用户会员管理
   *     summary: 更新用户会员信息
   *     description: 更新用户会员信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 会员ID
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               level_id:
   *                 type: string
   *                 description: 会员等级ID
   *               growth:
   *                 type: integer
   *                 description: 成长值
   *               points:
   *                 type: integer
   *                 description: 积分
   *               inviter_id:
   *                 type: string
   *                 description: 邀请人用户ID
   *               status:
   *                 type: integer
   *                 description: 状态（0-禁用，1-启用）
   *                 enum: [0, 1]
   *     responses:
   *       200:
   *         description: 更新成功
   *       400:
   *         description: 参数错误
   *       404:
   *         description: 会员不存在
   */
  async updateUserMember(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const data: IUpdateUserMemberRequest = ctx.request.body as IUpdateUserMemberRequest;
      
      // 参数验证
      if (data.growth !== undefined && data.growth < 0) {
        ctx.body = error('成长值不能为负数', 400);
        return;
      }
      
      if (data.points !== undefined && data.points < 0) {
        ctx.body = error('积分不能为负数', 400);
        return;
      }
      
      const userMember = await userMemberService.updateUserMember(id, data);
      ctx.body = success(userMember, '更新用户会员成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新用户会员失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/users/{id}:
   *   delete:
   *     tags:
   *       - 用户会员管理
   *     summary: 删除用户会员
   *     description: 删除指定的用户会员信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 会员ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 删除成功
   *       404:
   *         description: 会员不存在
   */
  async deleteUserMember(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      await userMemberService.deleteUserMember(id);
      ctx.body = success(null, '删除用户会员成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除用户会员失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/users/{userId}/growth:
   *   patch:
   *     tags:
   *       - 用户会员管理
   *     summary: 更新用户成长值
   *     description: 更新用户的成长值，可能触发等级升级
   *     parameters:
   *       - name: userId
   *         in: path
   *         required: true
   *         description: 用户ID
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - growth_change
   *             properties:
   *               growth_change:
   *                 type: integer
   *                 description: 成长值变化（正数为增加，负数为减少）
   *                 example: 100
   *     responses:
   *       200:
   *         description: 更新成功
   *       400:
   *         description: 参数错误
   *       404:
   *         description: 用户会员信息不存在
   */
  async updateUserGrowth(ctx: Context): Promise<void> {
    try {
      const { userId } = ctx.params;
      const { growth_change } = ctx.request.body as { growth_change: number };
      
      if (growth_change === undefined || typeof growth_change !== 'number') {
        ctx.body = error('成长值变化不能为空且必须为数字', 400);
        return;
      }
      
      const userMember = await userMemberService.updateUserGrowth(userId, growth_change);
      ctx.body = success(userMember, '更新用户成长值成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新用户成长值失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/users/{userId}/points:
   *   patch:
   *     tags:
   *       - 用户会员管理
   *     summary: 更新用户积分
   *     description: 更新用户的积分
   *     parameters:
   *       - name: userId
   *         in: path
   *         required: true
   *         description: 用户ID
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - points_change
   *             properties:
   *               points_change:
   *                 type: integer
   *                 description: 积分变化（正数为增加，负数为减少）
   *                 example: 50
   *     responses:
   *       200:
   *         description: 更新成功
   *       400:
   *         description: 参数错误
   *       404:
   *         description: 用户会员信息不存在
   */
  async updateUserPoints(ctx: Context): Promise<void> {
    try {
      const { userId } = ctx.params;
      const { points_change } = ctx.request.body as { points_change: number };
      
      if (points_change === undefined || typeof points_change !== 'number') {
        ctx.body = error('积分变化不能为空且必须为数字', 400);
        return;
      }
      
      const userMember = await userMemberService.updateUserPoints(userId, points_change);
      ctx.body = success(userMember, '更新用户积分成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新用户积分失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/users/statistics:
   *   get:
   *     tags:
   *       - 用户会员管理
   *     summary: 获取会员统计信息
   *     description: 获取会员相关的统计数据
   *     responses:
   *       200:
   *         description: 成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: 成功
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalMembers:
   *                       type: integer
   *                       description: 总会员数
   *                     activeMembers:
   *                       type: integer
   *                       description: 活跃会员数
   *                     membersByLevel:
   *                       type: array
   *                       description: 按等级统计的会员数
   *                       items:
   *                         type: object
   *                         properties:
   *                           levelId:
   *                             type: string
   *                           levelName:
   *                             type: string
   *                           count:
   *                             type: integer
   */
  async getMemberStatistics(ctx: Context): Promise<void> {
    try {
      const statistics = await userMemberService.getMemberStatistics();
      ctx.body = success(statistics, '获取会员统计信息成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取会员统计信息失败';
      ctx.body = error(errorMessage);
    }
  }
}

export const userMemberController = new UserMemberController(); 