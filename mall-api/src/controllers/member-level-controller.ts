/**
 * 会员等级控制器
 * 处理会员等级相关的HTTP请求
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { memberLevelService } from '../services/member-level-service.js';
import { success, error } from '../utils/response.js';
import { 
  IMemberLevelQueryParams,
  ICreateMemberLevelRequest,
  IUpdateMemberLevelRequest
} from '../types/member.js';

export class MemberLevelController {
  /**
   * @swagger
   * /api/v1/member/levels:
   *   get:
   *     tags:
   *       - 会员等级管理
   *     summary: 获取会员等级分页列表
   *     description: 根据查询条件获取会员等级分页列表
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
   *       - name: name
   *         in: query
   *         description: 等级名称（模糊查询）
   *         schema:
   *           type: string
   *       - name: status
   *         in: query
   *         description: 状态（0-禁用，1-启用）
   *         schema:
   *           type: integer
   *           enum: [0, 1]
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
   *                             description: 等级ID
   *                           name:
   *                             type: string
   *                             description: 等级名称
   *                           description:
   *                             type: string
   *                             description: 等级描述
   *                           growth_min:
   *                             type: integer
   *                             description: 成长值下限
   *                           growth_max:
   *                             type: integer
   *                             description: 成长值上限
   *                           privileges:
   *                             type: object
   *                             description: 等级特权
   *                           status:
   *                             type: integer
   *                             description: 状态
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *                           updated_at:
   *                             type: string
   *                             format: date-time
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     size:
   *                       type: integer
   *                     pages:
   *                       type: integer
   */
  async getMemberLevelList(ctx: Context): Promise<void> {
    try {
      const params: IMemberLevelQueryParams = {
        page: Number(ctx.query.page) || 1,
        size: Number(ctx.query.size) || 10,
        name: ctx.query.name as string,
        status: ctx.query.status ? Number(ctx.query.status) : undefined,
      };

      const result = await memberLevelService.getMemberLevelList(params);
      ctx.body = success(result, '获取会员等级列表成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取会员等级列表失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/levels/{id}:
   *   get:
   *     tags:
   *       - 会员等级管理
   *     summary: 获取会员等级详情
   *     description: 根据ID获取会员等级详细信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 等级ID
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
   *                     name:
   *                       type: string
   *                     description:
   *                       type: string
   *                     growth_min:
   *                       type: integer
   *                     growth_max:
   *                       type: integer
   *                     privileges:
   *                       type: object
   *                     status:
   *                       type: integer
   *                     created_at:
   *                       type: string
   *                       format: date-time
   *                     updated_at:
   *                       type: string
   *                       format: date-time
   *       404:
   *         description: 等级不存在
   */
  async getMemberLevelById(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const memberLevel = await memberLevelService.getMemberLevelById(id);
      
      if (!memberLevel) {
        ctx.body = error('会员等级不存在', 404);
        return;
      }
      
      ctx.body = success(memberLevel, '获取会员等级详情成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取会员等级详情失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/levels:
   *   post:
   *     tags:
   *       - 会员等级管理
   *     summary: 创建会员等级
   *     description: 创建新的会员等级
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - growth_min
   *               - growth_max
   *             properties:
   *               name:
   *                 type: string
   *                 description: 等级名称
   *                 example: "青铜会员"
   *               description:
   *                 type: string
   *                 description: 等级描述
   *                 example: "新手会员等级"
   *               growth_min:
   *                 type: integer
   *                 description: 成长值下限
   *                 example: 0
   *               growth_max:
   *                 type: integer
   *                 description: 成长值上限
   *                 example: 999
   *               privileges:
   *                 type: object
   *                 description: 等级特权
   *                 example: {"discount": 0.95, "points_multiplier": 1.0}
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
  async createMemberLevel(ctx: Context): Promise<void> {
    try {
      const data: ICreateMemberLevelRequest = ctx.request.body as ICreateMemberLevelRequest;
      
      // 基础参数验证
      if (!data.name || !data.name.trim()) {
        ctx.body = error('等级名称不能为空', 400);
        return;
      }
      
      if (data.growth_min === undefined || data.growth_max === undefined) {
        ctx.body = error('成长值范围不能为空', 400);
        return;
      }
      
      if (data.growth_min < 0 || data.growth_max < 0) {
        ctx.body = error('成长值不能为负数', 400);
        return;
      }
      
      const memberLevel = await memberLevelService.createMemberLevel(data);
      ctx.body = success(memberLevel, '创建会员等级成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建会员等级失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/levels/{id}:
   *   put:
   *     tags:
   *       - 会员等级管理
   *     summary: 更新会员等级
   *     description: 更新会员等级信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 等级ID
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: 等级名称
   *               description:
   *                 type: string
   *                 description: 等级描述
   *               growth_min:
   *                 type: integer
   *                 description: 成长值下限
   *               growth_max:
   *                 type: integer
   *                 description: 成长值上限
   *               privileges:
   *                 type: object
   *                 description: 等级特权
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
   *         description: 等级不存在
   */
  async updateMemberLevel(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const data: IUpdateMemberLevelRequest = ctx.request.body as IUpdateMemberLevelRequest;
      
      // 参数验证
      if (data.name !== undefined && (!data.name || !data.name.trim())) {
        ctx.body = error('等级名称不能为空', 400);
        return;
      }
      
      if ((data.growth_min !== undefined && data.growth_min < 0) || 
          (data.growth_max !== undefined && data.growth_max < 0)) {
        ctx.body = error('成长值不能为负数', 400);
        return;
      }
      
      const memberLevel = await memberLevelService.updateMemberLevel(id, data);
      ctx.body = success(memberLevel, '更新会员等级成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新会员等级失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/levels/{id}:
   *   delete:
   *     tags:
   *       - 会员等级管理
   *     summary: 删除会员等级
   *     description: 删除指定的会员等级
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 等级ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 删除成功
   *       400:
   *         description: 该等级下还有用户，无法删除
   *       404:
   *         description: 等级不存在
   */
  async deleteMemberLevel(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      await memberLevelService.deleteMemberLevel(id);
      ctx.body = success(null, '删除会员等级成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除会员等级失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/levels/enabled:
   *   get:
   *     tags:
   *       - 会员等级管理
   *     summary: 获取所有启用的会员等级
   *     description: 获取所有状态为启用的会员等级列表，按成长值排序
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
   *                       id:
   *                         type: string
   *                       name:
   *                         type: string
   *                       description:
   *                         type: string
   *                       growth_min:
   *                         type: integer
   *                       growth_max:
   *                         type: integer
   *                       privileges:
   *                         type: object
   */
  async getEnabledMemberLevels(ctx: Context): Promise<void> {
    try {
      const levels = await memberLevelService.getEnabledMemberLevels();
      ctx.body = success(levels, '获取启用的会员等级成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取启用的会员等级失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/member/levels/by-growth/{growth}:
   *   get:
   *     tags:
   *       - 会员等级管理
   *     summary: 根据成长值获取会员等级
   *     description: 根据指定的成长值获取对应的会员等级
   *     parameters:
   *       - name: growth
   *         in: path
   *         required: true
   *         description: 成长值
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
   *                   nullable: true
   *       404:
   *         description: 未找到对应等级
   */
  async getMemberLevelByGrowth(ctx: Context): Promise<void> {
    try {
      const growth = Number(ctx.params.growth);
      
      if (isNaN(growth) || growth < 0) {
        ctx.body = error('成长值参数无效', 400);
        return;
      }
      
      const memberLevel = await memberLevelService.getMemberLevelByGrowth(growth);
      
      if (!memberLevel) {
        ctx.body = error('未找到对应的会员等级', 404);
        return;
      }
      
      ctx.body = success(memberLevel, '获取会员等级成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取会员等级失败';
      ctx.body = error(errorMessage);
    }
  }
}

export const memberLevelController = new MemberLevelController(); 