/**
 * 部门管理路由
 * 处理部门的CRUD操作和部门树形结构管理
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { departmentController } from '../controllers/department-controller';

const router = new Router();

/**
 * @swagger
 * /api/v1/departments:
 *   get:
 *     summary: 获取部门树形结构
 *     tags: [部门管理]
 *     responses:
 *       200:
 *         description: 成功获取部门列表
 */
router.get('/', departmentController.getDepartmentTree);

/**
 * @swagger
 * /api/v1/departments:
 *   post:
 *     summary: 创建部门
 *     tags: [部门管理]
 *     responses:
 *       200:
 *         description: 成功创建部门
 */
router.post('/', departmentController.createDepartment);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   get:
 *     summary: 获取部门详情
 *     tags: [部门管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取部门详情
 */
router.get('/:id', departmentController.getDepartmentById);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   put:
 *     summary: 更新部门
 *     tags: [部门管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功更新部门
 */
router.put('/:id', departmentController.updateDepartment);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   delete:
 *     summary: 删除部门
 *     tags: [部门管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功删除部门
 */
router.delete('/:id', departmentController.deleteDepartment);

/**
 * @swagger
 * /api/v1/departments/{id}/children:
 *   get:
 *     summary: 获取子部门ID列表
 *     tags: [部门管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取子部门列表
 */
router.get('/:id/children', departmentController.getChildDepartmentIds);

export default router; 