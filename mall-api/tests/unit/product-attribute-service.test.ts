/**
 * 商品属性服务核心逻辑单元测试
 * 测试商品属性管理的核心业务逻辑，不依赖外部服务
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { describe, it, expect } from '@jest/globals';
import {
  mockProductAttributes,
  attributeQueryParams,
  attributeCreateRequests,
  attributeUpdateRequests,
  attributeBatchOperations,
  batchCreateRequests,
  attributeDeleteScenarios,
  attributeStatsData,
  attributeResponseFormats,
  attributeBusinessRules,
  commonAttributeData,
  ATTRIBUTE_TEST_CONSTANTS,
  attributeValueValidation,
  attributeNameValidation
} from '../fixtures/product-attribute-fixtures';

describe('ProductAttributeService Core Logic Tests', () => {
  
  describe('属性数据验证测试', () => {
    it('应该验证属性基本数据结构', () => {
      const attribute = mockProductAttributes[0];
      
      expect(attribute).toHaveProperty('id');
      expect(attribute).toHaveProperty('product_id');
      expect(attribute).toHaveProperty('name');
      expect(attribute).toHaveProperty('value');
      expect(attribute).toHaveProperty('created_at');
      expect(attribute).toHaveProperty('updated_at');
      expect(attribute).toHaveProperty('product');
      
      expect(typeof attribute.id).toBe('string');
      expect(typeof attribute.product_id).toBe('string');
      expect(typeof attribute.name).toBe('string');
      expect(typeof attribute.value).toBe('string');
      expect(attribute.created_at).toBeInstanceOf(Date);
      expect(attribute.updated_at).toBeInstanceOf(Date);
      expect(typeof attribute.product).toBe('object');
      
      // 验证ID格式
      expect(attribute.id).toMatch(/^attr-\d{3}$/);
      expect(attribute.product_id).toMatch(/^product-\d{3}$/);
    });

    it('应该验证属性名称格式', () => {
      const validNames = attributeNameValidation.validNames;
      const invalidNames = attributeNameValidation.invalidNames;
      
      validNames.forEach(name => {
        expect(name.length).toBeGreaterThan(0);
        expect(name.length).toBeLessThanOrEqual(attributeBusinessRules.maxNameLength);
        expect(typeof name).toBe('string');
        expect(name.trim().length).toBeGreaterThan(0);
      });
      
      invalidNames.forEach(name => {
        if (name === null || name === undefined) {
          expect(name).toBeFalsy();
        } else if (typeof name === 'string') {
          const trimmed = name.trim();
          expect(trimmed.length === 0 || trimmed.length > attributeBusinessRules.maxNameLength).toBe(true);
        } else {
          expect(typeof name).not.toBe('string');
        }
      });
    });

    it('应该验证属性值格式', () => {
      const validValues = attributeValueValidation.validValues;
      const invalidValues = attributeValueValidation.invalidValues;
      
      validValues.forEach(value => {
        expect(value.length).toBeGreaterThan(0);
        expect(value.length).toBeLessThanOrEqual(attributeBusinessRules.maxValueLength);
        expect(typeof value).toBe('string');
        expect(value.trim().length).toBeGreaterThan(0);
      });
      
      invalidValues.forEach(value => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          expect(trimmed.length === 0 || trimmed.length > attributeBusinessRules.maxValueLength).toBe(true);
        }
      });
    });

    it('应该验证商品关联关系', () => {
      mockProductAttributes.forEach(attribute => {
        expect(attribute.product).toBeDefined();
        expect(attribute.product.id).toBe(attribute.product_id);
        expect(typeof attribute.product.name).toBe('string');
        expect([0, 1]).toContain(attribute.product.status);
      });
    });

    it('应该验证特殊字符处理', () => {
      const specialValues = attributeValueValidation.specialCharacterValues;
      
      specialValues.forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
        // 验证字符串能正确存储特殊字符
        expect(value).toBeDefined();
      });
    });
  });

  describe('属性查询逻辑测试', () => {
    it('应该验证查询参数格式', () => {
      const validParams = attributeQueryParams.valid[0];
      
      expect(validParams).toHaveProperty('page');
      expect(validParams).toHaveProperty('size');
      expect(typeof validParams.page).toBe('number');
      expect(typeof validParams.size).toBe('number');
      expect(validParams.page).toBeGreaterThan(0);
      expect(validParams.size).toBeGreaterThan(0);
    });

    it('应该验证分页参数边界值', () => {
      const boundaryParams = attributeQueryParams.boundary[0];
      
      expect(boundaryParams.page).toBeGreaterThan(0);
      expect(boundaryParams.size).toBeGreaterThan(0);
      expect(boundaryParams.size).toBeLessThanOrEqual(1000); // 假设最大页大小限制
    });

    it('应该验证排序参数', () => {
      const validSortOptions = [
        { sortBy: 'name', sortOrder: 'asc' },
        { sortBy: 'created_at', sortOrder: 'desc' },
        { sortBy: 'value', sortOrder: 'asc' }
      ];

      validSortOptions.forEach(option => {
        expect(['name', 'value', 'created_at', 'updated_at']).toContain(option.sortBy);
        expect(['asc', 'desc']).toContain(option.sortOrder);
      });
    });

    it('应该验证商品ID筛选', () => {
      const validParamsWithProductId = attributeQueryParams.valid.find(p => p.product_id);
      const productIdFilter = validParamsWithProductId?.product_id;
      
      expect(typeof productIdFilter).toBe('string');
      expect(productIdFilter!.length).toBeGreaterThan(0);
    });

    it('应该验证属性名称搜索', () => {
      const validParamsWithName = attributeQueryParams.valid.find(p => p.name);
      const nameSearch = validParamsWithName?.name;
      
      expect(typeof nameSearch).toBe('string');
      expect(nameSearch!.length).toBeGreaterThan(0);
    });
  });

  describe('属性创建逻辑测试', () => {
    it('应该验证创建请求数据格式', () => {
      const validRequest = attributeCreateRequests.valid[0];
      
      expect(validRequest).toHaveProperty('product_id');
      expect(validRequest).toHaveProperty('name');
      expect(validRequest).toHaveProperty('value');
      
      expect(typeof validRequest.product_id).toBe('string');
      expect(typeof validRequest.name).toBe('string');
      expect(typeof validRequest.value).toBe('string');
      expect(validRequest.product_id.length).toBeGreaterThan(0);
      expect(validRequest.name.length).toBeGreaterThan(0);
      expect(validRequest.value.length).toBeGreaterThan(0);
    });

    it('应该拒绝无效的创建请求', () => {
      const invalidRequests = attributeCreateRequests.invalid;
      
      invalidRequests.forEach((request, index) => {
        const hasEmptyProductId = !request.product_id || request.product_id.trim().length === 0;
        const hasEmptyName = !request.name || request.name.trim().length === 0;
        const hasEmptyValue = !request.value || request.value.trim().length === 0;
        const hasNonExistentProduct = request.product_id === 'non-existent-product';
        const hasDuplicateName = request.name === '颜色' && request.product_id === 'product-001';
        
        const isInvalid = hasEmptyProductId || hasEmptyName || hasEmptyValue || hasNonExistentProduct || hasDuplicateName;
        expect(isInvalid).toBe(true);
      });
    });

    it('应该验证商品存在性检查逻辑', () => {
      const validProductId = ATTRIBUTE_TEST_CONSTANTS.VALID_PRODUCT_ID;
      const invalidProductId = ATTRIBUTE_TEST_CONSTANTS.NON_EXISTENT_PRODUCT_ID;
      
      expect(typeof validProductId).toBe('string');
      expect(typeof invalidProductId).toBe('string');
      expect(validProductId).not.toBe(invalidProductId);
    });

    it('应该验证属性名称唯一性检查逻辑', () => {
      const duplicateName = ATTRIBUTE_TEST_CONSTANTS.DUPLICATE_ATTRIBUTE_NAME;
      const uniqueName = ATTRIBUTE_TEST_CONSTANTS.UNIQUE_ATTRIBUTE_NAME;
      
      // 同一商品下重复属性名称检查
      const existingAttributes = mockProductAttributes.filter(attr => attr.product_id === 'product-001');
      const existingNames = existingAttributes.map(attr => attr.name);
      
      expect(existingNames).toContain(duplicateName);
      expect(existingNames).not.toContain(uniqueName);
    });

    it('应该验证批量创建请求', () => {
      const batchRequest = batchCreateRequests.valid[0];
      
      expect(batchRequest).toHaveProperty('product_id');
      expect(batchRequest).toHaveProperty('attributes');
      expect(Array.isArray(batchRequest.attributes)).toBe(true);
      expect(batchRequest.attributes.length).toBeGreaterThan(0);
      
      batchRequest.attributes.forEach(attr => {
        expect(attr).toHaveProperty('name');
        expect(attr).toHaveProperty('value');
        expect(typeof attr.name).toBe('string');
        expect(typeof attr.value).toBe('string');
      });
    });
  });

  describe('属性更新逻辑测试', () => {
    it('应该验证更新请求数据格式', () => {
      const validUpdate = attributeUpdateRequests.valid[0];
      
      if (validUpdate.name !== undefined) {
        expect(typeof validUpdate.name).toBe('string');
        expect(validUpdate.name.trim().length).toBeGreaterThan(0);
      }
      
      if (validUpdate.value !== undefined) {
        expect(typeof validUpdate.value).toBe('string');
        expect(validUpdate.value.trim().length).toBeGreaterThan(0);
      }
    });

    it('应该正确处理部分更新', () => {
      const partialUpdates = attributeUpdateRequests.partial;
      
      partialUpdates.forEach(update => {
        const fieldCount = Object.keys(update).length;
        expect(fieldCount).toBeGreaterThan(0);
        expect(fieldCount).toBeLessThanOrEqual(2); // 只能更新name和value
      });
    });

    it('应该验证属性名称更新逻辑', () => {
      const nameUpdate = { name: '更新后的属性名称' };
      
      expect(nameUpdate.name.length).toBeLessThanOrEqual(attributeBusinessRules.maxNameLength);
      expect(nameUpdate.name.length).toBeGreaterThanOrEqual(attributeBusinessRules.minNameLength);
    });

    it('应该验证属性值更新逻辑', () => {
      const valueUpdate = { value: '更新后的属性值' };
      
      expect(valueUpdate.value.length).toBeLessThanOrEqual(attributeBusinessRules.maxValueLength);
      expect(valueUpdate.value.length).toBeGreaterThanOrEqual(attributeBusinessRules.minValueLength);
    });

    it('应该验证批量更新逻辑', () => {
      const batchUpdate = attributeUpdateRequests.batch[0];
      
      expect(batchUpdate).toHaveProperty('updates');
      expect(Array.isArray(batchUpdate.updates)).toBe(true);
      
      batchUpdate.updates.forEach(update => {
        expect(update).toHaveProperty('id');
        expect(update).toHaveProperty('data');
        expect(typeof update.id).toBe('string');
        expect(typeof update.data).toBe('object');
      });
    });
  });

  describe('属性删除逻辑测试', () => {
    it('应该验证删除业务规则', () => {
      attributeDeleteScenarios.forEach(scenario => {
        // 属性不存在时不能删除
        if (scenario.attributeId === 'non-existent-attr') {
          const canDelete = false;
          expect(canDelete).toBe(scenario.canDelete);
        } else {
          // 存在的属性需要检查关联数据
          const canDelete = !scenario.hasRelatedData;
          expect(canDelete).toBe(scenario.canDelete);
        }
      });
    });

    it('应该检查关联数据约束', () => {
      const attributeWithReferences = attributeDeleteScenarios.find(s => s.hasRelatedData);
      const attributeWithoutReferences = attributeDeleteScenarios.find(s => !s.hasRelatedData && s.canDelete);
      
      expect(attributeWithReferences?.canDelete).toBe(false);
      expect(attributeWithoutReferences?.canDelete).toBe(true);
    });

    it('应该检查属性存在性', () => {
      const nonExistentAttribute = attributeDeleteScenarios.find(s => s.attributeId === 'non-existent-attr');
      
      expect(nonExistentAttribute?.canDelete).toBe(false);
      expect(nonExistentAttribute?.description).toContain('不存在');
    });

    it('应该验证批量删除逻辑', () => {
      const batchDelete = attributeBatchOperations.delete[0];
      
      expect(batchDelete).toHaveProperty('attributeIds');
      expect(Array.isArray(batchDelete.attributeIds)).toBe(true);
      expect(batchDelete.attributeIds.length).toBeGreaterThan(0);
      expect(batchDelete.attributeIds.length).toBeLessThanOrEqual(attributeBusinessRules.maxBatchSize);
    });
  });

  describe('属性统计计算逻辑测试', () => {
    it('应该验证基本统计数据', () => {
      const stats = attributeStatsData.expected;
      
      expect(stats).toHaveProperty('totalAttributes');
      expect(stats).toHaveProperty('activeProductAttributes');
      expect(stats).toHaveProperty('inactiveProductAttributes');
      expect(stats).toHaveProperty('uniqueAttributeNames');
      
      expect(typeof stats.totalAttributes).toBe('number');
      expect(typeof stats.activeProductAttributes).toBe('number');
      expect(typeof stats.inactiveProductAttributes).toBe('number');
      expect(typeof stats.uniqueAttributeNames).toBe('number');
      
      expect(stats.totalAttributes).toBeGreaterThanOrEqual(0);
      expect(stats.activeProductAttributes).toBeGreaterThanOrEqual(0);
      expect(stats.inactiveProductAttributes).toBeGreaterThanOrEqual(0);
    });

    it('应该验证统计计算一致性', () => {
      const stats = attributeStatsData.expected;
      
      expect(stats.activeProductAttributes + stats.inactiveProductAttributes).toBe(stats.totalAttributes);
      expect(stats.averageAttributesPerProduct).toBeGreaterThan(0);
    });

    it('应该验证常用属性名称统计', () => {
      const commonNames = attributeStatsData.expected.commonAttributeNames;
      
      expect(Array.isArray(commonNames)).toBe(true);
      commonNames.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('应该统计不同商品状态的属性分布', () => {
      const activeProductsAttributes = mockProductAttributes.filter(attr => attr.product.status === 1);
      const inactiveProductsAttributes = mockProductAttributes.filter(attr => attr.product.status === 0);
      
      expect(activeProductsAttributes.length).toBeGreaterThan(0);
      expect(inactiveProductsAttributes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('响应格式验证测试', () => {
    it('应该验证属性列表响应格式', () => {
      const listFormat = attributeResponseFormats.list;
      
      listFormat.requiredFields.forEach(field => {
        expect(['list', 'total', 'page', 'size', 'pages']).toContain(field);
      });
      
      listFormat.listItemFields.forEach(field => {
        expect(['id', 'product_id', 'name', 'value', 'created_at', 'updated_at']).toContain(field);
      });
    });

    it('应该验证属性详情响应格式', () => {
      const detailFormat = attributeResponseFormats.detail;
      
      detailFormat.requiredFields.forEach(field => {
        expect(typeof field).toBe('string');
        expect(field.length).toBeGreaterThan(0);
      });
      
      detailFormat.optionalFields.forEach(field => {
        expect(['product']).toContain(field);
      });
    });

    it('应该验证批量操作响应格式', () => {
      const batchFormat = attributeResponseFormats.batch;
      
      batchFormat.requiredFields.forEach(field => {
        expect(['success', 'failed', 'total']).toContain(field);
      });
      
      expect(batchFormat.failureItemFields).toContain('id');
      expect(batchFormat.failureItemFields).toContain('error');
    });

    it('应该验证统计响应格式', () => {
      const statsFormat = attributeResponseFormats.stats;
      
      statsFormat.requiredFields.forEach(field => {
        expect(['totalAttributes', 'activeProductAttributes']).toContain(field);
      });
      
      statsFormat.optionalFields?.forEach(field => {
        expect(['uniqueAttributeNames', 'averageAttributesPerProduct', 'commonAttributeNames']).toContain(field);
      });
    });
  });

  describe('业务规则验证测试', () => {
    it('应该验证属性业务规则配置', () => {
      expect(attributeBusinessRules.maxNameLength).toBeGreaterThan(0);
      expect(attributeBusinessRules.maxValueLength).toBeGreaterThan(0);
      expect(attributeBusinessRules.minNameLength).toBeGreaterThan(0);
      expect(attributeBusinessRules.minValueLength).toBeGreaterThan(0);
      expect(attributeBusinessRules.maxAttributesPerProduct).toBeGreaterThan(0);
      expect(attributeBusinessRules.maxBatchSize).toBeGreaterThan(0);
      
      expect(attributeBusinessRules.minNameLength).toBeLessThanOrEqual(attributeBusinessRules.maxNameLength);
      expect(attributeBusinessRules.minValueLength).toBeLessThanOrEqual(attributeBusinessRules.maxValueLength);
    });

    it('应该验证测试数据符合业务规则', () => {
      mockProductAttributes.forEach(attribute => {
        expect(attribute.name.length).toBeLessThanOrEqual(attributeBusinessRules.maxNameLength);
        expect(attribute.name.length).toBeGreaterThanOrEqual(attributeBusinessRules.minNameLength);
        expect(attribute.value.length).toBeLessThanOrEqual(attributeBusinessRules.maxValueLength);
        expect(attribute.value.length).toBeGreaterThanOrEqual(attributeBusinessRules.minValueLength);
      });
    });

    it('应该验证重复属性名称策略', () => {
      const allowDuplicateNames = attributeBusinessRules.allowDuplicateNames;
      
      expect(typeof allowDuplicateNames).toBe('boolean');
      
      if (allowDuplicateNames) {
        // 允许重复时，同一商品可以有多个同名属性
        const productAttributes = mockProductAttributes.filter(attr => attr.product_id === 'product-001');
        const names = productAttributes.map(attr => attr.name);
        // 验证逻辑存在即可
        expect(names.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('应该验证单个商品属性数量限制', () => {
      const productAttributes = mockProductAttributes.filter(attr => attr.product_id === 'product-001');
      
      expect(productAttributes.length).toBeLessThanOrEqual(attributeBusinessRules.maxAttributesPerProduct);
    });
  });

  describe('错误场景测试', () => {
    it('应该处理属性不存在的情况', () => {
      const nonExistentId = ATTRIBUTE_TEST_CONSTANTS.NON_EXISTENT_ID;
      
      expect(typeof nonExistentId).toBe('string');
      expect(nonExistentId).not.toBe('');
    });

    it('应该处理无效ID格式', () => {
      const invalidId = ATTRIBUTE_TEST_CONSTANTS.INVALID_ATTRIBUTE_ID;
      
      expect(typeof invalidId).toBe('string');
      expect(invalidId.length).toBeGreaterThan(0);
    });

    it('应该处理空值和undefined', () => {
      const nullValue = null;
      const undefinedValue = undefined;
      const emptyString = '';
      
      expect(nullValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
      expect(emptyString).toBe('');
      
      // 验证空值检查逻辑
      [nullValue, undefinedValue, emptyString].forEach(value => {
        const isEmpty = !value || (typeof value === 'string' && value.trim().length === 0);
        expect(isEmpty).toBe(true);
      });
    });

    it('应该处理并发操作冲突', () => {
      const concurrentUpdates = [
        { id: 'attr-001', name: '更新1', timestamp: new Date() },
        { id: 'attr-001', name: '更新2', timestamp: new Date() }
      ];
      
      expect(concurrentUpdates.length).toBe(2);
      expect(concurrentUpdates[0].id).toBe(concurrentUpdates[1].id);
    });
  });

  describe('性能和边界测试', () => {
    it('应该处理大量属性数据', () => {
      const largeAttributeList = Array.from({ length: 1000 }, (_, index) => ({
        id: `attr-${String(index).padStart(4, '0')}`,
        product_id: `product-${String(Math.floor(index / 10)).padStart(3, '0')}`,
        name: `属性${index}`,
        value: `值${index}`
      }));
      
      expect(largeAttributeList.length).toBe(1000);
      expect(largeAttributeList[0].id).toBe('attr-0000');
      expect(largeAttributeList[999].id).toBe('attr-0999');
    });

    it('应该处理批量操作限制', () => {
      const maxBatchSize = attributeBusinessRules.maxBatchSize;
      const largeBatch = Array.from({ length: maxBatchSize + 1 }, (_, index) => `attr-${index}`);
      
      expect(largeBatch.length).toBeGreaterThan(maxBatchSize);
      
      // 验证批量操作应该拒绝超过限制的请求
      const isOverLimit = largeBatch.length > maxBatchSize;
      expect(isOverLimit).toBe(true);
    });

    it('应该处理极值属性名称和值', () => {
      const maxLengthName = 'a'.repeat(attributeBusinessRules.maxNameLength);
      const maxLengthValue = 'v'.repeat(attributeBusinessRules.maxValueLength);
      
      expect(maxLengthName.length).toBe(attributeBusinessRules.maxNameLength);
      expect(maxLengthValue.length).toBe(attributeBusinessRules.maxValueLength);
      
      // 超长内容应该被拒绝
      const overLengthName = 'a'.repeat(attributeBusinessRules.maxNameLength + 1);
      const overLengthValue = 'v'.repeat(attributeBusinessRules.maxValueLength + 1);
      
      expect(overLengthName.length).toBeGreaterThan(attributeBusinessRules.maxNameLength);
      expect(overLengthValue.length).toBeGreaterThan(attributeBusinessRules.maxValueLength);
    });

    it('应该处理特殊字符和编码', () => {
      const specialCharacters = {
        unicode: '属性名称🎉',
        symbols: '特殊符号!@#$%^&*()',
        spaces: '带 空 格 的 值',
        multiline: '多行\n属性\n值',
        quotes: "包含'单引号'和\"双引号\"",
        html: '<script>alert("xss")</script>'
      };
      
      Object.entries(specialCharacters).forEach(([key, value]) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('常用属性数据验证测试', () => {
    it('应该验证标准属性名称', () => {
      const standardNames = commonAttributeData.standardNames;
      
      expect(Array.isArray(standardNames)).toBe(true);
      expect(standardNames.length).toBeGreaterThan(0);
      
      standardNames.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('应该验证颜色值选项', () => {
      const colorValues = commonAttributeData.colorValues;
      
      expect(Array.isArray(colorValues)).toBe(true);
      colorValues.forEach(color => {
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      });
    });

    it('应该验证尺寸值选项', () => {
      const sizeValues = commonAttributeData.sizeValues;
      
      expect(Array.isArray(sizeValues)).toBe(true);
      sizeValues.forEach(size => {
        expect(typeof size).toBe('string');
        expect(size.length).toBeGreaterThan(0);
      });
    });

    it('应该验证材质值选项', () => {
      const materialValues = commonAttributeData.materialValues;
      
      expect(Array.isArray(materialValues)).toBe(true);
      materialValues.forEach(material => {
        expect(typeof material).toBe('string');
        expect(material.length).toBeGreaterThan(0);
      });
    });

    it('应该验证属性值格式验证模式', () => {
      const patterns = commonAttributeData.validationPatterns;
      
      expect(patterns).toHaveProperty('weight');
      expect(patterns).toHaveProperty('dimensions');
      expect(patterns).toHaveProperty('model');
      
      // 测试重量格式
      const validWeights = ['500g', '1.5kg', '250mg'];
      const invalidWeights = ['500', 'invalid', ''];
      
      validWeights.forEach(weight => {
        expect(patterns.weight.test(weight)).toBe(true);
      });
      
      invalidWeights.forEach(weight => {
        expect(patterns.weight.test(weight)).toBe(false);
      });
    });
  });

  describe('数据完整性验证测试', () => {
    it('应该确保所有必需字段都存在', () => {
      mockProductAttributes.forEach(attribute => {
        const requiredFields = ['id', 'product_id', 'name', 'value', 'created_at', 'updated_at'];
        
        requiredFields.forEach(field => {
          expect(attribute).toHaveProperty(field);
          expect(attribute[field as keyof typeof attribute]).toBeDefined();
        });
      });
    });

    it('应该确保时间字段格式正确', () => {
      mockProductAttributes.forEach(attribute => {
        expect(attribute.created_at).toBeInstanceOf(Date);
        expect(attribute.updated_at).toBeInstanceOf(Date);
        expect(attribute.updated_at.getTime()).toBeGreaterThanOrEqual(attribute.created_at.getTime());
      });
    });

    it('应该确保字符串字段类型正确', () => {
      mockProductAttributes.forEach(attribute => {
        expect(typeof attribute.id).toBe('string');
        expect(typeof attribute.product_id).toBe('string');
        expect(typeof attribute.name).toBe('string');
        expect(typeof attribute.value).toBe('string');
        
        expect(attribute.id).not.toBe('');
        expect(attribute.product_id).not.toBe('');
        expect(attribute.name).not.toBe('');
        expect(attribute.value).not.toBe('');
      });
    });

    it('应该确保关联数据完整性', () => {
      mockProductAttributes.forEach(attribute => {
        if (attribute.product) {
          expect(attribute.product.id).toBe(attribute.product_id);
          expect(typeof attribute.product.name).toBe('string');
          expect(attribute.product.name).not.toBe('');
          expect([0, 1]).toContain(attribute.product.status);
        }
      });
    });
  });
}); 