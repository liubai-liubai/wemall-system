/**
 * 权限管理路由
 * 处理权限的CRUD操作和权限检查
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { permissionController } from '../controllers/permission-controller';

const router = new Router();

/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     summary: 获取权限树形结构
 *     tags: [权限管理]
 *     responses:
 *       200:
 *         description: 成功获取权限列表
 */
router.get('/', permissionController.getPermissionTree);

/**
 * @swagger
 * /api/v1/permissions:
 *   post:
 *     summary: 创建权限
 *     tags: [权限管理]
 *     responses:
 *       200:
 *         description: 成功创建权限
 */
router.post('/', permissionController.createPermission);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   get:
 *     summary: 获取权限详情
 *     tags: [权限管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取权限详情
 */
router.get('/:id', permissionController.getPermissionById);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   put:
 *     summary: 更新权限
 *     tags: [权限管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功更新权限
 */
router.put('/:id', permissionController.updatePermission);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   delete:
 *     summary: 删除权限
 *     tags: [权限管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功删除权限
 */
router.delete('/:id', permissionController.deletePermission);

export default router; 