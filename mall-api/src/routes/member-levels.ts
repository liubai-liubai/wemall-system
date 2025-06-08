/**
 * 会员等级路由
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { memberLevelController } from '../controllers/member-level-controller';

const router = new Router({
  prefix: '/api/v1/member/levels'
});

// 获取会员等级分页列表
router.get('/', memberLevelController.getMemberLevelList.bind(memberLevelController));

// 获取所有启用的会员等级
router.get('/enabled', memberLevelController.getEnabledMemberLevels.bind(memberLevelController));

// 根据成长值获取会员等级
router.get('/by-growth/:growth', memberLevelController.getMemberLevelByGrowth.bind(memberLevelController));

// 获取会员等级详情
router.get('/:id', memberLevelController.getMemberLevelById.bind(memberLevelController));

// 创建会员等级
router.post('/', memberLevelController.createMemberLevel.bind(memberLevelController));

// 更新会员等级
router.put('/:id', memberLevelController.updateMemberLevel.bind(memberLevelController));

// 删除会员等级
router.delete('/:id', memberLevelController.deleteMemberLevel.bind(memberLevelController));

export default router; 