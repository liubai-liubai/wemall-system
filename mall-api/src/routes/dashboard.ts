/**
 * 仪表盘路由
 * 提供系统统计数据、系统信息和最近活动记录等仪表盘相关接口
 * 
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: 仪表盘管理接口
 * 
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { DashboardController } from '../controllers/dashboard-controller.js';

const router = new Router();

const dashboardController = new DashboardController();

// 获取仪表盘统计数据
router.get('/stats', dashboardController.getStats);

// 获取系统信息
router.get('/system-info', dashboardController.getSystemInfo);

// 获取最近活动
router.get('/recent-activities', dashboardController.getRecentActivities);

export default router; 