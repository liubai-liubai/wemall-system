/**
 * 用户地址服务层
 * 处理用户地址相关的业务逻辑，包括CRUD操作、地址验证、默认地址管理等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { 
  IUserAddress,
  CreateUserAddressRequest, 
  UpdateUserAddressRequest,
  UserAddressQueryParams,
  UserAddressListResponse,
  AddressStatistics,
  AddressValidationResult
} from '../types/user';
import { logger } from '../utils/logger';

export class UserAddressService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * 获取用户地址列表（分页）
   */
  async getAddressList(params: UserAddressQueryParams): Promise<UserAddressListResponse> {
    try {
      const {
        userId,
        province,
        city,
        district,
        isDefault,
        label,
        page = 1,
        size = 20,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = params;

      // 构建查询条件 - 根据Prisma模型调整字段名
      const where: any = {};
      
      if (userId) {
        // 需要通过user_member关联查询
        where.user_member = {
          user_id: userId
        };
      }
      if (province) where.province = { contains: province };
      if (city) where.city = { contains: city };
      if (district) where.district = { contains: district };
      if (typeof isDefault === 'boolean') where.is_default = isDefault ? 1 : 0;

      // 构建排序条件
      const orderBy: any = {};
      if (sortBy === 'receiver_name') {
        orderBy.consignee = sortOrder;
      } else {
        orderBy[sortBy === 'created_at' ? 'created_at' : 'updated_at'] = sortOrder;
      }

      // 查询总数
      const total = await this.prisma.userAddress.count({ where });

      // 查询列表数据
      const addresses = await this.prisma.userAddress.findMany({
        where,
        orderBy,
        skip: (page - 1) * size,
        take: size,
        include: {
          user_member: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      const pages = Math.ceil(total / size);

      logger.info(`获取用户地址列表成功，查询到 ${addresses.length} 条记录`);

      return {
        list: addresses.map(this.formatAddressResponse),
        total,
        page,
        size,
        pages
      };

    } catch (error) {
      logger.error('获取用户地址列表失败:', error);
      throw new Error('获取用户地址列表失败');
    }
  }

  /**
   * 根据ID获取地址详情
   */
  async getAddressById(id: string): Promise<IUserAddress> {
    try {
      const address = await this.prisma.userAddress.findUnique({
        where: { id },
        include: {
          user_member: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      if (!address) {
        throw new Error('地址不存在');
      }

      logger.info(`获取地址详情成功: ${id}`);
      return this.formatAddressResponse(address);

    } catch (error) {
      logger.error('获取地址详情失败:', error);
      if (error instanceof Error && error.message === '地址不存在') {
        throw error;
      }
      throw new Error('获取地址详情失败');
    }
  }

  /**
   * 获取用户的所有地址
   */
  async getAddressesByUserId(userId: string): Promise<IUserAddress[]> {
    try {
      const addresses = await this.prisma.userAddress.findMany({
        where: { 
          user_member: {
            user_id: userId
          }
        },
        orderBy: [
          { is_default: 'desc' },
          { created_at: 'desc' }
        ],
        include: {
          user_member: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      logger.info(`获取用户地址列表成功: ${userId}，共 ${addresses.length} 条记录`);
      return addresses.map(this.formatAddressResponse);

    } catch (error) {
      logger.error('获取用户地址列表失败:', error);
      throw new Error('获取用户地址列表失败');
    }
  }

  /**
   * 获取用户默认地址
   */
  async getDefaultAddress(userId: string): Promise<IUserAddress | null> {
    try {
      const address = await this.prisma.userAddress.findFirst({
        where: { 
          user_member: {
            user_id: userId
          },
          is_default: 1
        },
        include: {
          user_member: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      if (!address) {
        return null;
      }

      logger.info(`获取用户默认地址成功: ${userId}`);
      return this.formatAddressResponse(address);

    } catch (error) {
      logger.error('获取用户默认地址失败:', error);
      throw new Error('获取用户默认地址失败');
    }
  }

  /**
   * 创建新地址
   */
  async createAddress(userMemberId: string, data: CreateUserAddressRequest): Promise<IUserAddress> {
    try {
      // 验证地址信息
      await this.validateAddress(data);

      // 检查用户会员是否存在
      const userMember = await this.prisma.userMember.findUnique({
        where: { id: userMemberId }
      });

      if (!userMember) {
        throw new Error('用户会员信息不存在');
      }

      // 如果设置为默认地址，需要将其他地址的默认状态取消
      if (data.isDefault) {
        await this.prisma.userAddress.updateMany({
          where: { 
            user_member_id: userMemberId,
            is_default: 1
          },
          data: { is_default: 0 }
        });
      }

      // 创建地址
      const newAddress = await this.prisma.userAddress.create({
        data: {
          user_member_id: userMemberId,
          consignee: data.receiverName,
          phone: data.receiverPhone,
          province: data.province,
          city: data.city,
          district: data.district,
          address: data.detailAddress,
          is_default: data.isDefault ? 1 : 0
        },
        include: {
          user_member: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      logger.info(`创建地址成功: ${newAddress.id}`);
      return this.formatAddressResponse(newAddress);

    } catch (error) {
      logger.error('创建地址失败:', error);
      if (error instanceof Error && (error.message.includes('验证失败') || error.message === '用户会员信息不存在')) {
        throw error;
      }
      throw new Error('创建地址失败');
    }
  }

  /**
   * 更新地址信息
   */
  async updateAddress(id: string, data: UpdateUserAddressRequest): Promise<IUserAddress> {
    try {
      // 检查地址是否存在
      const existingAddress = await this.prisma.userAddress.findUnique({
        where: { id }
      });

      if (!existingAddress) {
        throw new Error('地址不存在');
      }

      // 验证地址信息
      if (data.receiverName || data.receiverPhone || data.province || 
          data.city || data.district || data.detailAddress) {
        await this.validateAddress(data as CreateUserAddressRequest);
      }

      // 如果设置为默认地址，需要将同用户的其他地址默认状态取消
      if (data.isDefault) {
        await this.prisma.userAddress.updateMany({
          where: { 
            user_member_id: existingAddress.user_member_id,
            is_default: 1,
            id: { not: id }
          },
          data: { is_default: 0 }
        });
      }

      // 更新地址
      const updatedAddress = await this.prisma.userAddress.update({
        where: { id },
        data: {
          ...(data.receiverName && { consignee: data.receiverName }),
          ...(data.receiverPhone && { phone: data.receiverPhone }),
          ...(data.province && { province: data.province }),
          ...(data.city && { city: data.city }),
          ...(data.district && { district: data.district }),
          ...(data.detailAddress && { address: data.detailAddress }),
          ...(data.isDefault !== undefined && { is_default: data.isDefault ? 1 : 0 }),
          updated_at: new Date()
        },
        include: {
          user_member: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      logger.info(`更新地址成功: ${id}`);
      return this.formatAddressResponse(updatedAddress);

    } catch (error) {
      logger.error('更新地址失败:', error);
      if (error instanceof Error && (error.message === '地址不存在' || error.message.includes('验证失败'))) {
        throw error;
      }
      throw new Error('更新地址失败');
    }
  }

  /**
   * 删除地址
   */
  async deleteAddress(id: string): Promise<void> {
    try {
      // 检查地址是否存在
      const address = await this.prisma.userAddress.findUnique({
        where: { id }
      });

      if (!address) {
        throw new Error('地址不存在');
      }

      // 删除地址
      await this.prisma.userAddress.delete({
        where: { id }
      });

      logger.info(`删除地址成功: ${id}`);

    } catch (error) {
      logger.error('删除地址失败:', error);
      if (error instanceof Error && error.message === '地址不存在') {
        throw error;
      }
      throw new Error('删除地址失败');
    }
  }

  /**
   * 设置默认地址
   */
  async setDefaultAddress(userMemberId: string, addressId: string): Promise<void> {
    try {
      // 检查地址是否存在且属于当前用户
      const address = await this.prisma.userAddress.findFirst({
        where: { 
          id: addressId,
          user_member_id: userMemberId
        }
      });

      if (!address) {
        throw new Error('地址不存在或无权限操作');
      }

      // 事务处理：取消其他默认地址，设置新的默认地址
      await this.prisma.$transaction([
        this.prisma.userAddress.updateMany({
          where: { 
            user_member_id: userMemberId,
            is_default: 1
          },
          data: { is_default: 0 }
        }),
        this.prisma.userAddress.update({
          where: { id: addressId },
          data: { is_default: 1 }
        })
      ]);

      logger.info(`设置默认地址成功: ${addressId}`);

    } catch (error) {
      logger.error('设置默认地址失败:', error);
      if (error instanceof Error && error.message === '地址不存在或无权限操作') {
        throw error;
      }
      throw new Error('设置默认地址失败');
    }
  }

  /**
   * 获取地址统计信息
   */
  async getAddressStatistics(): Promise<AddressStatistics> {
    try {
      // 总地址数
      const totalAddresses = await this.prisma.userAddress.count();

      // 默认地址数
      const defaultAddresses = await this.prisma.userAddress.count({
        where: { is_default: 1 }
      });

      // 按省份统计
      const provinceStats = await this.prisma.userAddress.groupBy({
        by: ['province'],
        _count: {
          province: true
        },
        orderBy: {
          _count: {
            province: 'desc'
          }
        },
        take: 10
      });

      const result: AddressStatistics = {
        totalAddresses,
        defaultAddresses,
        provinceStats: provinceStats.map(item => ({
          province: item.province,
          count: item._count.province
        })),
        labelStats: [] // 当前模型没有label字段，返回空数组
      };

      logger.info('获取地址统计信息成功');
      return result;

    } catch (error) {
      logger.error('获取地址统计信息失败:', error);
      throw new Error('获取地址统计信息失败');
    }
  }

  /**
   * 验证地址信息
   */
  private async validateAddress(data: Partial<CreateUserAddressRequest>): Promise<AddressValidationResult> {
    const errors: string[] = [];

    // 验证收件人姓名
    if (data.receiverName) {
      if (data.receiverName.length < 2 || data.receiverName.length > 20) {
        errors.push('收件人姓名长度应在2-20个字符之间');
      }
    }

    // 验证手机号
    if (data.receiverPhone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(data.receiverPhone)) {
        errors.push('手机号格式不正确');
      }
    }

    // 验证地址信息
    if (data.province && data.province.length === 0) {
      errors.push('省份不能为空');
    }
    if (data.city && data.city.length === 0) {
      errors.push('城市不能为空');
    }
    if (data.district && data.district.length === 0) {
      errors.push('区县不能为空');
    }
    if (data.detailAddress && (data.detailAddress.length < 5 || data.detailAddress.length > 100)) {
      errors.push('详细地址长度应在5-100个字符之间');
    }

    // 验证邮政编码
    if (data.postalCode) {
      const postalCodeRegex = /^\d{6}$/;
      if (!postalCodeRegex.test(data.postalCode)) {
        errors.push('邮政编码格式不正确');
      }
    }

    // 验证标签
    if (data.label && data.label.length > 10) {
      errors.push('地址标签长度不能超过10个字符');
    }

    const isValid = errors.length === 0;

    if (errors.length > 0) {
      throw new Error(`地址验证失败: ${errors.join(', ')}`);
    }

    return {
      isValid,
      errors,
      normalizedAddress: data.province && data.city && data.district && data.detailAddress ? {
        province: data.province.trim(),
        city: data.city.trim(),
        district: data.district.trim(),
        detailAddress: data.detailAddress.trim()
      } : undefined
    };
  }

  /**
   * 格式化地址响应数据
   */
  private formatAddressResponse(address: any): IUserAddress {
    return {
      id: address.id,
      userId: address.user_member?.user_id || '',
      receiverName: address.consignee,
      receiverPhone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detailAddress: address.address,
      postalCode: undefined, // 当前模型没有此字段
      isDefault: address.is_default === 1,
      label: undefined, // 当前模型没有此字段
      createdAt: address.created_at,
      updatedAt: address.updated_at,
      user: address.user_member?.user ? {
        id: address.user_member.user.id,
        openId: '',
        nickname: address.user_member.user.nickname,
        avatar: address.user_member.user.avatar,
        phone: address.user_member.user.phone,
        gender: 0,
        status: 1,
        createdAt: '',
        updatedAt: ''
      } : undefined
    };
  }
} 