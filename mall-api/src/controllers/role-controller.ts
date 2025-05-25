/**
 * 角色管理控制器
 * 处理角色相关的HTTP请求，调用服务层处理业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { roleService } from '../services/role-service.js';
import { success, error } from '../utils/response.js';
import { 
  IRoleQueryParams, 
  ICreateRoleRequest, 
  IUpdateRoleRequest 
} from '../types/system.js';

export class RoleController {
  /**
   * @swagger
   * /api/v1/roles:
   *   get:
   *     tags:
   *       - 角色管理
   *     summary: 获取角色分页列表
   *     description: 根据查询条件获取角色分页列表
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
   *         description: 角色名称（模糊查询）
   *         schema:
   *           type: string
   *       - name: code
   *         in: query
   *         description: 角色编码（模糊查询）
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
   */
  async getRoleList(ctx: Context): Promise<void> {
    try {
      const params: IRoleQueryParams = {
        page: Number(ctx.query.page) || 1,
        size: Number(ctx.query.size) || 10,
        name: ctx.query.name as string,
        code: ctx.query.code as string,
        status: ctx.query.status ? Number(ctx.query.status) : undefined,
      };

      const result = await roleService.getRoleList(params);
      ctx.body = success(result, '获取角色列表成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取角色列表失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/roles/all:
   *   get:
   *     tags:
   *       - 角色管理
   *     summary: 获取所有角色（不分页）
   *     description: 获取所有启用状态的角色，用于下拉选择
   *     responses:
   *       200:
   *         description: 成功
   */
  async getAllRoles(ctx: Context): Promise<void> {
    try {
      const result = await roleService.getAllRoles();
      ctx.body = success(result, '获取所有角色成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取所有角色失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/roles/{id}:
   *   get:
   *     tags:
   *       - 角色管理
   *     summary: 获取角色详情
   *     description: 根据ID获取角色详细信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 角色ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功
   *       404:
   *         description: 角色不存在
   */
  async getRoleById(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const role = await roleService.getRoleById(id);
      
      if (!role) {
        ctx.body = error('角色不存在', 404);
        return;
      }
      
      ctx.body = success(role, '获取角色详情成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取角色详情失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/roles:
   *   post:
   *     tags:
   *       - 角色管理
   *     summary: 创建角色
   *     description: 创建新的角色
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - code
   *               - permissionIds
   *             properties:
   *               name:
   *                 type: string
   *                 description: 角色名称
   *               code:
   *                 type: string
   *                 description: 角色编码
   *               description:
   *                 type: string
   *                 description: 角色描述
   *               sort:
   *                 type: integer
   *                 description: 排序值
   *               permissionIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: 权限ID数组
   *     responses:
   *       200:
   *         description: 创建成功
   *       400:
   *         description: 参数错误
   */
  async createRole(ctx: Context): Promise<void> {
    try {
      const data: ICreateRoleRequest = ctx.request.body as ICreateRoleRequest;
      const role = await roleService.createRole(data);
      ctx.body = success(role, '创建角色成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建角色失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/roles/{id}:
   *   put:
   *     tags:
   *       - 角色管理
   *     summary: 更新角色
   *     description: 更新角色信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 角色ID
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
   *                 description: 角色名称
   *               description:
   *                 type: string
   *                 description: 角色描述
   *               status:
   *                 type: integer
   *                 description: 状态
   *               sort:
   *                 type: integer
   *                 description: 排序值
   *               permissionIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: 权限ID数组
   *     responses:
   *       200:
   *         description: 更新成功
   *       404:
   *         description: 角色不存在
   */
  async updateRole(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const data: IUpdateRoleRequest = ctx.request.body as IUpdateRoleRequest;
      const role = await roleService.updateRole(id, data);
      ctx.body = success(role, '更新角色成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新角色失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/roles/{id}:
   *   delete:
   *     tags:
   *       - 角色管理
   *     summary: 删除角色
   *     description: 删除指定的角色
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 角色ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 删除成功
   *       404:
   *         description: 角色不存在
   */
  async deleteRole(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      await roleService.deleteRole(id);
      ctx.body = success(null, '删除角色成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除角色失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/roles/{id}/permissions:
   *   get:
   *     tags:
   *       - 角色管理
   *     summary: 获取角色权限ID列表
   *     description: 获取指定角色的权限ID数组
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 角色ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功
   */
  async getRolePermissionIds(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const permissionIds = await roleService.getRolePermissionIds(id);
      ctx.body = success(permissionIds, '获取角色权限列表成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取角色权限列表失败';
      ctx.body = error(errorMessage);
    }
  }
}

export const roleController = new RoleController(); 