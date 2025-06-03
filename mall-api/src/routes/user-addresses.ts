/**
 * 用户地址路由配置
 * 定义用户地址管理相关的路由规则
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Router from '@koa/router';
import { UserAddressController } from '../controllers/user-address-controller';
import { logger } from '../utils/logger';

const router = new Router({
  prefix: '/api/v1'
});

const userAddressController = new UserAddressController();

// 获取地址统计信息（放在前面避免被参数路由捕获）
router.get('/user/addresses/statistics', userAddressController.getAddressStatistics.bind(userAddressController));

// 获取用户的所有地址
router.get('/user/addresses/user/:userId', userAddressController.getAddressesByUserId.bind(userAddressController));

// 获取用户默认地址
router.get('/user/addresses/user/:userId/default', userAddressController.getDefaultAddress.bind(userAddressController));

// 获取地址列表（分页）
router.get('/user/addresses', userAddressController.getAddressList.bind(userAddressController));

// 获取地址详情
router.get('/user/addresses/:id', userAddressController.getAddressById.bind(userAddressController));

// 创建新地址
router.post('/user/addresses', userAddressController.createAddress.bind(userAddressController));

// 更新地址信息
router.put('/user/addresses/:id', userAddressController.updateAddress.bind(userAddressController));

// 删除地址
router.delete('/user/addresses/:id', userAddressController.deleteAddress.bind(userAddressController));

// 设置默认地址
router.patch('/user/addresses/:userMemberId/set-default/:addressId', userAddressController.setDefaultAddress.bind(userAddressController));

logger.info('用户地址路由注册完成');

export default router; 