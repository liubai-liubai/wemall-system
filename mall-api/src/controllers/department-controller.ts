/**
 * 部门管理控制器
 * 处理部门相关的HTTP请求，调用服务层处理业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { departmentService } from '../services/department-service.js';
import { success, error } from '../utils/response.js';
import { 
  IDepartmentQueryParams, 
  ICreateDepartmentRequest, 
  IUpdateDepartmentRequest 
} from '../types/system.js';

export class DepartmentController {
  /**
   * @swagger
   * /api/v1/departments:
   *   get:
   *     tags:
   *       - 部门管理
   *     summary: 获取部门树形列表
   *     description: 根据查询条件获取部门树形结构列表
   *     parameters:
   *       - name: name
   *         in: query
   *         description: 部门名称（模糊查询）
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
  async getDepartmentTree(ctx: Context): Promise<void> {
    try {
      const params: IDepartmentQueryParams = {
        name: ctx.query.name as string,
        status: ctx.query.status ? Number(ctx.query.status) : undefined,
      };

      const result = await departmentService.getDepartmentTree(params);
      ctx.body = success(result, '获取部门树成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取部门树失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/departments/{id}:
   *   get:
   *     tags:
   *       - 部门管理
   *     summary: 获取部门详情
   *     description: 根据ID获取部门详细信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 部门ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功
   *       404:
   *         description: 部门不存在
   */
  async getDepartmentById(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const department = await departmentService.getDepartmentById(id);
      
      if (!department) {
        ctx.body = error('部门不存在', 404);
        return;
      }
      
      ctx.body = success(department, '获取部门详情成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取部门详情失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/departments:
   *   post:
   *     tags:
   *       - 部门管理
   *     summary: 创建部门
   *     description: 创建新的部门
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 description: 部门名称
   *               parentId:
   *                 type: string
   *                 description: 父部门ID
   *               leaderId:
   *                 type: string
   *                 description: 部门负责人ID
   *               phone:
   *                 type: string
   *                 description: 联系电话
   *               email:
   *                 type: string
   *                 description: 邮箱
   *               sort:
   *                 type: integer
   *                 description: 排序值
   *     responses:
   *       200:
   *         description: 创建成功
   *       400:
   *         description: 参数错误
   */
  async createDepartment(ctx: Context): Promise<void> {
    try {
      const data: ICreateDepartmentRequest = ctx.request.body as ICreateDepartmentRequest;
      const department = await departmentService.createDepartment(data);
      ctx.body = success(department, '创建部门成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建部门失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/departments/{id}:
   *   put:
   *     tags:
   *       - 部门管理
   *     summary: 更新部门
   *     description: 更新部门信息
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 部门ID
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
   *                 description: 部门名称
   *               parentId:
   *                 type: string
   *                 description: 父部门ID
   *               leaderId:
   *                 type: string
   *                 description: 部门负责人ID
   *               phone:
   *                 type: string
   *                 description: 联系电话
   *               email:
   *                 type: string
   *                 description: 邮箱
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
   *         description: 部门不存在
   */
  async updateDepartment(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const data: IUpdateDepartmentRequest = ctx.request.body as IUpdateDepartmentRequest;
      const department = await departmentService.updateDepartment(id, data);
      ctx.body = success(department, '更新部门成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新部门失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/departments/{id}:
   *   delete:
   *     tags:
   *       - 部门管理
   *     summary: 删除部门
   *     description: 删除指定的部门
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 部门ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 删除成功
   *       404:
   *         description: 部门不存在
   */
  async deleteDepartment(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      await departmentService.deleteDepartment(id);
      ctx.body = success(null, '删除部门成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除部门失败';
      ctx.body = error(errorMessage);
    }
  }

  /**
   * @swagger
   * /api/v1/departments/{id}/children:
   *   get:
   *     tags:
   *       - 部门管理
   *     summary: 获取部门子部门ID列表
   *     description: 获取指定部门的所有子部门ID（递归）
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: 部门ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功
   */
  async getChildDepartmentIds(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const childIds = await departmentService.getChildDepartmentIds(id);
      ctx.body = success(childIds, '获取子部门列表成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取子部门列表失败';
      ctx.body = error(errorMessage);
    }
  }
}

export const departmentController = new DepartmentController(); 