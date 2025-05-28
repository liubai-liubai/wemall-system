/**
 * 权限管理控制器
 * 处理权限相关的HTTP请求，调用服务层处理业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { permissionService } from '../services/permission-service.js';
import { success, error } from '../utils/response.js';
import { 
  IPermissionQueryParams, 
  ICreatePermissionRequest, 
  IUpdatePermissionRequest,
  PermissionType 
} from '../types/system.js';

export class PermissionController {
  /**
   * @swagger
   * /api/v1/permissions:
   *   get:
   *     tags:
   *       - 权限管理
   *     summary: 获取权限树形列表
   *     description: 根据查询条件获取权限树形结构列表
   *     parameters:
   *       - name: name
   *         in: query
   *         description: 权限名称（模糊查询）
   *         schema:
   *           type: string
   *       - name: code
   *         in: query
   *         description: 权限编码（模糊查询）
   *         schema:
   *           type: string
   *       - name: type
   *         in: query
   *         description: 权限类型
   *         schema:
   *           type: string
   *           enum: [menu, button, api]
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
  async getPermissionTree(ctx: Context): Promise<void> {
    try {
      const params: IPermissionQueryParams = {
        name: ctx.query.name as string,
        code: ctx.query.code as string,
        type: ctx.query.type as PermissionType | undefined,
        status: ctx.query.status ? Number(ctx.query.status) : undefined,
      };

      const treeNodes = await permissionService.getPermissionTree(params);
      
      // 将PermissionTreeNode转换为前端期望的Permission格式
      const convertTreeNodeToPermission = (node: any): any => {
        return {
          ...node.permission,
          children: node.children ? node.children.map(convertTreeNodeToPermission) : undefined
        };
      };
      
      const result = treeNodes.map(convertTreeNodeToPermission);
      
      ctx.body = success(result, '获取权限树成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取权限树失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/permissions/{id}:
   *   get:
   *     tags:
   *       - 权限管理
   *     summary: 获取权限详情
   *     description: 根据ID获取权限详细信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 权限ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功
   *       404:
   *         description: 权限不存在
   */
  async getPermissionById(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const permission = await permissionService.getPermissionById(id);
      
      if (!permission) {
        ctx.body = error('权限不存在', 404);
        return;
      }
      
      ctx.body = success(permission, '获取权限详情成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取权限详情失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/permissions:
   *   post:
   *     tags:
   *       - 权限管理
   *     summary: 创建权限
   *     description: 创建新的权限
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - code
   *               - type
   *             properties:
   *               name:
   *                 type: string
   *                 description: 权限名称
   *               code:
   *                 type: string
   *                 description: 权限编码
   *               type:
   *                 type: string
   *                 enum: [menu, button, api]
   *                 description: 权限类型
   *               parentId:
   *                 type: string
   *                 description: 父权限ID
   *               path:
   *                 type: string
   *                 description: 路由路径
   *               component:
   *                 type: string
   *                 description: 组件路径
   *               icon:
   *                 type: string
   *                 description: 图标
   *               sort:
   *                 type: integer
   *                 description: 排序值
   *     responses:
   *       200:
   *         description: 创建成功
   *       400:
   *         description: 参数错误
   */
  async createPermission(ctx: Context): Promise<void> {
    try {
      const data: ICreatePermissionRequest = ctx.request.body as ICreatePermissionRequest;
      const permission = await permissionService.createPermission(data);
      ctx.body = success(permission, '创建权限成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建权限失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/permissions/{id}:
   *   put:
   *     tags:
   *       - 权限管理
   *     summary: 更新权限
   *     description: 更新权限信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 权限ID
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
   *                 description: 权限名称
   *               code:
   *                 type: string
   *                 description: 权限编码
   *               type:
   *                 type: string
   *                 enum: [menu, button, api]
   *                 description: 权限类型
   *               parentId:
   *                 type: string
   *                 description: 父权限ID
   *               path:
   *                 type: string
   *                 description: 路由路径
   *               component:
   *                 type: string
   *                 description: 组件路径
   *               icon:
   *                 type: string
   *                 description: 图标
   *               sort:
   *                 type: integer
   *                 description: 排序值
   *               status:
   *                 type: integer
   *                 description: 状态
   *     responses:
   *       200:
   *         description: 更新成功
   *       404:
   *         description: 权限不存在
   */
  async updatePermission(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const data: IUpdatePermissionRequest = ctx.request.body as IUpdatePermissionRequest;
      const permission = await permissionService.updatePermission(id, data);
      ctx.body = success(permission, '更新权限成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新权限失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/permissions/{id}:
   *   delete:
   *     tags:
   *       - 权限管理
   *     summary: 删除权限
   *     description: 删除指定的权限
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 权限ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 删除成功
   *       404:
   *         description: 权限不存在
   */
  async deletePermission(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      await permissionService.deletePermission(id);
      ctx.body = success(null, '删除权限成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除权限失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/permissions/user/{userId}/menus:
   *   get:
   *     tags:
   *       - 权限管理
   *     summary: 获取用户菜单权限
   *     description: 根据用户ID获取菜单权限树
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
   */
  async getUserMenuPermissions(ctx: Context): Promise<void> {
    try {
      const { userId } = ctx.params;
      const menus = await permissionService.getUserMenuPermissions(userId);
      ctx.body = success(menus, '获取用户菜单权限成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户菜单权限失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/permissions/user/{userId}/codes:
   *   get:
   *     tags:
   *       - 权限管理
   *     summary: 获取用户权限编码列表
   *     description: 根据用户ID获取权限编码数组
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
   */
  async getUserPermissionCodes(ctx: Context): Promise<void> {
    try {
      const { userId } = ctx.params;
      const codes = await permissionService.getUserPermissionCodes(userId);
      ctx.body = success(codes, '获取用户权限编码成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户权限编码失败';
      ctx.body = error(errorMessage);
    }
  }
}

export const permissionController = new PermissionController(); 