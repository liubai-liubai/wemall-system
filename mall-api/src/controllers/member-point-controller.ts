/**
 * 积分记录控制器
 * 处理积分记录相关的HTTP请求
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { memberPointService } from '../services/member-point-service';
import { success, error } from '../utils/response';
import { 
  IMemberPointQueryParams,
  ICreateMemberPointRequest,
  PointChangeType
} from '../types/member';

export class MemberPointController {
  /**
   * @swagger
   * /api/v1/member/points:
   *   get:
   *     tags:
   *       - 积分记录管理
   *     summary: 获取积分记录分页列表
   *     description: 根据查询条件获取积分记录分页列表
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
   *       - name: user_member_id
   *         in: query
   *         description: 用户会员ID
   *         schema:
   *           type: string
   *       - name: type
   *         in: query
   *         description: 变化类型
   *         schema:
   *           type: string
   *           enum: [earn, consume, adjust, expire, refund]
   *       - name: change_min
   *         in: query
   *         description: 积分变化下限
   *         schema:
   *           type: integer
   *       - name: change_max
   *         in: query
   *         description: 积分变化上限
   *         schema:
   *           type: integer
   *       - name: start_date
   *         in: query
   *         description: 开始日期 (YYYY-MM-DD)
   *         schema:
   *           type: string
   *           format: date
   *       - name: end_date
   *         in: query
   *         description: 结束日期 (YYYY-MM-DD)
   *         schema:
   *           type: string
   *           format: date
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
   *                             description: 记录ID
   *                           user_member_id:
   *                             type: string
   *                             description: 用户会员ID
   *                           change:
   *                             type: integer
   *                             description: 积分变化
   *                           type:
   *                             type: string
   *                             description: 变化类型
   *                           remark:
   *                             type: string
   *                             description: 备注
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *                           user_member:
   *                             type: object
   *                             description: 用户会员信息
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     size:
   *                       type: integer
   *                     pages:
   *                       type: integer
   */
  async getMemberPointList(ctx: Context): Promise<void> {
    try {
      const params: IMemberPointQueryParams = {
        page: Number(ctx.query.page) || 1,
        size: Number(ctx.query.size) || 10,
        user_member_id: ctx.query.user_member_id as string,
        type: ctx.query.type as string,
        change_min: ctx.query.change_min ? Number(ctx.query.change_min) : undefined,
        change_max: ctx.query.change_max ? Number(ctx.query.change_max) : undefined,
        start_date: ctx.query.start_date as string,
        end_date: ctx.query.end_date as string,
      };

      const result = await memberPointService.getMemberPointList(params);
      ctx.body = success(result, '获取积分记录列表成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取积分记录列表失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/points/{id}:
   *   get:
   *     tags:
   *       - 积分记录管理
   *     summary: 获取积分记录详情
   *     description: 根据ID获取积分记录详细信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 记录ID
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
   *                     user_member_id:
   *                       type: string
   *                     change:
   *                       type: integer
   *                     type:
   *                       type: string
   *                     remark:
   *                       type: string
   *                     created_at:
   *                       type: string
   *                       format: date-time
   *                     user_member:
   *                       type: object
   *       404:
   *         description: 记录不存在
   */
  async getMemberPointById(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const memberPoint = await memberPointService.getMemberPointById(id);
      
      if (!memberPoint) {
        ctx.body = error('积分记录不存在', 404);
        return;
      }
      
      ctx.body = success(memberPoint, '获取积分记录详情成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取积分记录详情失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/points:
   *   post:
   *     tags:
   *       - 积分记录管理
   *     summary: 创建积分记录
   *     description: 创建新的积分记录并更新用户积分
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - user_member_id
   *               - change
   *               - type
   *             properties:
   *               user_member_id:
   *                 type: string
   *                 description: 用户会员ID
   *               change:
   *                 type: integer
   *                 description: 积分变化（正数为增加，负数为减少）
   *                 example: 100
   *               type:
   *                 type: string
   *                 description: 变化类型
   *                 enum: [earn, consume, adjust, expire, refund]
   *                 example: "earn"
   *               remark:
   *                 type: string
   *                 description: 备注
   *                 example: "购买商品获得积分"
   *     responses:
   *       200:
   *         description: 创建成功
   *       400:
   *         description: 参数错误
   */
  async createMemberPoint(ctx: Context): Promise<void> {
    try {
      const data: ICreateMemberPointRequest = ctx.request.body as ICreateMemberPointRequest;
      
      // 基础参数验证
      if (!data.user_member_id || !data.user_member_id.trim()) {
        ctx.body = error('用户会员ID不能为空', 400);
        return;
      }
      
      if (data.change === undefined || typeof data.change !== 'number') {
        ctx.body = error('积分变化不能为空且必须为数字', 400);
        return;
      }
      
      if (!data.type || !data.type.trim()) {
        ctx.body = error('变化类型不能为空', 400);
        return;
      }
      
      // 验证变化类型
      if (!Object.values(PointChangeType).includes(data.type as PointChangeType)) {
        ctx.body = error('积分变化类型无效', 400);
        return;
      }
      
      const memberPoint = await memberPointService.createMemberPoint(data);
      ctx.body = success(memberPoint, '创建积分记录成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建积分记录失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/points/batch:
   *   post:
   *     tags:
   *       - 积分记录管理
   *     summary: 批量创建积分记录
   *     description: 批量创建积分记录并更新用户积分
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - records
   *             properties:
   *               records:
   *                 type: array
   *                 description: 积分记录数组
   *                 items:
   *                   type: object
   *                   required:
   *                     - user_member_id
   *                     - change
   *                     - type
   *                   properties:
   *                     user_member_id:
   *                       type: string
   *                       description: 用户会员ID
   *                     change:
   *                       type: integer
   *                       description: 积分变化
   *                     type:
   *                       type: string
   *                       enum: [earn, consume, adjust, expire, refund]
   *                     remark:
   *                       type: string
   *                       description: 备注
   *     responses:
   *       200:
   *         description: 创建成功
   *       400:
   *         description: 参数错误
   */
  async createMemberPointBatch(ctx: Context): Promise<void> {
    try {
      const { records } = ctx.request.body as { records: ICreateMemberPointRequest[] };
      
      if (!records || !Array.isArray(records) || records.length === 0) {
        ctx.body = error('积分记录数组不能为空', 400);
        return;
      }
      
      // 验证每个记录
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        if (!record.user_member_id || !record.user_member_id.trim()) {
          ctx.body = error(`第${i + 1}条记录的用户会员ID不能为空`, 400);
          return;
        }
        
        if (record.change === undefined || typeof record.change !== 'number') {
          ctx.body = error(`第${i + 1}条记录的积分变化无效`, 400);
          return;
        }
        
        if (!record.type || !Object.values(PointChangeType).includes(record.type as PointChangeType)) {
          ctx.body = error(`第${i + 1}条记录的变化类型无效`, 400);
          return;
        }
      }
      
      const result = await memberPointService.createMemberPointBatch(records);
      ctx.body = success(result, `批量创建积分记录成功，共创建 ${result.length} 条记录`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '批量创建积分记录失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/points/statistics/{userMemberId}:
   *   get:
   *     tags:
   *       - 积分记录管理
   *     summary: 获取用户积分统计
   *     description: 获取指定用户的积分统计信息
   *     parameters:
   *       - name: userMemberId
   *         in: path
   *         required: true
   *         description: 用户会员ID
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
   *                     totalEarned:
   *                       type: integer
   *                       description: 总获得积分
   *                     totalConsumed:
   *                       type: integer
   *                       description: 总消费积分
   *                     totalAdjusted:
   *                       type: integer
   *                       description: 总调整积分
   *                     currentBalance:
   *                       type: integer
   *                       description: 当前余额
   *                     recentRecords:
   *                       type: array
   *                       description: 最近10条记录
   *                       items:
   *                         type: object
   *       404:
   *         description: 用户会员不存在
   */
  async getUserPointStatistics(ctx: Context): Promise<void> {
    try {
      const { userMemberId } = ctx.params;
      const statistics = await memberPointService.getUserPointStatistics(userMemberId);
      ctx.body = success(statistics, '获取用户积分统计成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户积分统计失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/points/trend:
   *   get:
   *     tags:
   *       - 积分记录管理
   *     summary: 获取积分变化趋势
   *     description: 获取积分变化趋势数据
   *     parameters:
   *       - name: days
   *         in: query
   *         description: 统计天数
   *         schema:
   *           type: integer
   *           default: 30
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
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       date:
   *                         type: string
   *                         description: 日期
   *                         example: "2024-01-01"
   *                       totalEarned:
   *                         type: integer
   *                         description: 当日总获得积分
   *                       totalConsumed:
   *                         type: integer
   *                         description: 当日总消费积分
   *                       netChange:
   *                         type: integer
   *                         description: 当日净变化
   */
  async getPointChangeTrend(ctx: Context): Promise<void> {
    try {
      const days = Number(ctx.query.days) || 30;
      
      if (days <= 0 || days > 365) {
        ctx.body = error('统计天数必须在1-365之间', 400);
        return;
      }
      
      const trend = await memberPointService.getPointChangeTrend(days);
      ctx.body = success(trend, '获取积分变化趋势成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取积分变化趋势失败';
      ctx.body = error(errorMessage);
    }
  }
}

export const memberPointController = new MemberPointController(); 