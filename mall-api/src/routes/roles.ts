/**
 * 角色管理路由
 * 处理角色的CRUD操作和角色权限分配
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { roleController } from '../controllers/role-controller';

const router = new Router();

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: 获取角色列表
 *     tags: [角色管理]
 *     responses:
 *       200:
 *         description: 成功获取角色列表
 */
router.get('/', roleController.getRoleList);

/**
 * @swagger
 * /api/v1/roles/all:
 *   get:
 *     summary: 获取所有角色
 *     tags: [角色管理]
 *     responses:
 *       200:
 *         description: 成功获取所有角色
 */
router.get('/all', roleController.getAllRoles);

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: 创建角色
 *     tags: [角色管理]
 *     responses:
 *       200:
 *         description: 成功创建角色
 */
router.post('/', roleController.createRole);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: 获取角色详情
 *     tags: [角色管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取角色详情
 */
router.get('/:id', roleController.getRoleById);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     summary: 更新角色
 *     tags: [角色管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功更新角色
 */
router.put('/:id', roleController.updateRole);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: 删除角色
 *     tags: [角色管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功删除角色
 */
router.delete('/:id', roleController.deleteRole);

/**
 * @swagger
 * /api/v1/roles/{id}/permissions:
 *   get:
 *     summary: 获取角色权限ID列表
 *     tags: [角色管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取角色权限
 */
router.get('/:id/permissions', roleController.getRolePermissionIds);

export default router; 