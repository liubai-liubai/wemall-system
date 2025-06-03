/**
 * 积分记录路由
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { memberPointController } from '../controllers/member-point-controller.js';

const router = new Router({
  prefix: '/api/v1/member/points'
});

// 获取积分变化趋势（需要放在参数路由前面）
router.get('/trend', memberPointController.getPointChangeTrend.bind(memberPointController));

// 批量创建积分记录
router.post('/batch', memberPointController.createMemberPointBatch.bind(memberPointController));

// 获取用户积分统计
router.get('/statistics/:userMemberId', memberPointController.getUserPointStatistics.bind(memberPointController));

// 获取积分记录分页列表
router.get('/', memberPointController.getMemberPointList.bind(memberPointController));

// 获取积分记录详情
router.get('/:id', memberPointController.getMemberPointById.bind(memberPointController));

// 创建积分记录
router.post('/', memberPointController.createMemberPoint.bind(memberPointController));

export default router; 