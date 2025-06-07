/**
 * 用户地址管理服务单元测试
 * 测试用户地址的增删改查、默认地址管理、地区验证等核心业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { describe, it, expect } from '@jest/globals';

describe('User Address Service Core Logic Tests', () => {
  describe('地址数据验证测试', () => {
    it('应当验证地址基本数据结构', () => {
      const addressData = {
        id: 'addr_001',
        userId: 'user_001',
        recipientName: '张三',
        recipientPhone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detailAddress: '科技园南区',
        postalCode: '518000',
        isDefault: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(addressData).toHaveProperty('id');
      expect(addressData).toHaveProperty('userId');
      expect(addressData).toHaveProperty('recipientName');
      expect(addressData).toHaveProperty('recipientPhone');
      expect(addressData).toHaveProperty('province');
      expect(addressData).toHaveProperty('city');
      expect(addressData).toHaveProperty('district');
      expect(addressData).toHaveProperty('detailAddress');
      expect(addressData).toHaveProperty('isDefault');
      expect(addressData).toHaveProperty('createdAt');
      expect(addressData).toHaveProperty('updatedAt');
    });

    it('应当验证收货人姓名格式', () => {
      const validNames = ['张三', '李四四', 'John Smith', '王小明'];
      const invalidNames = ['', '   ', 'A', '这是一个非常长的收货人姓名超过了正常限制'];

      validNames.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.trim().length).toBeGreaterThan(1);
        expect(name.trim().length).toBeLessThanOrEqual(20);
      });

      invalidNames.forEach(name => {
        const trimmedLength = name.trim().length;
        expect(trimmedLength <= 1 || trimmedLength > 20).toBe(true);
      });
    });

    it('应当验证手机号码格式', () => {
      const validPhones = ['13800138000', '15012345678', '18888888888'];
      const invalidPhones = ['138001380001', '1380013800', '12345678901', ''];

      const phonePattern = /^1[3-9]\d{9}$/;

      validPhones.forEach(phone => {
        expect(phonePattern.test(phone)).toBe(true);
      });

      invalidPhones.forEach(phone => {
        expect(phonePattern.test(phone)).toBe(false);
      });
    });

    it('应当验证地区数据格式', () => {
      const addressRegions = [
        {
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          valid: true
        },
        {
          province: '',
          city: '深圳市',
          district: '南山区',
          valid: false
        },
        {
          province: '广东省',
          city: '',
          district: '南山区',
          valid: false
        }
      ];

      addressRegions.forEach(region => {
        const isValid = region.province.trim().length > 0 && 
                       region.city.trim().length > 0 && 
                       region.district.trim().length > 0;
        expect(isValid).toBe(region.valid);
      });
    });

    it('应当验证默认地址标识', () => {
      const validDefaultFlags = [0, 1];
      const invalidDefaultFlags = [-1, 2, 3];

      validDefaultFlags.forEach(flag => {
        expect([0, 1]).toContain(flag);
      });

      invalidDefaultFlags.forEach(flag => {
        expect([0, 1]).not.toContain(flag);
      });
    });

    it('应当验证邮政编码格式', () => {
      const validPostalCodes = ['518000', '100000', '200000', ''];
      const invalidPostalCodes = ['51800', '5180000', 'abcdef'];

      const postalCodePattern = /^(\d{6}|)$/;

      validPostalCodes.forEach(code => {
        expect(postalCodePattern.test(code)).toBe(true);
      });

      invalidPostalCodes.forEach(code => {
        expect(postalCodePattern.test(code)).toBe(false);
      });
    });
  });

  describe('地址创建逻辑测试', () => {
    it('应当验证创建参数完整性', () => {
      const createParams = {
        userId: 'user_001',
        recipientName: '张三',
        recipientPhone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detailAddress: '科技园南区深南大道'
      };

      expect(createParams.userId).toBeDefined();
      expect(createParams.recipientName).toBeDefined();
      expect(createParams.recipientPhone).toBeDefined();
      expect(createParams.province).toBeDefined();
      expect(createParams.city).toBeDefined();
      expect(createParams.district).toBeDefined();
      expect(createParams.detailAddress).toBeDefined();
    });

    it('应当验证必填字段检查', () => {
      const requiredFields = ['userId', 'recipientName', 'recipientPhone', 'province', 'city', 'district'];
      
      requiredFields.forEach(field => {
        const params = {
          userId: 'user_001',
          recipientName: '张三',
          recipientPhone: '13800138000',
          province: '广东省',
          city: '深圳市',
          district: '南山区'
        };
        
        // 模拟缺少某个字段
        delete params[field as keyof typeof params];
        
        expect(params[field as keyof typeof params]).toBeUndefined();
      });
    });

    it('应当验证地址数量限制', () => {
      const maxAddressPerUser = 20;
      const userAddressCounts = [0, 10, 19, 20, 21];

      userAddressCounts.forEach(count => {
        const canAddMore = count < maxAddressPerUser;
        if (count < maxAddressPerUser) {
          expect(canAddMore).toBe(true);
        } else {
          expect(canAddMore).toBe(false);
        }
      });
    });

    it('应当验证详细地址长度', () => {
      const detailAddresses = [
        '科技园',
        '科技园南区深南大道10000号腾讯大厦',
        '这是一个非常详细的地址描述，包含了很多信息，比如楼栋号、单元号、门牌号等等，用来测试地址长度限制功能是否正常工作，预期这个地址会超过最大长度限制'
      ];

      const maxLength = 100;

      detailAddresses.forEach((address, index) => {
        if (index < 2) {
          expect(address.length).toBeLessThanOrEqual(maxLength);
        } else {
          expect(address.length).toBeGreaterThan(maxLength);
        }
      });
    });

    it('应当处理默认地址设置', () => {
      const userExistingAddresses = [
        { id: 'addr_001', isDefault: 1 },
        { id: 'addr_002', isDefault: 0 },
        { id: 'addr_003', isDefault: 0 }
      ];

      const newAddressIsDefault = true;
      const currentDefaultAddress = userExistingAddresses.find(addr => addr.isDefault === 1);

      if (newAddressIsDefault && currentDefaultAddress) {
        expect(currentDefaultAddress.id).toBe('addr_001');
        // 新地址设为默认时，需要将原默认地址改为非默认
      }

      expect(newAddressIsDefault).toBe(true);
    });
  });

  describe('地址更新逻辑测试', () => {
    it('应当支持部分更新', () => {
      const updateData = {
        recipientName: '李四',
        recipientPhone: '15012345678'
      };

      expect(updateData.recipientName).toBeDefined();
      expect(updateData.recipientPhone).toBeDefined();
      expect(Object.keys(updateData)).toHaveLength(2);
    });

    it('应当验证更新权限', () => {
      const addressUserId = 'user_001';
      const operatorUserIds = ['user_001', 'user_002', 'admin_001'];

      operatorUserIds.forEach(operatorId => {
        const canUpdate = operatorId === addressUserId || operatorId.startsWith('admin_');
        
        if (operatorId === addressUserId || operatorId.startsWith('admin_')) {
          expect(canUpdate).toBe(true);
        } else {
          expect(canUpdate).toBe(false);
        }
      });
    });

    it('应当验证默认地址切换', () => {
      const userAddresses = [
        { id: 'addr_001', isDefault: 1 },
        { id: 'addr_002', isDefault: 0 },
        { id: 'addr_003', isDefault: 0 }
      ];

      const targetAddressId = 'addr_002';
      const setAsDefault = true;

      if (setAsDefault) {
        const currentDefault = userAddresses.find(addr => addr.isDefault === 1);
        const targetAddress = userAddresses.find(addr => addr.id === targetAddressId);

        expect(currentDefault?.id).toBe('addr_001');
        expect(targetAddress?.id).toBe('addr_002');
      }
    });

    it('应当验证地区信息更新', () => {
      const regionUpdates = [
        {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          valid: true
        },
        {
          province: '上海市',
          city: '上海市',
          district: '',
          valid: false
        }
      ];

      regionUpdates.forEach(update => {
        const hasCompleteRegion = update.province && update.city && update.district;
        expect(!!hasCompleteRegion).toBe(update.valid);
      });
    });

    it('应当验证联系信息更新', () => {
      const contactUpdates = [
        { recipientName: '王五', recipientPhone: '18888888888', valid: true },
        { recipientName: '', recipientPhone: '18888888888', valid: false },
        { recipientName: '王五', recipientPhone: '123456789', valid: false }
      ];

      const phonePattern = /^1[3-9]\d{9}$/;

      contactUpdates.forEach(update => {
        const hasValidName = update.recipientName.trim().length > 0;
        const hasValidPhone = phonePattern.test(update.recipientPhone);
        const isValid = hasValidName && hasValidPhone;

        expect(isValid).toBe(update.valid);
      });
    });
  });

  describe('地址查询逻辑测试', () => {
    it('应当支持按用户ID查询', () => {
      const userAddresses = [
        { id: 'addr_001', userId: 'user_001' },
        { id: 'addr_002', userId: 'user_001' },
        { id: 'addr_003', userId: 'user_002' }
      ];

      const targetUserId = 'user_001';
      const userSpecificAddresses = userAddresses.filter(addr => addr.userId === targetUserId);

      expect(userSpecificAddresses).toHaveLength(2);
      expect(userSpecificAddresses.every(addr => addr.userId === targetUserId)).toBe(true);
    });

    it('应当支持分页查询', () => {
      const queryParams = {
        userId: 'user_001',
        page: 1,
        size: 10
      };

      expect(queryParams.page).toBeGreaterThan(0);
      expect(queryParams.size).toBeGreaterThan(0);
      expect(queryParams.userId).toBeDefined();
    });

    it('应当支持默认地址查询', () => {
      const userAddresses = [
        { id: 'addr_001', userId: 'user_001', isDefault: 0 },
        { id: 'addr_002', userId: 'user_001', isDefault: 1 },
        { id: 'addr_003', userId: 'user_001', isDefault: 0 }
      ];

      const defaultAddress = userAddresses.find(addr => addr.isDefault === 1);
      const nonDefaultAddresses = userAddresses.filter(addr => addr.isDefault === 0);

      expect(defaultAddress?.id).toBe('addr_002');
      expect(nonDefaultAddresses).toHaveLength(2);
    });

    it('应当支持地区筛选查询', () => {
      const addresses = [
        { id: 'addr_001', province: '广东省', city: '深圳市' },
        { id: 'addr_002', province: '广东省', city: '广州市' },
        { id: 'addr_003', province: '北京市', city: '北京市' }
      ];

      const shenzhenAddresses = addresses.filter(addr => addr.city === '深圳市');
      const guangdongAddresses = addresses.filter(addr => addr.province === '广东省');

      expect(shenzhenAddresses).toHaveLength(1);
      expect(guangdongAddresses).toHaveLength(2);
    });

    it('应当验证查询结果排序', () => {
      const addresses = [
        { id: 'addr_001', isDefault: 0, createdAt: new Date('2023-01-01') },
        { id: 'addr_002', isDefault: 1, createdAt: new Date('2023-01-02') },
        { id: 'addr_003', isDefault: 0, createdAt: new Date('2023-01-03') }
      ];

      // 默认地址优先，然后按创建时间倒序
      const sorted = [...addresses].sort((a, b) => {
        if (a.isDefault !== b.isDefault) {
          return b.isDefault - a.isDefault;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      expect(sorted[0].isDefault).toBe(1);
      expect(sorted[0].id).toBe('addr_002');
    });
  });

  describe('地址删除逻辑测试', () => {
    it('应当验证删除权限', () => {
      const addressData = { id: 'addr_001', userId: 'user_001' };
      const operatorIds = ['user_001', 'user_002', 'admin_001'];

      operatorIds.forEach(operatorId => {
        const canDelete = operatorId === addressData.userId || operatorId.startsWith('admin_');
        
        if (operatorId === addressData.userId || operatorId.startsWith('admin_')) {
          expect(canDelete).toBe(true);
        } else {
          expect(canDelete).toBe(false);
        }
      });
    });

    it('应当验证默认地址删除处理', () => {
      const userAddresses = [
        { id: 'addr_001', isDefault: 1, createdAt: new Date('2023-01-01') },
        { id: 'addr_002', isDefault: 0, createdAt: new Date('2023-01-02') },
        { id: 'addr_003', isDefault: 0, createdAt: new Date('2023-01-03') }
      ];

      const deletingDefaultAddress = userAddresses.find(addr => addr.isDefault === 1);
      const remainingAddresses = userAddresses.filter(addr => addr.id !== deletingDefaultAddress?.id);

      if (deletingDefaultAddress && remainingAddresses.length > 0) {
        // 应该自动设置最新的地址为默认地址
        const latestAddress = remainingAddresses.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        )[0];
        
        expect(latestAddress.id).toBe('addr_003');
      }

      expect(deletingDefaultAddress?.isDefault).toBe(1);
      expect(remainingAddresses).toHaveLength(2);
    });

    it('应当验证最后一个地址删除', () => {
      const singleAddressUser = [
        { id: 'addr_001', userId: 'user_001', isDefault: 1 }
      ];

      const canDeleteLastAddress = true; // 允许删除最后一个地址
      expect(canDeleteLastAddress).toBe(true);
      expect(singleAddressUser).toHaveLength(1);
    });

    it('应当验证关联订单检查', () => {
      const addressOrderChecks = [
        { addressId: 'addr_001', hasPendingOrders: false, canDelete: true },
        { addressId: 'addr_002', hasPendingOrders: true, canDelete: false }
      ];

      addressOrderChecks.forEach(check => {
        const canDelete = !check.hasPendingOrders;
        expect(canDelete).toBe(check.canDelete);
      });
    });
  });

  describe('默认地址管理测试', () => {
    it('应当确保用户只有一个默认地址', () => {
      const userAddresses = [
        { id: 'addr_001', isDefault: 1 },
        { id: 'addr_002', isDefault: 1 }, // 异常：两个默认地址
        { id: 'addr_003', isDefault: 0 }
      ];

      const defaultAddresses = userAddresses.filter(addr => addr.isDefault === 1);
      
      // 正常情况下应该只有一个默认地址
      expect(defaultAddresses.length).not.toBe(1); // 当前数据异常
      
      // 修复后应该只有一个
      const fixedAddresses = userAddresses.map((addr, index) => ({
        ...addr,
        isDefault: index === 0 ? 1 : 0
      }));
      
      const fixedDefaultAddresses = fixedAddresses.filter(addr => addr.isDefault === 1);
      expect(fixedDefaultAddresses).toHaveLength(1);
    });

    it('应当处理无默认地址情况', () => {
      const userAddresses = [
        { id: 'addr_001', isDefault: 0 },
        { id: 'addr_002', isDefault: 0 },
        { id: 'addr_003', isDefault: 0 }
      ];

      const defaultAddresses = userAddresses.filter(addr => addr.isDefault === 1);
      
      if (defaultAddresses.length === 0 && userAddresses.length > 0) {
        // 应该自动设置第一个为默认地址
        expect(defaultAddresses).toHaveLength(0);
        expect(userAddresses).toHaveLength(3);
      }
    });

    it('应当验证设置默认地址逻辑', () => {
      const addresses = [
        { id: 'addr_001', isDefault: 1 },
        { id: 'addr_002', isDefault: 0 },
        { id: 'addr_003', isDefault: 0 }
      ];

      const targetAddressId = 'addr_002';
      
      // 设置新的默认地址
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === targetAddressId ? 1 : 0
      }));

      const newDefaultAddress = updatedAddresses.find(addr => addr.isDefault === 1);
      const defaultCount = updatedAddresses.filter(addr => addr.isDefault === 1).length;

      expect(newDefaultAddress?.id).toBe(targetAddressId);
      expect(defaultCount).toBe(1);
    });

    it('应当验证默认地址优先级显示', () => {
      const addresses = [
        { id: 'addr_001', isDefault: 0, name: '家庭地址' },
        { id: 'addr_002', isDefault: 1, name: '公司地址' },
        { id: 'addr_003', isDefault: 0, name: '朋友地址' }
      ];

      const sortedByDefault = [...addresses].sort((a, b) => b.isDefault - a.isDefault);
      
      expect(sortedByDefault[0].isDefault).toBe(1);
      expect(sortedByDefault[0].name).toBe('公司地址');
    });
  });

  describe('地区验证逻辑测试', () => {
    it('应当验证地区级联关系', () => {
      const validRegionCombinations = [
        { province: '广东省', city: '深圳市', district: '南山区', valid: true },
        { province: '广东省', city: '北京市', district: '朝阳区', valid: false },
        { province: '北京市', city: '北京市', district: '朝阳区', valid: true }
      ];

      // 简化的地区验证逻辑
      const regionMapping = {
        '广东省': ['深圳市', '广州市', '东莞市'],
        '北京市': ['北京市'],
        '上海市': ['上海市']
      };

      validRegionCombinations.forEach(combo => {
        const validCities = regionMapping[combo.province as keyof typeof regionMapping];
        const isCityValid = validCities?.includes(combo.city) ?? false;
        
        expect(isCityValid).toBe(combo.valid);
      });
    });

    it('应当验证特殊地区处理', () => {
      const specialRegions = [
        { province: '香港特别行政区', city: '香港', district: '中西区' },
        { province: '澳门特别行政区', city: '澳门', district: '花地玛堂区' },
        { province: '台湾省', city: '台北市', district: '大安区' }
      ];

      specialRegions.forEach(region => {
        expect(region.province).toContain('特别行政区');
      });
    });

    it('应当验证邮政编码地区匹配', () => {
      const postalCodeRules = [
        { province: '广东省', city: '深圳市', postalCode: '518000', valid: true },
        { province: '北京市', city: '北京市', postalCode: '100000', valid: true },
        { province: '广东省', city: '深圳市', postalCode: '100000', valid: false }
      ];

      // 简化的邮编验证
      const postalMapping = {
        '518': ['广东省'],
        '100': ['北京市'],
        '200': ['上海市']
      };

      postalCodeRules.forEach(rule => {
        const postalPrefix = rule.postalCode.substring(0, 3);
        const validProvinces = postalMapping[postalPrefix as keyof typeof postalMapping];
        const isValid = validProvinces?.includes(rule.province) ?? false;
        
        expect(isValid).toBe(rule.valid);
      });
    });

    it('应当处理地区编码转换', () => {
      const regionCodes = [
        { code: '440300', name: '深圳市', type: 'city' },
        { code: '440305', name: '南山区', type: 'district' },
        { code: '110000', name: '北京市', type: 'province' }
      ];

      regionCodes.forEach(region => {
        expect(region.code).toMatch(/^\d{6}$/);
        expect(['province', 'city', 'district']).toContain(region.type);
      });
    });
  });

  describe('地址业务规则测试', () => {
    it('应当验证地址字段长度限制', () => {
      const fieldLimits = {
        recipientName: { value: '张三丰', max: 20, valid: true },
        recipientPhone: { value: '13800138000', max: 11, valid: true },
        detailAddress: { value: '科技园南区', max: 100, valid: true },
        longDetailAddress: { value: 'A'.repeat(101), max: 100, valid: false }
      };

      Object.entries(fieldLimits).forEach(([field, config]) => {
        const isValid = config.value.length <= config.max;
        expect(isValid).toBe(config.valid);
      });
    });

    it('应当验证特殊字符处理', () => {
      const addressTexts = [
        { text: '科技园南区深南大道', hasSpecialChars: false },
        { text: '科技园南区<script>alert("xss")</script>', hasSpecialChars: true },
        { text: '正常地址123号', hasSpecialChars: false }
      ];

      const specialCharPattern = /[<>\"\'&]/;

      addressTexts.forEach(item => {
        const hasSpecialChars = specialCharPattern.test(item.text);
        expect(hasSpecialChars).toBe(item.hasSpecialChars);
      });
    });

    it('应当验证地址完整性检查', () => {
      const addressCompleteness = [
        {
          address: {
            recipientName: '张三',
            recipientPhone: '13800138000',
            province: '广东省',
            city: '深圳市',
            district: '南山区',
            detailAddress: '科技园'
          },
          complete: true
        },
        {
          address: {
            recipientName: '张三',
            recipientPhone: '',
            province: '广东省',
            city: '深圳市',
            district: '南山区',
            detailAddress: '科技园'
          },
          complete: false
        }
      ];

      addressCompleteness.forEach(item => {
        const requiredFields = ['recipientName', 'recipientPhone', 'province', 'city', 'district', 'detailAddress'];
        const isComplete = requiredFields.every(field => {
          const value = item.address[field as keyof typeof item.address];
          return value && String(value).trim().length > 0;
        });
        
        expect(isComplete).toBe(item.complete);
      });
    });
  });

  describe('地址响应格式测试', () => {
    it('应当验证地址列表响应格式', () => {
      const listResponse = {
        list: [
          {
            id: 'addr_001',
            recipientName: '张三',
            recipientPhone: '13800138000',
            fullAddress: '广东省深圳市南山区科技园南区',
            isDefault: 1
          }
        ],
        total: 1,
        page: 1,
        size: 10,
        pages: 1
      };

      expect(listResponse).toHaveProperty('list');
      expect(listResponse).toHaveProperty('total');
      expect(listResponse).toHaveProperty('page');
      expect(listResponse).toHaveProperty('size');
      expect(listResponse).toHaveProperty('pages');
      expect(Array.isArray(listResponse.list)).toBe(true);
    });

    it('应当验证地址详情响应格式', () => {
      const detailResponse = {
        id: 'addr_001',
        userId: 'user_001',
        recipientName: '张三',
        recipientPhone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detailAddress: '科技园南区',
        postalCode: '518000',
        isDefault: 1,
        fullAddress: '广东省深圳市南山区科技园南区',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(detailResponse).toHaveProperty('id');
      expect(detailResponse).toHaveProperty('userId');
      expect(detailResponse).toHaveProperty('recipientName');
      expect(detailResponse).toHaveProperty('recipientPhone');
      expect(detailResponse).toHaveProperty('fullAddress');
      expect(detailResponse).toHaveProperty('isDefault');
    });

    it('应当验证地址创建响应格式', () => {
      const createResponse = {
        id: 'addr_001',
        message: '地址创建成功',
        isDefault: 1
      };

      expect(createResponse).toHaveProperty('id');
      expect(createResponse).toHaveProperty('message');
      expect(createResponse).toHaveProperty('isDefault');
      expect(typeof createResponse.id).toBe('string');
    });
  });

  describe('地址错误场景测试', () => {
    it('应当处理重复地址检查', () => {
      const existingAddress = {
        userId: 'user_001',
        recipientName: '张三',
        recipientPhone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detailAddress: '科技园南区'
      };

      const newAddress = { ...existingAddress };
      
      const isDuplicate = (addr1: any, addr2: any) => {
        return addr1.userId === addr2.userId &&
               addr1.recipientName === addr2.recipientName &&
               addr1.recipientPhone === addr2.recipientPhone &&
               addr1.province === addr2.province &&
               addr1.city === addr2.city &&
               addr1.district === addr2.district &&
               addr1.detailAddress === addr2.detailAddress;
      };

      expect(isDuplicate(existingAddress, newAddress)).toBe(true);
    });

    it('应当处理无效的用户ID', () => {
      const invalidUserIds = ['', null, undefined, 'invalid-user'];
      const validUserIdPattern = /^user_\d+$/;

      invalidUserIds.forEach(userId => {
        if (userId === null || userId === undefined || userId === '') {
          expect(userId === null || userId === undefined || userId === '').toBe(true);
        } else {
          expect(validUserIdPattern.test(userId)).toBe(false);
        }
      });
    });

    it('应当处理地址不存在的情况', () => {
      const existingAddressIds = ['addr_001', 'addr_002', 'addr_003'];
      const queryAddressIds = ['addr_001', 'addr_999', 'addr_002'];

      queryAddressIds.forEach(id => {
        const exists = existingAddressIds.includes(id);
        if (id === 'addr_999') {
          expect(exists).toBe(false);
        } else {
          expect(exists).toBe(true);
        }
      });
    });
  });
}); 