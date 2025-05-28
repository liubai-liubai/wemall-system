/**
 * 仪表盘控制器
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { DashboardService } from '../services/dashboard-service.js';
import { success } from '../utils/response.js';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /**
   * @swagger
   * /api/v1/dashboard/stats:
   *   get:
   *     summary: 获取仪表盘统计数据
   *     description: 获取系统的关键统计数据，包括用户数量、订单数量、商品数量、今日访问量等
   *     tags:
   *       - Dashboard
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 获取统计数据成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                   description: 响应状态码
   *                 message:
   *                   type: string
   *                   example: "获取统计数据成功"
   *                   description: 响应消息
   *                 data:
   *                   type: object
   *                   properties:
   *                     userCount:
   *                       type: integer
   *                       example: 150
   *                       description: 用户总数
   *                     orderCount:
   *                       type: integer
   *                       example: 1250
   *                       description: 订单总数
   *                     productCount:
   *                       type: integer
   *                       example: 85
   *                       description: 商品总数
   *                     todayVisits:
   *                       type: integer
   *                       example: 320
   *                       description: 今日访问量
   *                 timestamp:
   *                   type: integer
   *                   example: 1647849600000
   *                   description: 响应时间戳
   *       401:
   *         description: 未授权访问
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 服务器内部错误
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  getStats = async (ctx: Context) => {
    try {
      const stats = await this.dashboardService.getStats();
      ctx.body = success(stats, '获取统计数据成功');
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
      ctx.throw(500, error.message || '获取统计数据失败');
    }
  };

  /**
   * @swagger
   * /api/v1/dashboard/system-info:
   *   get:
   *     summary: 获取系统信息
   *     description: 获取系统的基本信息，包括版本号、运行时间、最后备份时间、数据库大小等
   *     tags:
   *       - Dashboard
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 获取系统信息成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                   description: 响应状态码
   *                 message:
   *                   type: string
   *                   example: "获取系统信息成功"
   *                   description: 响应消息
   *                 data:
   *                   type: object
   *                   properties:
   *                     version:
   *                       type: string
   *                       example: "1.0.0"
   *                       description: 系统版本号
   *                     uptime:
   *                       type: string
   *                       example: "2天5小时30分钟"
   *                       description: 系统运行时间
   *                     lastBackupTime:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-03-21T10:30:00.000Z"
   *                       description: 最后备份时间
   *                     databaseSize:
   *                       type: string
   *                       example: "12.5MB"
   *                       description: 数据库大小
   *                 timestamp:
   *                   type: integer
   *                   example: 1647849600000
   *                   description: 响应时间戳
   *       401:
   *         description: 未授权访问
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 服务器内部错误
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  getSystemInfo = async (ctx: Context) => {
    try {
      const systemInfo = await this.dashboardService.getSystemInfo();
      ctx.body = success(systemInfo, '获取系统信息成功');
    } catch (error: any) {
      console.error('获取系统信息失败:', error);
      ctx.throw(500, error.message || '获取系统信息失败');
    }
  };

  /**
   * @swagger
   * /api/v1/dashboard/recent-activities:
   *   get:
   *     summary: 获取最近活动
   *     description: 获取系统最近的操作活动记录，包括登录、创建、更新等操作
   *     tags:
   *       - Dashboard
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 获取最近活动成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                   description: 响应状态码
   *                 message:
   *                   type: string
   *                   example: "获取最近活动成功"
   *                   description: 响应消息
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         example: "1"
   *                         description: 活动ID
   *                       type:
   *                         type: string
   *                         enum: [login, create, update, delete]
   *                         example: "login"
   *                         description: 活动类型
   *                       description:
   *                         type: string
   *                         example: "管理员登录系统"
   *                         description: 活动描述
   *                       time:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-03-21T10:30:00.000Z"
   *                         description: 活动时间
   *                       user:
   *                         type: string
   *                         example: "admin"
   *                         description: 操作用户
   *                 timestamp:
   *                   type: integer
   *                   example: 1647849600000
   *                   description: 响应时间戳
   *       401:
   *         description: 未授权访问
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 服务器内部错误
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  getRecentActivities = async (ctx: Context) => {
    try {
      const activities = await this.dashboardService.getRecentActivities();
      ctx.body = success(activities, '获取最近活动成功');
    } catch (error: any) {
      console.error('获取最近活动失败:', error);
      ctx.throw(500, error.message || '获取最近活动失败');
    }
  };
} 