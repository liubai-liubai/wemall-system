/**
 * 管理员用户控制器
 * 处理管理员用户相关的HTTP请求，调用服务层处理业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { adminUserService } from '../services/admin-user-service';
import { success, error } from '../utils/response';
import { 
  IAdminUserQueryParams, 
  ICreateAdminUserRequest, 
  IUpdateAdminUserRequest,
  IAdminLoginRequest 
} from '../types/system';

export class AdminUserController {
  /**
   * @swagger
   * /api/v1/admin-users:
   *   get:
   *     tags:
   *       - 管理员用户管理
   *     summary: 获取管理员用户分页列表
   *     description: 根据查询条件获取管理员用户分页列表
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
   *       - name: username
   *         in: query
   *         description: 用户名（模糊查询）
   *         schema:
   *           type: string
   *       - name: email
   *         in: query
   *         description: 邮箱（模糊查询）
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
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     size:
   *                       type: integer
   *                     pages:
   *                       type: integer
   */
  async getAdminUserList(ctx: Context): Promise<void> {
    try {
      const params: IAdminUserQueryParams = {
        page: Number(ctx.query.page) || 1,
        size: Number(ctx.query.size) || 10,
        username: ctx.query.username as string,
        email: ctx.query.email as string,
        phone: ctx.query.phone as string,
        realName: ctx.query.realName as string,
        departmentId: ctx.query.departmentId as string,
        status: ctx.query.status ? Number(ctx.query.status) : undefined,
      };

      const result = await adminUserService.getAdminUserList(params);
      ctx.body = success(result, '获取管理员用户列表成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取管理员用户列表失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/admin-users/{id}:
   *   get:
   *     tags:
   *       - 管理员用户管理
   *     summary: 获取管理员用户详情
   *     description: 根据ID获取管理员用户详细信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 用户ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功
   *       404:
   *         description: 用户不存在
   */
  async getAdminUserById(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const user = await adminUserService.getAdminUserById(id);
      
      if (!user) {
        ctx.body = error('用户不存在', 404);
        return;
      }
      
      ctx.body = success(user, '获取用户详情成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户详情失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/admin-users:
   *   post:
   *     tags:
   *       - 管理员用户管理
   *     summary: 创建管理员用户
   *     description: 创建新的管理员用户
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *               - roleIds
   *             properties:
   *               username:
   *                 type: string
   *                 description: 用户名
   *               password:
   *                 type: string
   *                 description: 密码
   *               email:
   *                 type: string
   *                 description: 邮箱
   *               phone:
   *                 type: string
   *                 description: 手机号
   *               realName:
   *                 type: string
   *                 description: 真实姓名
   *               departmentId:
   *                 type: string
   *                 description: 部门ID
   *               roleIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: 角色ID数组
   *     responses:
   *       200:
   *         description: 创建成功
   *       400:
   *         description: 参数错误
   */
  async createAdminUser(ctx: Context): Promise<void> {
    try {
      const data: ICreateAdminUserRequest = ctx.request.body as ICreateAdminUserRequest;
      const user = await adminUserService.createAdminUser(data);
      ctx.body = success(user, '创建管理员用户成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建管理员用户失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/admin-users/{id}:
   *   put:
   *     tags:
   *       - 管理员用户管理
   *     summary: 更新管理员用户
   *     description: 更新管理员用户信息
   *     parameters:
   *       - name: id
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
   *             properties:
   *               email:
   *                 type: string
   *                 description: 邮箱
   *               phone:
   *                 type: string
   *                 description: 手机号
   *               realName:
   *                 type: string
   *                 description: 真实姓名
   *               departmentId:
   *                 type: string
   *                 description: 部门ID
   *               status:
   *                 type: integer
   *                 description: 状态
   *               roleIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: 角色ID数组
   *     responses:
   *       200:
   *         description: 更新成功
   *       404:
   *         description: 用户不存在
   */
  async updateAdminUser(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const data: IUpdateAdminUserRequest = ctx.request.body as IUpdateAdminUserRequest;
      const user = await adminUserService.updateAdminUser(id, data);
      ctx.body = success(user, '更新管理员用户成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新管理员用户失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/admin-users/{id}:
   *   delete:
   *     tags:
   *       - 管理员用户管理
   *     summary: 删除管理员用户
   *     description: 删除指定的管理员用户
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 用户ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 删除成功
   *       404:
   *         description: 用户不存在
   */
  async deleteAdminUser(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      await adminUserService.deleteAdminUser(id);
      ctx.body = success(null, '删除管理员用户成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除管理员用户失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/admin/login:
   *   post:
   *     tags:
   *       - 管理员认证
   *     summary: 管理员登录
   *     description: 管理员用户登录系统
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 description: 用户名
   *               password:
   *                 type: string
   *                 description: 密码
   *     responses:
   *       200:
   *         description: 登录成功
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
   *                   example: 登录成功
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                       description: 访问令牌
   *                     refreshToken:
   *                       type: string
   *                       description: 刷新令牌
   *                     userInfo:
   *                       type: object
   *                       description: 用户信息
   *                     permissions:
   *                       type: array
   *                       items:
   *                         type: string
   *                       description: 权限列表
   *                     menus:
   *                       type: array
   *                       description: 菜单列表
   *       401:
   *         description: 认证失败
   */
  async adminLogin(ctx: Context): Promise<void> {
    try {
      const data: IAdminLoginRequest = ctx.request.body as IAdminLoginRequest;
      const result = await adminUserService.adminLogin(data);
      ctx.body = success(result, '登录成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      ctx.body = error(errorMessage, 401);
    }
  }

  /**
   * @swagger
   * /api/v1/admin-users/{id}/reset-password:
   *   patch:
   *     tags:
   *       - 管理员用户管理
   *     summary: 重置用户密码
   *     description: 重置指定管理员用户的密码
   *     parameters:
   *       - name: id
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
   *               - newPassword
   *             properties:
   *               newPassword:
   *                 type: string
   *                 description: 新密码
   *     responses:
   *       200:
   *         description: 重置成功
   *       404:
   *         description: 用户不存在
   */
  async resetPassword(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const { newPassword } = ctx.request.body as { newPassword: string };
      await adminUserService.resetPassword(id, newPassword);
      ctx.body = success(null, '重置密码成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重置密码失败';
      ctx.body = error(errorMessage);
    }
  }
}

export const adminUserController = new AdminUserController(); 