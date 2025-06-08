/**
 * 用户会员信息路由
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { userMemberController } from '../controllers/user-member-controller';

const router = new Router({
  prefix: '/api/v1/member/users'
});

// 获取会员统计信息（需要放在其他路由前面，避免被参数路由捕获）
router.get('/statistics', userMemberController.getMemberStatistics.bind(userMemberController));

// 根据用户ID获取会员信息
router.get('/by-user/:userId', userMemberController.getUserMemberByUserId.bind(userMemberController));

// 获取用户会员分页列表
router.get('/', userMemberController.getUserMemberList.bind(userMemberController));

// 获取用户会员详情
router.get('/:id', userMemberController.getUserMemberById.bind(userMemberController));

// 创建用户会员
router.post('/', userMemberController.createUserMember.bind(userMemberController));

// 更新用户会员信息
router.put('/:id', userMemberController.updateUserMember.bind(userMemberController));

// 删除用户会员
router.delete('/:id', userMemberController.deleteUserMember.bind(userMemberController));

// 更新用户成长值
router.patch('/:userId/growth', userMemberController.updateUserGrowth.bind(userMemberController));

// 更新用户积分
router.patch('/:userId/points', userMemberController.updateUserPoints.bind(userMemberController));

export default router; 