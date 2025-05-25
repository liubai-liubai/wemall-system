/**
 * 管理员用户路由
 * 处理管理员用户的CRUD操作和用户角色分配
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { adminUserController } from '../controllers/admin-user-controller.js';

const router = new Router();

/**
 * @swagger
 * /api/v1/admin-users:
 *   get:
 *     summary: 获取管理员用户列表
 *     tags: [管理员用户]
 *     responses:
 *       200:
 *         description: 成功获取管理员用户列表
 */
router.get('/', adminUserController.getAdminUserList);

/**
 * @swagger
 * /api/v1/admin-users:
 *   post:
 *     summary: 创建管理员用户
 *     tags: [管理员用户]
 *     responses:
 *       200:
 *         description: 成功创建管理员用户
 */
router.post('/', adminUserController.createAdminUser);

/**
 * @swagger
 * /api/v1/admin-users/{id}:
 *   get:
 *     summary: 获取管理员用户详情
 *     tags: [管理员用户]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取管理员用户详情
 */
router.get('/:id', adminUserController.getAdminUserById);

/**
 * @swagger
 * /api/v1/admin-users/{id}:
 *   put:
 *     summary: 更新管理员用户
 *     tags: [管理员用户]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功更新管理员用户
 */
router.put('/:id', adminUserController.updateAdminUser);

/**
 * @swagger
 * /api/v1/admin-users/{id}:
 *   delete:
 *     summary: 删除管理员用户
 *     tags: [管理员用户]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功删除管理员用户
 */
router.delete('/:id', adminUserController.deleteAdminUser);

/**
 * @swagger
 * /api/v1/admin-users/{id}/roles:
 *   put:
 *     summary: 分配用户角色
 *     tags: [管理员用户]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功分配角色
 */
// router.put('/:id/roles', adminUserController.assignRoles);

/**
 * @swagger
 * /api/v1/admin-users/{id}/reset-password:
 *   patch:
 *     summary: 重置用户密码
 *     tags: [管理员用户]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功重置密码
 */
router.patch('/:id/reset-password', adminUserController.resetPassword);

export default router; 