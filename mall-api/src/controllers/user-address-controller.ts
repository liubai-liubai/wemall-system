/**
 * 用户地址控制器
 * 处理用户地址相关的HTTP请求，提供完整的CRUD操作
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { UserAddressService } from '../services/user-address-service';
import { success, error, pageSuccess } from '../utils/response';
import { 
  CreateUserAddressRequest, 
  UpdateUserAddressRequest,
  UserAddressQueryParams 
} from '../types/user';
import { logger } from '../utils/logger';

export class UserAddressController {
  private userAddressService: UserAddressService;

  constructor() {
    this.userAddressService = new UserAddressService();
  }

  /**
   * @swagger
   * /api/v1/user/addresses:
   *   get:
   *     tags:
   *       - 用户地址管理
   *     summary: 获取用户地址列表（分页）
   *     description: 支持多种查询条件和分页功能的用户地址列表接口
   *     parameters:
   *       - name: userId
   *         in: query
   *         description: 用户ID
   *         required: false
   *         schema:
   *           type: string
   *       - name: province
   *         in: query
   *         description: 省份（模糊查询）
   *         required: false
   *         schema:
   *           type: string
   *       - name: city
   *         in: query
   *         description: 城市（模糊查询）
   *         required: false
   *         schema:
   *           type: string
   *       - name: district
   *         in: query
   *         description: 区县（模糊查询）
   *         required: false
   *         schema:
   *           type: string
   *       - name: isDefault
   *         in: query
   *         description: 是否默认地址
   *         required: false
   *         schema:
   *           type: boolean
   *       - name: page
   *         in: query
   *         description: 页码（从1开始）
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - name: size
   *         in: query
   *         description: 每页数量（1-100）
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *       - name: sortBy
   *         in: query
   *         description: 排序字段
   *         required: false
   *         schema:
   *           type: string
   *           enum: [created_at, updated_at, receiver_name]
   *           default: created_at
   *       - name: sortOrder
   *         in: query
   *         description: 排序方向
   *         required: false
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   type: object
   *                   properties:
   *                     list:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/UserAddress'
   *                     total:
   *                       type: integer
   *                       description: 总数
   *                     page:
   *                       type: integer
   *                       description: 当前页
   *                     size:
   *                       type: integer
   *                       description: 页大小
   *                     pages:
   *                       type: integer
   *                       description: 总页数
   *                 timestamp:
   *                   type: integer
   *       500:
   *         description: 服务器内部错误
   */
  async getAddressList(ctx: Context): Promise<void> {
    try {
      const params: UserAddressQueryParams = {
        userId: ctx.query.userId as string,
        province: ctx.query.province as string,
        city: ctx.query.city as string,
        district: ctx.query.district as string,
        isDefault: ctx.query.isDefault ? ctx.query.isDefault === 'true' : undefined,
        page: ctx.query.page ? parseInt(ctx.query.page as string, 10) : 1,
        size: ctx.query.size ? parseInt(ctx.query.size as string, 10) : 20,
        sortBy: (ctx.query.sortBy as any) || 'created_at',
        sortOrder: (ctx.query.sortOrder as any) || 'desc'
      };

      // 参数验证
      if (params.page! < 1) params.page = 1;
      if (params.size! < 1 || params.size! > 100) params.size = 20;

      const result = await this.userAddressService.getAddressList(params);
      
      ctx.body = pageSuccess(
        result.list,
        result.total,
        result.page,
        result.size,
        '获取地址列表成功'
      );

      logger.info(`获取地址列表成功 - 用户: ${params.userId || '全部'}, 页码: ${params.page}, 大小: ${params.size}`);

    } catch (err) {
      logger.error('获取地址列表失败:', err);
      ctx.body = error('获取地址列表失败', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/user/addresses/{id}:
   *   get:
   *     tags:
   *       - 用户地址管理
   *     summary: 获取地址详情
   *     description: 根据地址ID获取详细信息
   *     parameters:
   *       - name: id
   *         in: path
   *         description: 地址ID
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   $ref: '#/components/schemas/UserAddress'
   *                 timestamp:
   *                   type: integer
   *       404:
   *         description: 地址不存在
   *       500:
   *         description: 服务器内部错误
   */
  async getAddressById(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;

      if (!id) {
        ctx.body = error('地址ID不能为空', 400);
        return;
      }

      const address = await this.userAddressService.getAddressById(id);
      ctx.body = success(address, '获取地址详情成功');

      logger.info(`获取地址详情成功: ${id}`);

    } catch (err) {
      logger.error('获取地址详情失败:', err);
      if (err instanceof Error && err.message === '地址不存在') {
        ctx.body = error('地址不存在', 404);
      } else {
        ctx.body = error('获取地址详情失败', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/user/addresses/user/{userId}:
   *   get:
   *     tags:
   *       - 用户地址管理
   *     summary: 获取用户的所有地址
   *     description: 根据用户ID获取该用户的所有地址（按默认地址和创建时间排序）
   *     parameters:
   *       - name: userId
   *         in: path
   *         description: 用户ID
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/UserAddress'
   *                 timestamp:
   *                   type: integer
   *       500:
   *         description: 服务器内部错误
   */
  async getAddressesByUserId(ctx: Context): Promise<void> {
    try {
      const { userId } = ctx.params;

      if (!userId) {
        ctx.body = error('用户ID不能为空', 400);
        return;
      }

      const addresses = await this.userAddressService.getAddressesByUserId(userId);
      ctx.body = success(addresses, '获取用户地址列表成功');

      logger.info(`获取用户地址列表成功: ${userId}, 共 ${addresses.length} 条`);

    } catch (err) {
      logger.error('获取用户地址列表失败:', err);
      ctx.body = error('获取用户地址列表失败', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/user/addresses/user/{userId}/default:
   *   get:
   *     tags:
   *       - 用户地址管理
   *     summary: 获取用户默认地址
   *     description: 获取指定用户的默认收货地址
   *     parameters:
   *       - name: userId
   *         in: path
   *         description: 用户ID
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   oneOf:
   *                     - $ref: '#/components/schemas/UserAddress'
   *                     - type: "null"
   *                 timestamp:
   *                   type: integer
   *       500:
   *         description: 服务器内部错误
   */
  async getDefaultAddress(ctx: Context): Promise<void> {
    try {
      const { userId } = ctx.params;

      if (!userId) {
        ctx.body = error('用户ID不能为空', 400);
        return;
      }

      const address = await this.userAddressService.getDefaultAddress(userId);
      ctx.body = success(address, address ? '获取默认地址成功' : '用户暂无默认地址');

      logger.info(`获取用户默认地址: ${userId}, 结果: ${address ? '找到' : '未找到'}`);

    } catch (err) {
      logger.error('获取用户默认地址失败:', err);
      ctx.body = error('获取用户默认地址失败', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/user/addresses:
   *   post:
   *     tags:
   *       - 用户地址管理
   *     summary: 创建新地址
   *     description: 为用户创建新的收货地址
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userMemberId
   *               - receiverName
   *               - receiverPhone
   *               - province
   *               - city
   *               - district
   *               - detailAddress
   *             properties:
   *               userMemberId:
   *                 type: string
   *                 description: 用户会员ID
   *               receiverName:
   *                 type: string
   *                 description: 收件人姓名
   *                 minLength: 2
   *                 maxLength: 20
   *                 example: "张三"
   *               receiverPhone:
   *                 type: string
   *                 description: 收件人手机号
   *                 pattern: "^1[3-9]\\d{9}$"
   *                 example: "13800138000"
   *               province:
   *                 type: string
   *                 description: 省份
   *                 example: "广东省"
   *               city:
   *                 type: string
   *                 description: 城市
   *                 example: "深圳市"
   *               district:
   *                 type: string
   *                 description: 区县
   *                 example: "南山区"
   *               detailAddress:
   *                 type: string
   *                 description: 详细地址
   *                 minLength: 5
   *                 maxLength: 100
   *                 example: "科技园南区深南大道9988号"
   *               postalCode:
   *                 type: string
   *                 description: 邮政编码（可选）
   *                 pattern: "^\\d{6}$"
   *                 example: "518000"
   *               isDefault:
   *                 type: boolean
   *                 description: 是否设为默认地址
   *                 default: false
   *               label:
   *                 type: string
   *                 description: 地址标签（可选）
   *                 maxLength: 10
   *                 example: "家"
   *     responses:
   *       200:
   *         description: 创建成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "创建成功"
   *                 data:
   *                   $ref: '#/components/schemas/UserAddress'
   *                 timestamp:
   *                   type: integer
   *       400:
   *         description: 参数错误或验证失败
   *       404:
   *         description: 用户会员信息不存在
   *       500:
   *         description: 服务器内部错误
   */
  async createAddress(ctx: Context): Promise<void> {
    try {
      const { userMemberId, ...addressData } = ctx.request.body as { userMemberId: string } & CreateUserAddressRequest;

      if (!userMemberId) {
        ctx.body = error('用户会员ID不能为空', 400);
        return;
      }

      if (!addressData.receiverName || !addressData.receiverPhone || 
          !addressData.province || !addressData.city || 
          !addressData.district || !addressData.detailAddress) {
        ctx.body = error('必填字段不能为空', 400);
        return;
      }

      const newAddress = await this.userAddressService.createAddress(userMemberId, addressData);
      ctx.body = success(newAddress, '创建地址成功');

      logger.info(`创建地址成功: ${newAddress.id}, 用户会员: ${userMemberId}`);

    } catch (err) {
      logger.error('创建地址失败:', err);
      if (err instanceof Error) {
        if (err.message === '用户会员信息不存在') {
          ctx.body = error(err.message, 404);
        } else if (err.message.includes('验证失败')) {
          ctx.body = error(err.message, 400);
        } else {
          ctx.body = error('创建地址失败', 500);
        }
      } else {
        ctx.body = error('创建地址失败', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/user/addresses/{id}:
   *   put:
   *     tags:
   *       - 用户地址管理
   *     summary: 更新地址信息
   *     description: 根据地址ID更新地址信息
   *     parameters:
   *       - name: id
   *         in: path
   *         description: 地址ID
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               receiverName:
   *                 type: string
   *                 description: 收件人姓名
   *                 minLength: 2
   *                 maxLength: 20
   *               receiverPhone:
   *                 type: string
   *                 description: 收件人手机号
   *                 pattern: "^1[3-9]\\d{9}$"
   *               province:
   *                 type: string
   *                 description: 省份
   *               city:
   *                 type: string
   *                 description: 城市
   *               district:
   *                 type: string
   *                 description: 区县
   *               detailAddress:
   *                 type: string
   *                 description: 详细地址
   *                 minLength: 5
   *                 maxLength: 100
   *               postalCode:
   *                 type: string
   *                 description: 邮政编码
   *                 pattern: "^\\d{6}$"
   *               isDefault:
   *                 type: boolean
   *                 description: 是否设为默认地址
   *               label:
   *                 type: string
   *                 description: 地址标签
   *                 maxLength: 10
   *     responses:
   *       200:
   *         description: 更新成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "更新成功"
   *                 data:
   *                   $ref: '#/components/schemas/UserAddress'
   *                 timestamp:
   *                   type: integer
   *       400:
   *         description: 参数错误或验证失败
   *       404:
   *         description: 地址不存在
   *       500:
   *         description: 服务器内部错误
   */
  async updateAddress(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body as UpdateUserAddressRequest;

      if (!id) {
        ctx.body = error('地址ID不能为空', 400);
        return;
      }

      const updatedAddress = await this.userAddressService.updateAddress(id, updateData);
      ctx.body = success(updatedAddress, '更新地址成功');

      logger.info(`更新地址成功: ${id}`);

    } catch (err) {
      logger.error('更新地址失败:', err);
      if (err instanceof Error) {
        if (err.message === '地址不存在') {
          ctx.body = error(err.message, 404);
        } else if (err.message.includes('验证失败')) {
          ctx.body = error(err.message, 400);
        } else {
          ctx.body = error('更新地址失败', 500);
        }
      } else {
        ctx.body = error('更新地址失败', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/user/addresses/{id}:
   *   delete:
   *     tags:
   *       - 用户地址管理
   *     summary: 删除地址
   *     description: 根据地址ID删除地址
   *     parameters:
   *       - name: id
   *         in: path
   *         description: 地址ID
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 删除成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "删除成功"
   *                 data:
   *                   type: "null"
   *                 timestamp:
   *                   type: integer
   *       404:
   *         description: 地址不存在
   *       500:
   *         description: 服务器内部错误
   */
  async deleteAddress(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.params;

      if (!id) {
        ctx.body = error('地址ID不能为空', 400);
        return;
      }

      await this.userAddressService.deleteAddress(id);
      ctx.body = success(null, '删除地址成功');

      logger.info(`删除地址成功: ${id}`);

    } catch (err) {
      logger.error('删除地址失败:', err);
      if (err instanceof Error && err.message === '地址不存在') {
        ctx.body = error('地址不存在', 404);
      } else {
        ctx.body = error('删除地址失败', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/user/addresses/{userMemberId}/set-default/{addressId}:
   *   patch:
   *     tags:
   *       - 用户地址管理
   *     summary: 设置默认地址
   *     description: 将指定地址设为用户的默认收货地址
   *     parameters:
   *       - name: userMemberId
   *         in: path
   *         description: 用户会员ID
   *         required: true
   *         schema:
   *           type: string
   *       - name: addressId
   *         in: path
   *         description: 地址ID
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 设置成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "设置默认地址成功"
   *                 data:
   *                   type: "null"
   *                 timestamp:
   *                   type: integer
   *       404:
   *         description: 地址不存在或无权限操作
   *       500:
   *         description: 服务器内部错误
   */
  async setDefaultAddress(ctx: Context): Promise<void> {
    try {
      const { userMemberId, addressId } = ctx.params;

      if (!userMemberId || !addressId) {
        ctx.body = error('用户会员ID和地址ID不能为空', 400);
        return;
      }

      await this.userAddressService.setDefaultAddress(userMemberId, addressId);
      ctx.body = success(null, '设置默认地址成功');

      logger.info(`设置默认地址成功: 用户会员 ${userMemberId}, 地址 ${addressId}`);

    } catch (err) {
      logger.error('设置默认地址失败:', err);
      if (err instanceof Error && err.message === '地址不存在或无权限操作') {
        ctx.body = error('地址不存在或无权限操作', 404);
      } else {
        ctx.body = error('设置默认地址失败', 500);
      }
    }
  }

  /**
   * @swagger
   * /api/v1/user/addresses/statistics:
   *   get:
   *     tags:
   *       - 用户地址管理
   *     summary: 获取地址统计信息
   *     description: 获取地址相关的统计数据，包括总数、默认地址数、地区分布等
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "获取成功"
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalAddresses:
   *                       type: integer
   *                       description: 总地址数
   *                     defaultAddresses:
   *                       type: integer
   *                       description: 默认地址数
   *                     provinceStats:
   *                       type: array
   *                       description: 省份统计
   *                       items:
   *                         type: object
   *                         properties:
   *                           province:
   *                             type: string
   *                           count:
   *                             type: integer
   *                     labelStats:
   *                       type: array
   *                       description: 标签统计
   *                       items:
   *                         type: object
   *                         properties:
   *                           label:
   *                             type: string
   *                           count:
   *                             type: integer
   *                 timestamp:
   *                   type: integer
   *       500:
   *         description: 服务器内部错误
   */
  async getAddressStatistics(ctx: Context): Promise<void> {
    try {
      const statistics = await this.userAddressService.getAddressStatistics();
      ctx.body = success(statistics, '获取地址统计信息成功');

      logger.info('获取地址统计信息成功');

    } catch (err) {
      logger.error('获取地址统计信息失败:', err);
      ctx.body = error('获取地址统计信息失败', 500);
    }
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserAddress:
 *       type: object
 *       description: 用户地址信息
 *       properties:
 *         id:
 *           type: string
 *           description: 地址ID
 *         userId:
 *           type: string
 *           description: 用户ID
 *         receiverName:
 *           type: string
 *           description: 收件人姓名
 *         receiverPhone:
 *           type: string
 *           description: 收件人手机号
 *         province:
 *           type: string
 *           description: 省份
 *         city:
 *           type: string
 *           description: 城市
 *         district:
 *           type: string
 *           description: 区县
 *         detailAddress:
 *           type: string
 *           description: 详细地址
 *         postalCode:
 *           type: string
 *           description: 邮政编码
 *           nullable: true
 *         isDefault:
 *           type: boolean
 *           description: 是否默认地址
 *         label:
 *           type: string
 *           description: 地址标签
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         user:
 *           type: object
 *           description: 关联用户信息
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             nickname:
 *               type: string
 *             phone:
 *               type: string
 *             avatar:
 *               type: string
 *       required:
 *         - id
 *         - userId
 *         - receiverName
 *         - receiverPhone
 *         - province
 *         - city
 *         - district
 *         - detailAddress
 *         - isDefault
 *         - createdAt
 *         - updatedAt
 */ 