/**
 * 用户地址服务测试
 * 测试地址CRUD操作、默认地址管理、地址验证等核心功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { UserAddressService } from '../../src/services/user-address-service';
import {
  mockUserAddresses,
  addressQueryParams,
  createAddressRequests,
  updateAddressRequests,
  invalidRequests,
  mockAddressStatistics,
  testUserMembers,
  addressBusinessRules
} from '../fixtures/user-address-fixtures';

// Mock Prisma Client
jest.mock('@prisma/client');
jest.mock('../../src/utils/logger');

describe('UserAddressService 用户地址服务测试', () => {
  let userAddressService: UserAddressService;
  let mockPrisma: any;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 创建mock prisma实例
    mockPrisma = {
      userAddress: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn()
      },
      userMember: {
        findUnique: jest.fn()
      },
      $transaction: jest.fn()
    };

    // 替换PrismaClient构造函数
    const { PrismaClient } = require('@prisma/client');
    PrismaClient.mockImplementation(() => mockPrisma);

    userAddressService = new UserAddressService();
  });

  // ==================== 地址数据验证测试 ====================
  describe('地址数据验证测试', () => {
    test('应该验证地址数据结构完整性', () => {
      const address = mockUserAddresses[0];
      expect(address).toHaveProperty('id');
      expect(address).toHaveProperty('user_member_id');
      expect(address).toHaveProperty('consignee');
      expect(address).toHaveProperty('phone');
      expect(address).toHaveProperty('province');
      expect(address).toHaveProperty('city');
      expect(address).toHaveProperty('district');
      expect(address).toHaveProperty('address');
      expect(address).toHaveProperty('is_default');
      expect(address).toHaveProperty('created_at');
      expect(address).toHaveProperty('updated_at');
    });

    test('应该验证默认地址状态数据类型', () => {
      const defaultAddress = mockUserAddresses.find(addr => addr.is_default === 1);
      const normalAddress = mockUserAddresses.find(addr => addr.is_default === 0);
      
      expect(defaultAddress).toBeDefined();
      expect(normalAddress).toBeDefined();
      expect(typeof defaultAddress?.is_default).toBe('number');
      expect(typeof normalAddress?.is_default).toBe('number');
    });

    test('应该验证地址字段值范围', () => {
      mockUserAddresses.forEach(address => {
        expect(address.consignee.length).toBeGreaterThanOrEqual(2);
        expect(address.consignee.length).toBeLessThanOrEqual(20);
        expect(address.phone).toMatch(/^1[3-9]\d{9}$/);
        expect(address.province.length).toBeGreaterThan(0);
        expect(address.city.length).toBeGreaterThan(0);
        expect(address.district.length).toBeGreaterThan(0);
        expect(address.address.length).toBeGreaterThanOrEqual(5);
      });
    });

    test('应该验证用户关联数据完整性', () => {
      const addressWithUser = mockUserAddresses[0];
      expect(addressWithUser.user_member).toBeDefined();
      expect(addressWithUser.user_member.user).toBeDefined();
      expect(addressWithUser.user_member.user.id).toBeDefined();
      expect(addressWithUser.user_member.user.nickname).toBeDefined();
    });

    test('应该验证地址时间戳格式', () => {
      mockUserAddresses.forEach(address => {
        expect(address.created_at).toBeInstanceOf(Date);
        expect(address.updated_at).toBeInstanceOf(Date);
        expect(address.created_at.getTime()).toBeLessThanOrEqual(address.updated_at.getTime());
      });
    });
  });

  // ==================== 地址查询功能测试 ====================
  describe('地址查询功能测试', () => {
    test('应该成功获取地址列表（分页）', async () => {
      mockPrisma.userAddress.count.mockResolvedValue(6);
      mockPrisma.userAddress.findMany.mockResolvedValue(mockUserAddresses.slice(0, 2));

      const result = await userAddressService.getAddressList(addressQueryParams.basicPagination);

      expect(mockPrisma.userAddress.count).toHaveBeenCalledWith({
        where: {}
      });
      expect(mockPrisma.userAddress.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 10,
        include: expect.any(Object)
      });
      expect(result.total).toBe(6);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });

    test('应该支持用户筛选查询', async () => {
      const userAddresses = mockUserAddresses.filter(addr => 
        addr.user_member.user_id === 'user-1-uuid-001'
      );

      mockPrisma.userAddress.count.mockResolvedValue(userAddresses.length);
      mockPrisma.userAddress.findMany.mockResolvedValue(userAddresses);

      await userAddressService.getAddressList(addressQueryParams.userFilter);

      expect(mockPrisma.userAddress.count).toHaveBeenCalledWith({
        where: {
          user_member: {
            user_id: 'user-1-uuid-001'
          }
        }
      });
    });

    test('应该支持地区筛选查询', async () => {
      const regionAddresses = mockUserAddresses.filter(addr => 
        addr.province.includes('广东省') && addr.city.includes('深圳市')
      );

      mockPrisma.userAddress.count.mockResolvedValue(regionAddresses.length);
      mockPrisma.userAddress.findMany.mockResolvedValue(regionAddresses);

      await userAddressService.getAddressList(addressQueryParams.regionFilter);

      expect(mockPrisma.userAddress.count).toHaveBeenCalledWith({
        where: {
          province: { contains: '广东省' },
          city: { contains: '深圳市' }
        }
      });
    });

    test('应该支持默认地址筛选', async () => {
      const defaultAddresses = mockUserAddresses.filter(addr => addr.is_default === 1);

      mockPrisma.userAddress.count.mockResolvedValue(defaultAddresses.length);
      mockPrisma.userAddress.findMany.mockResolvedValue(defaultAddresses);

      await userAddressService.getAddressList(addressQueryParams.defaultFilter);

      expect(mockPrisma.userAddress.count).toHaveBeenCalledWith({
        where: { is_default: 1 }
      });
    });

    test('应该支持复杂条件查询', async () => {
      const complexResult = mockUserAddresses.filter(addr => 
        addr.user_member.user_id === 'user-2-uuid-002' &&
        addr.province.includes('广东省') &&
        addr.is_default === 0
      );

      mockPrisma.userAddress.count.mockResolvedValue(complexResult.length);
      mockPrisma.userAddress.findMany.mockResolvedValue(complexResult);

      await userAddressService.getAddressList(addressQueryParams.complexFilter);

      expect(mockPrisma.userAddress.count).toHaveBeenCalledWith({
        where: {
          user_member: { user_id: 'user-2-uuid-002' },
          province: { contains: '广东省' },
          is_default: 0
        }
      });
    });

    test('应该处理边界值分页查询', async () => {
      mockPrisma.userAddress.count.mockResolvedValue(1);
      mockPrisma.userAddress.findMany.mockResolvedValue([mockUserAddresses[0]]);

      const result = await userAddressService.getAddressList(addressQueryParams.boundaryValues);

      expect(result.pages).toBe(1);
      expect(result.size).toBe(1);
      expect(mockPrisma.userAddress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 1
        })
      );
    });
  });

  // ==================== 地址详情查询测试 ====================
  describe('地址详情查询测试', () => {
    test('应该成功获取地址详情', async () => {
      const expectedAddress = mockUserAddresses[0];
      mockPrisma.userAddress.findUnique.mockResolvedValue(expectedAddress);

      const result = await userAddressService.getAddressById('addr-1-uuid-string-001');

      expect(mockPrisma.userAddress.findUnique).toHaveBeenCalledWith({
        where: { id: 'addr-1-uuid-string-001' },
        include: expect.any(Object)
      });
      expect(result.id).toBe('addr-1-uuid-string-001');
    });

    test('应该处理地址不存在的情况', async () => {
      mockPrisma.userAddress.findUnique.mockResolvedValue(null);

      await expect(
        userAddressService.getAddressById('non-existent-id')
      ).rejects.toThrow('地址不存在');
    });

    test('应该正确获取用户的所有地址', async () => {
      const userAddresses = mockUserAddresses.filter(addr => 
        addr.user_member.user_id === 'user-1-uuid-001'
      );
      mockPrisma.userAddress.findMany.mockResolvedValue(userAddresses);

      const result = await userAddressService.getAddressesByUserId('user-1-uuid-001');

      expect(mockPrisma.userAddress.findMany).toHaveBeenCalledWith({
        where: {
          user_member: {
            user_id: 'user-1-uuid-001'
          }
        },
        orderBy: [
          { is_default: 'desc' },
          { created_at: 'desc' }
        ],
        include: expect.any(Object)
      });
      expect(result.length).toBe(userAddresses.length);
    });

    test('应该正确获取用户默认地址', async () => {
      const defaultAddress = mockUserAddresses.find(addr => 
        addr.user_member.user_id === 'user-1-uuid-001' && addr.is_default === 1
      );
      mockPrisma.userAddress.findFirst.mockResolvedValue(defaultAddress);

      const result = await userAddressService.getDefaultAddress('user-1-uuid-001');

      expect(mockPrisma.userAddress.findFirst).toHaveBeenCalledWith({
        where: {
          user_member: {
            user_id: 'user-1-uuid-001'
          },
          is_default: 1
        },
        include: expect.any(Object)
      });
      expect(result?.isDefault).toBe(true);
    });

    test('应该处理用户无默认地址的情况', async () => {
      mockPrisma.userAddress.findFirst.mockResolvedValue(null);

      const result = await userAddressService.getDefaultAddress('user-no-default');

      expect(result).toBeNull();
    });
  });

  // ==================== 地址创建功能测试 ====================
  describe('地址创建功能测试', () => {
    test('应该成功创建普通地址', async () => {
      const newAddress = {
        ...mockUserAddresses[0],
        id: 'new-addr-id',
        consignee: createAddressRequests.validNormal.receiverName,
        phone: createAddressRequests.validNormal.receiverPhone,
        is_default: 0
      };

      mockPrisma.userMember.findUnique.mockResolvedValue(testUserMembers.member1);
      mockPrisma.userAddress.create.mockResolvedValue(newAddress);

      const result = await userAddressService.createAddress(
        'member-1-uuid-001',
        createAddressRequests.validNormal
      );

      expect(mockPrisma.userMember.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-1-uuid-001' }
      });
      expect(mockPrisma.userAddress.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_member_id: 'member-1-uuid-001',
          consignee: createAddressRequests.validNormal.receiverName,
          phone: createAddressRequests.validNormal.receiverPhone,
          is_default: 0
        }),
        include: expect.any(Object)
      });
      expect(result.receiverName).toBe(createAddressRequests.validNormal.receiverName);
    });

    test('应该成功创建默认地址并更新其他地址状态', async () => {
      const newDefaultAddress = {
        ...mockUserAddresses[0],
        id: 'new-default-addr-id',
        consignee: createAddressRequests.validDefault.receiverName,
        is_default: 1
      };

      mockPrisma.userMember.findUnique.mockResolvedValue(testUserMembers.member1);
      mockPrisma.userAddress.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.userAddress.create.mockResolvedValue(newDefaultAddress);

      const result = await userAddressService.createAddress(
        'member-1-uuid-001',
        createAddressRequests.validDefault
      );

      expect(mockPrisma.userAddress.updateMany).toHaveBeenCalledWith({
        where: {
          user_member_id: 'member-1-uuid-001',
          is_default: 1
        },
        data: { is_default: 0 }
      });
      expect(result.isDefault).toBe(true);
    });

    test('应该验证用户会员存在性', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(null);

      await expect(
        userAddressService.createAddress(
          'non-existent-member',
          createAddressRequests.validNormal
        )
      ).rejects.toThrow('用户会员信息不存在');
    });

    test('应该验证地址信息有效性', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(testUserMembers.member1);

      await expect(
        userAddressService.createAddress(
          'member-1-uuid-001',
          invalidRequests.invalidReceiverName
        )
      ).rejects.toThrow('地址验证失败');
    });

    test('应该验证手机号格式', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(testUserMembers.member1);

      await expect(
        userAddressService.createAddress(
          'member-1-uuid-001',
          invalidRequests.invalidPhone
        )
      ).rejects.toThrow('手机号格式不正确');
    });

    test('应该验证详细地址长度', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(testUserMembers.member1);

      await expect(
        userAddressService.createAddress(
          'member-1-uuid-001',
          invalidRequests.shortDetailAddress
        )
      ).rejects.toThrow('详细地址长度应在5-100个字符之间');
    });
  });

  // ==================== 地址更新功能测试 ====================
  describe('地址更新功能测试', () => {
    test('应该成功更新地址信息', async () => {
      const existingAddress = mockUserAddresses[0];
      const updatedAddress = {
        ...existingAddress,
        consignee: updateAddressRequests.updateReceiver.receiverName,
        phone: updateAddressRequests.updateReceiver.receiverPhone,
        updated_at: new Date()
      };

      mockPrisma.userAddress.findUnique.mockResolvedValue(existingAddress);
      mockPrisma.userAddress.update.mockResolvedValue(updatedAddress);

      const result = await userAddressService.updateAddress(
        'addr-1-uuid-string-001',
        updateAddressRequests.updateReceiver
      );

      expect(mockPrisma.userAddress.update).toHaveBeenCalledWith({
        where: { id: 'addr-1-uuid-string-001' },
        data: expect.objectContaining({
          consignee: updateAddressRequests.updateReceiver.receiverName,
          phone: updateAddressRequests.updateReceiver.receiverPhone,
          updated_at: expect.any(Date)
        }),
        include: expect.any(Object)
      });
      expect(result.receiverName).toBe(updateAddressRequests.updateReceiver.receiverName);
    });

    test('应该成功设置为默认地址', async () => {
      const existingAddress = mockUserAddresses[1]; // 非默认地址
      const updatedAddress = { ...existingAddress, is_default: 1 };

      mockPrisma.userAddress.findUnique.mockResolvedValue(existingAddress);
      mockPrisma.userAddress.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.userAddress.update.mockResolvedValue(updatedAddress);

      const result = await userAddressService.updateAddress(
        'addr-2-uuid-string-002',
        updateAddressRequests.setDefault
      );

      expect(mockPrisma.userAddress.updateMany).toHaveBeenCalledWith({
        where: {
          user_member_id: existingAddress.user_member_id,
          is_default: 1,
          id: { not: 'addr-2-uuid-string-002' }
        },
        data: { is_default: 0 }
      });
      expect(result.isDefault).toBe(true);
    });

    test('应该验证地址存在性', async () => {
      mockPrisma.userAddress.findUnique.mockResolvedValue(null);

      await expect(
        userAddressService.updateAddress(
          'non-existent-addr',
          updateAddressRequests.updateReceiver
        )
      ).rejects.toThrow('地址不存在');
    });

    test('应该验证更新数据有效性', async () => {
      const existingAddress = mockUserAddresses[0];
      mockPrisma.userAddress.findUnique.mockResolvedValue(existingAddress);

      await expect(
        userAddressService.updateAddress(
          'addr-1-uuid-string-001',
          { receiverPhone: '1234567890' } // 无效手机号
        )
      ).rejects.toThrow('手机号格式不正确');
    });

    test('应该支持部分字段更新', async () => {
      const existingAddress = mockUserAddresses[0];
      const updatedAddress = {
        ...existingAddress,
        consignee: updateAddressRequests.partialUpdate.receiverName
      };

      mockPrisma.userAddress.findUnique.mockResolvedValue(existingAddress);
      mockPrisma.userAddress.update.mockResolvedValue(updatedAddress);

      const result = await userAddressService.updateAddress(
        'addr-1-uuid-string-001',
        updateAddressRequests.partialUpdate
      );

      expect(mockPrisma.userAddress.update).toHaveBeenCalledWith({
        where: { id: 'addr-1-uuid-string-001' },
        data: expect.objectContaining({
          consignee: updateAddressRequests.partialUpdate.receiverName,
          updated_at: expect.any(Date)
        }),
        include: expect.any(Object)
      });
    });
  });

  // ==================== 地址删除功能测试 ====================
  describe('地址删除功能测试', () => {
    test('应该成功删除地址', async () => {
      const addressToDelete = mockUserAddresses[0];
      mockPrisma.userAddress.findUnique.mockResolvedValue(addressToDelete);
      mockPrisma.userAddress.delete.mockResolvedValue(addressToDelete);

      await userAddressService.deleteAddress('addr-1-uuid-string-001');

      expect(mockPrisma.userAddress.findUnique).toHaveBeenCalledWith({
        where: { id: 'addr-1-uuid-string-001' }
      });
      expect(mockPrisma.userAddress.delete).toHaveBeenCalledWith({
        where: { id: 'addr-1-uuid-string-001' }
      });
    });

    test('应该验证地址存在性', async () => {
      mockPrisma.userAddress.findUnique.mockResolvedValue(null);

      await expect(
        userAddressService.deleteAddress('non-existent-addr')
      ).rejects.toThrow('地址不存在');

      expect(mockPrisma.userAddress.delete).not.toHaveBeenCalled();
    });

    test('应该处理删除操作异常', async () => {
      const addressToDelete = mockUserAddresses[0];
      mockPrisma.userAddress.findUnique.mockResolvedValue(addressToDelete);
      mockPrisma.userAddress.delete.mockRejectedValue(new Error('Database error'));

      await expect(
        userAddressService.deleteAddress('addr-1-uuid-string-001')
      ).rejects.toThrow('删除地址失败');
    });
  });

  // ==================== 默认地址管理测试 ====================
  describe('默认地址管理测试', () => {
    test('应该成功设置默认地址', async () => {
      const targetAddress = mockUserAddresses[1];
      mockPrisma.userAddress.findFirst.mockResolvedValue(targetAddress);
      
      // 简化事务处理，使用数组形式
      mockPrisma.$transaction.mockImplementation(async (operations: Promise<unknown>[]) => {
        const results: unknown[] = [];
        for (const operation of operations) {
          results.push(await operation);
        }
        return results;
      });

      await userAddressService.setDefaultAddress(
        'member-1-uuid-001',
        'addr-2-uuid-string-002'
      );

      expect(mockPrisma.userAddress.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'addr-2-uuid-string-002',
          user_member_id: 'member-1-uuid-001'
        }
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    test('应该验证地址归属权限', async () => {
      mockPrisma.userAddress.findFirst.mockResolvedValue(null);

      await expect(
        userAddressService.setDefaultAddress(
          'member-1-uuid-001',
          'other-user-addr'
        )
      ).rejects.toThrow('地址不存在或无权限操作');
    });
  });

  // ==================== 地址统计功能测试 ====================
  describe('地址统计功能测试', () => {
    test('应该正确计算地址统计信息', async () => {
      const provinceStats = [
        { province: '广东省', _count: { province: 2 } },
        { province: '浙江省', _count: { province: 2 } },
        { province: '北京市', _count: { province: 1 } },
        { province: '上海市', _count: { province: 1 } }
      ];

      mockPrisma.userAddress.count
        .mockResolvedValueOnce(6) // 总地址数
        .mockResolvedValueOnce(3); // 默认地址数
      mockPrisma.userAddress.groupBy.mockResolvedValue(provinceStats);

      const result = await userAddressService.getAddressStatistics();

      expect(result.totalAddresses).toBe(6);
      expect(result.defaultAddresses).toBe(3);
      expect(result.provinceStats).toHaveLength(4);
      expect(result.provinceStats[0]).toEqual({
        province: '广东省',
        count: 2
      });
    });

    test('应该正确处理统计查询', async () => {
      mockPrisma.userAddress.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrisma.userAddress.groupBy.mockResolvedValue([]);

      const result = await userAddressService.getAddressStatistics();

      expect(mockPrisma.userAddress.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.userAddress.groupBy).toHaveBeenCalledWith({
        by: ['province'],
        _count: { province: true },
        orderBy: { _count: { province: 'desc' } },
        take: 10
      });
      expect(result.provinceStats).toEqual([]);
    });
  });

  // ==================== 响应格式验证测试 ====================
  describe('响应格式验证测试', () => {
    test('应该返回正确的地址列表响应格式', async () => {
      mockPrisma.userAddress.count.mockResolvedValue(2);
      mockPrisma.userAddress.findMany.mockResolvedValue(mockUserAddresses.slice(0, 2));

      const result = await userAddressService.getAddressList(addressQueryParams.basicPagination);

      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('pages');
      expect(Array.isArray(result.list)).toBe(true);
    });

    test('应该返回正确的地址详情响应格式', async () => {
      mockPrisma.userAddress.findUnique.mockResolvedValue(mockUserAddresses[0]);

      const result = await userAddressService.getAddressById('addr-1-uuid-string-001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('receiverName');
      expect(result).toHaveProperty('receiverPhone');
      expect(result).toHaveProperty('province');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('district');
      expect(result).toHaveProperty('detailAddress');
      expect(result).toHaveProperty('isDefault');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    test('应该返回正确的统计信息响应格式', async () => {
      mockPrisma.userAddress.count
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(3);
      mockPrisma.userAddress.groupBy.mockResolvedValue([]);

      const result = await userAddressService.getAddressStatistics();

      expect(result).toHaveProperty('totalAddresses');
      expect(result).toHaveProperty('defaultAddresses');
      expect(result).toHaveProperty('provinceStats');
      expect(result).toHaveProperty('labelStats');
      expect(Array.isArray(result.provinceStats)).toBe(true);
      expect(Array.isArray(result.labelStats)).toBe(true);
    });
  });

  // ==================== 业务规则验证测试 ====================
  describe('业务规则验证测试', () => {
    test('应该验证收件人姓名规则', () => {
      const rules = addressBusinessRules.receiverNameRules;
      expect(rules.minLength).toBe(2);
      expect(rules.maxLength).toBe(20);
      expect(rules.allowedChars.test('张三')).toBe(true);
      expect(rules.allowedChars.test('John Doe')).toBe(true);
      expect(rules.allowedChars.test('123')).toBe(false);
    });

    test('应该验证手机号规则', () => {
      const rules = addressBusinessRules.phoneRules;
      expect(rules.pattern.test('13800138001')).toBe(true);
      expect(rules.pattern.test('19900199001')).toBe(true);
      expect(rules.pattern.test('12800128001')).toBe(false);
      expect(rules.pattern.test('1380013800')).toBe(false);
    });

    test('应该验证地址字段规则', () => {
      const rules = addressBusinessRules.addressRules;
      expect(rules.province.minLength).toBe(1);
      expect(rules.detailAddress.minLength).toBe(5);
      expect(rules.detailAddress.maxLength).toBe(100);
    });

    test('应该验证邮政编码规则', () => {
      const rules = addressBusinessRules.postalCodeRules;
      expect(rules.pattern.test('100000')).toBe(true);
      expect(rules.pattern.test('12345')).toBe(false);
      expect(rules.pattern.test('abcdef')).toBe(false);
    });

    test('应该验证地址数量限制', () => {
      const limits = addressBusinessRules.limits;
      expect(limits.maxAddressesPerUser).toBe(10);
      expect(limits.defaultAddressLimit).toBe(1);
    });
  });

  // ==================== 错误场景处理测试 ====================
  describe('错误场景处理测试', () => {
    test('应该处理数据库连接错误', async () => {
      mockPrisma.userAddress.findMany.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        userAddressService.getAddressList(addressQueryParams.basicPagination)
      ).rejects.toThrow('获取用户地址列表失败');
    });

    test('应该处理用户不存在错误', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(null);

      await expect(
        userAddressService.createAddress(
          'non-existent-member',
          createAddressRequests.validNormal
        )
      ).rejects.toThrow('用户会员信息不存在');
    });

    test('应该处理地址不存在错误', async () => {
      mockPrisma.userAddress.findUnique.mockResolvedValue(null);

      await expect(
        userAddressService.getAddressById('non-existent-addr')
      ).rejects.toThrow('地址不存在');
    });

    test('应该处理权限验证错误', async () => {
      mockPrisma.userAddress.findFirst.mockResolvedValue(null);

      await expect(
        userAddressService.setDefaultAddress(
          'member-1-uuid-001',
          'other-user-addr'
        )
      ).rejects.toThrow('地址不存在或无权限操作');
    });

    test('应该处理数据验证错误', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(testUserMembers.member1);

      await expect(
        userAddressService.createAddress(
          'member-1-uuid-001',
          invalidRequests.emptyFields
        )
      ).rejects.toThrow('创建地址失败');
    });
  });

  // ==================== 性能和边界测试 ====================
  describe('性能和边界测试', () => {
    test('应该处理大数据量查询', async () => {
      const largeDataCount = 10000;
      mockPrisma.userAddress.count.mockResolvedValue(largeDataCount);
      mockPrisma.userAddress.findMany.mockResolvedValue(mockUserAddresses);

      const result = await userAddressService.getAddressList({
        page: 1,
        size: 100
      });

      expect(result.total).toBe(largeDataCount);
      expect(result.pages).toBe(100);
    });

    test('应该处理分页边界值', async () => {
      mockPrisma.userAddress.count.mockResolvedValue(1);
      mockPrisma.userAddress.findMany.mockResolvedValue([mockUserAddresses[0]]);

      const result = await userAddressService.getAddressList({
        page: 1,
        size: 1
      });

      expect(result.page).toBe(1);
      expect(result.size).toBe(1);
      expect(result.pages).toBe(1);
    });

    test('应该处理极值参数', async () => {
      mockPrisma.userAddress.count.mockResolvedValue(0);
      mockPrisma.userAddress.findMany.mockResolvedValue([]);

      const result = await userAddressService.getAddressList({
        page: 999,
        size: 1
      });

      expect(result.total).toBe(0);
      expect(result.list).toEqual([]);
    });

    test('应该验证地址字段长度极值', async () => {
      mockPrisma.userMember.findUnique.mockResolvedValue(testUserMembers.member1);

      // 测试最长地址
      await expect(
        userAddressService.createAddress(
          'member-1-uuid-001',
          invalidRequests.longDetailAddress
        )
      ).rejects.toThrow('详细地址长度应在5-100个字符之间');
    });
  });

  // ==================== 数据完整性验证测试 ====================
  describe('数据完整性验证测试', () => {
    test('应该确保必填字段完整性', () => {
      const address = mockUserAddresses[0];
      const requiredFields = [
        'id', 'user_member_id', 'consignee', 'phone',
        'province', 'city', 'district', 'address', 'is_default'
      ];

      requiredFields.forEach(field => {
        expect(address[field]).toBeDefined();
        expect(address[field]).not.toBe('');
        expect(address[field]).not.toBeNull();
      });
    });

    test('应该验证用户关联关系完整性', () => {
      const addressWithUser = mockUserAddresses[0];
      expect(addressWithUser.user_member.user_id).toBe('user-1-uuid-001');
      expect(addressWithUser.user_member.user.id).toBe('user-1-uuid-001');
    });

    test('应该验证时间戳数据完整性', () => {
      mockUserAddresses.forEach(address => {
        expect(address.created_at).toBeInstanceOf(Date);
        expect(address.updated_at).toBeInstanceOf(Date);
        expect(address.created_at.getTime()).toBeLessThanOrEqual(new Date().getTime());
        expect(address.updated_at.getTime()).toBeLessThanOrEqual(new Date().getTime());
      });
    });

    test('应该验证默认地址逻辑完整性', () => {
      // 每个用户应该最多有一个默认地址
      const userAddressesByUser = mockUserAddresses.reduce((acc: Record<string, any[]>, addr) => {
        const userId = addr.user_member.user_id;
        if (!acc[userId]) acc[userId] = [];
        acc[userId].push(addr);
        return acc;
      }, {});

      Object.values(userAddressesByUser).forEach((userAddresses: any[]) => {
        const defaultAddresses = userAddresses.filter((addr: any) => addr.is_default === 1);
        expect(defaultAddresses.length).toBeLessThanOrEqual(1);
      });
    });

    test('应该验证地址ID唯一性', () => {
      const addressIds = mockUserAddresses.map(addr => addr.id);
      const uniqueIds = new Set(addressIds);
      expect(uniqueIds.size).toBe(addressIds.length);
    });

    test('应该验证地址数据关联性', () => {
      mockUserAddresses.forEach(address => {
        expect(address.user_member_id).toBe(address.user_member.id);
        expect(address.user_member.user_id).toBe(address.user_member.user.id);
      });
    });
  });
}); 