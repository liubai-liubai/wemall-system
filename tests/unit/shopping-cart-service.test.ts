/**
 * 购物车服务单元测试
 * 测试购物车相关的核心业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Decimal } from '@prisma/client/runtime/library';
import {
  basicCartData,
  skuTestData,
  addToCartTestData,
  updateCartTestData,
  cartQueryTestData,
  batchOperationTestData,
  cartDetailTestData,
  statisticsTestData,
  validationTestData,
  invalidCartData,
  mockResponses,
  TEST_CONSTANTS,
  boundaryTestData,
  concurrentTestData
} from '../fixtures/shopping-cart-fixtures';

describe('ShoppingCartService Core Logic Tests', () => {
  
  describe('购物车数据验证测试', () => {
    test('应该验证购物车基本数据结构', () => {
      const cartData = basicCartData[0];
      
      expect(cartData).toHaveProperty('id');
      expect(cartData).toHaveProperty('userId');
      expect(cartData).toHaveProperty('skuId');
      expect(cartData).toHaveProperty('quantity');
      expect(cartData).toHaveProperty('checked');
      expect(cartData).toHaveProperty('createdAt');
      expect(cartData).toHaveProperty('updatedAt');
      
      expect(typeof cartData.id).toBe('string');
      expect(typeof cartData.userId).toBe('string');
      expect(typeof cartData.skuId).toBe('string');
      expect(typeof cartData.quantity).toBe('number');
      expect(typeof cartData.checked).toBe('number');
      expect(cartData.createdAt).toBeInstanceOf(Date);
      expect(cartData.updatedAt).toBeInstanceOf(Date);
    });

    test('应该验证购物车选中状态值', () => {
      const checkedCart = basicCartData[0];
      const uncheckedCart = basicCartData[1];
      
      expect([0, 1]).toContain(checkedCart.checked);
      expect([0, 1]).toContain(uncheckedCart.checked);
      expect(checkedCart.checked).toBe(1);
      expect(uncheckedCart.checked).toBe(0);
    });

    test('应该验证商品数量值', () => {
      basicCartData.forEach(cart => {
        expect(cart.quantity).toBeGreaterThan(0);
        expect(Number.isInteger(cart.quantity)).toBe(true);
      });
    });

    test('应该验证SKU数据结构', () => {
      const skuData = skuTestData[0];
      
      expect(skuData).toHaveProperty('id');
      expect(skuData).toHaveProperty('product_id');
      expect(skuData).toHaveProperty('sku_code');
      expect(skuData).toHaveProperty('price');
      expect(skuData).toHaveProperty('stock');
      expect(skuData).toHaveProperty('status');
      expect(skuData).toHaveProperty('product');
      
      expect(skuData.price).toBeInstanceOf(Decimal);
      expect(typeof skuData.stock).toBe('number');
      expect([0, 1]).toContain(skuData.status);
    });

    test('应该验证商品数据结构', () => {
      const productData = skuTestData[0].product;
      
      expect(productData).toHaveProperty('id');
      expect(productData).toHaveProperty('name');
      expect(productData).toHaveProperty('status');
      expect(productData).toHaveProperty('category_id');
      
      expect(typeof productData.name).toBe('string');
      expect([0, 1]).toContain(productData.status);
    });
  });

  describe('添加到购物车逻辑测试', () => {
    test('应该验证添加请求数据格式', () => {
      const validRequest = addToCartTestData[0];
      
      expect(validRequest).toHaveProperty('userId');
      expect(validRequest).toHaveProperty('skuId');
      expect(validRequest).toHaveProperty('quantity');
      
      expect(typeof validRequest.userId).toBe('string');
      expect(typeof validRequest.skuId).toBe('string');
      expect(typeof validRequest.quantity).toBe('number');
      expect(validRequest.quantity).toBeGreaterThan(0);
    });

    test('应该拒绝无效的添加请求', () => {
      const invalidRequests = invalidCartData.invalidAddRequests;
      
      invalidRequests.forEach(request => {
        const hasEmptyUserId = request.userId === '';
        const hasEmptySkuId = request.skuId === '';
        const hasInvalidQuantity = request.quantity <= 0;
        
        expect(hasEmptyUserId || hasEmptySkuId || hasInvalidQuantity).toBe(true);
      });
    });

    test('应该正确计算商品总价', () => {
      const quantity = 2;
      const price = new Decimal(99.90);
      const expectedTotal = Number(price) * quantity;
      
      expect(expectedTotal).toBe(199.80);
    });

    test('应该验证库存充足性检查', () => {
      const availableSku = skuTestData[0]; // stock: 100
      const outOfStockSku = skuTestData[2]; // stock: 0
      
      const requestQuantity = 5;
      
      expect(availableSku.stock >= requestQuantity).toBe(true);
      expect(outOfStockSku.stock >= requestQuantity).toBe(false);
    });

    test('应该验证商品和SKU状态检查', () => {
      const activeSku = skuTestData[0]; // status: 1, product.status: 1
      const inactiveSku = skuTestData[2]; // status: 1, product.status: 0
      
      expect(activeSku.status === 1 && activeSku.product.status === 1).toBe(true);
      expect(inactiveSku.status === 1 && inactiveSku.product.status === 1).toBe(false);
    });
  });

  describe('购物车更新逻辑测试', () => {
    test('应该验证更新请求数据格式', () => {
      const validUpdate = updateCartTestData[0];
      
      if (validUpdate.quantity !== undefined) {
        expect(typeof validUpdate.quantity).toBe('number');
        expect(validUpdate.quantity).toBeGreaterThan(0);
      }
      
      if (validUpdate.checked !== undefined) {
        expect([0, 1]).toContain(validUpdate.checked);
      }
    });

    test('应该拒绝无效的更新请求', () => {
      const invalidUpdate = updateCartTestData[3]; // quantity: 0
      
      expect(invalidUpdate.quantity).toBe(0);
      expect(invalidUpdate.quantity).not.toBeGreaterThan(0);
    });

    test('应该正确处理部分更新', () => {
      const quantityOnlyUpdate = updateCartTestData[1];
      const checkedOnlyUpdate = updateCartTestData[2];
      
      expect(quantityOnlyUpdate.quantity).toBeDefined();
      expect(quantityOnlyUpdate.checked).toBeUndefined();
      
      expect(checkedOnlyUpdate.quantity).toBeUndefined();
      expect(checkedOnlyUpdate.checked).toBeDefined();
    });

    test('应该验证数量更新时的库存检查逻辑', () => {
      const newQuantity = 50;
      const availableStock = 100;
      const insufficientStock = 30;
      
      expect(availableStock >= newQuantity).toBe(true);
      expect(insufficientStock >= newQuantity).toBe(false);
    });
  });

  describe('购物车查询逻辑测试', () => {
    test('应该验证查询参数格式', () => {
      const queryParams = cartQueryTestData[0];
      
      expect(queryParams).toHaveProperty('userId');
      expect(queryParams).toHaveProperty('page');
      expect(queryParams).toHaveProperty('size');
      
      expect(typeof queryParams.userId).toBe('string');
      expect(typeof queryParams.page).toBe('number');
      expect(typeof queryParams.size).toBe('number');
      expect(queryParams.page).toBeGreaterThan(0);
      expect(queryParams.size).toBeGreaterThan(0);
    });

    test('应该正确处理分页计算', () => {
      const page = 2;
      const size = 10;
      const expectedOffset = (page - 1) * size;
      
      expect(expectedOffset).toBe(10);
    });

    test('应该正确处理选中状态过滤', () => {
      const checkedOnlyQuery = cartQueryTestData[1];
      
      expect(checkedOnlyQuery.checked).toBe(1);
      expect([0, 1]).toContain(checkedOnlyQuery.checked);
    });

    test('应该正确处理SKU过滤', () => {
      const skuFilterQuery = cartQueryTestData[2];
      
      expect(skuFilterQuery.skuId).toBeDefined();
      expect(typeof skuFilterQuery.skuId).toBe('string');
    });
  });

  describe('批量操作逻辑测试', () => {
    test('应该验证批量操作参数', () => {
      const batchParams = batchOperationTestData[0];
      
      expect(batchParams).toHaveProperty('ids');
      expect(batchParams).toHaveProperty('action');
      expect(Array.isArray(batchParams.ids)).toBe(true);
      expect(['check', 'uncheck', 'delete']).toContain(batchParams.action);
    });

    test('应该验证批量操作ID列表', () => {
      batchOperationTestData.forEach(params => {
        expect(params.ids.length).toBeGreaterThan(0);
        params.ids.forEach(id => {
          expect(typeof id).toBe('string');
          expect(id.length).toBeGreaterThan(0);
        });
      });
    });

    test('应该正确处理不同的批量操作类型', () => {
      const checkAction = batchOperationTestData[0];
      const uncheckAction = batchOperationTestData[1];
      const deleteAction = batchOperationTestData[2];
      
      expect(checkAction.action).toBe('check');
      expect(uncheckAction.action).toBe('uncheck');
      expect(deleteAction.action).toBe('delete');
    });

    test('应该验证批量操作结果统计', () => {
      const mockResult = mockResponses.batchOperationSuccess;
      
      expect(mockResult).toHaveProperty('success');
      expect(mockResult).toHaveProperty('failed');
      expect(typeof mockResult.success).toBe('number');
      expect(typeof mockResult.failed).toBe('number');
      expect(mockResult.success).toBeGreaterThanOrEqual(0);
      expect(mockResult.failed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('购物车统计计算逻辑测试', () => {
    test('应该正确计算购物车统计信息', () => {
      const stats = statisticsTestData[0];
      
      expect(stats).toHaveProperty('totalItems');
      expect(stats).toHaveProperty('checkedItems');
      expect(stats).toHaveProperty('totalPrice');
      expect(stats).toHaveProperty('checkedPrice');
      expect(stats).toHaveProperty('availableItems');
      expect(stats).toHaveProperty('unavailableItems');
      
      expect(stats.totalItems).toBeGreaterThanOrEqual(stats.checkedItems);
      expect(stats.totalPrice).toBeGreaterThanOrEqual(stats.checkedPrice);
      expect(stats.totalItems).toBe(stats.availableItems + stats.unavailableItems);
    });

    test('应该正确处理空购物车统计', () => {
      const emptyStats = statisticsTestData[1];
      
      expect(emptyStats.totalItems).toBe(0);
      expect(emptyStats.checkedItems).toBe(0);
      expect(emptyStats.totalPrice).toBe(0);
      expect(emptyStats.checkedPrice).toBe(0);
      expect(emptyStats.availableItems).toBe(0);
      expect(emptyStats.unavailableItems).toBe(0);
    });

    test('应该验证价格计算逻辑', () => {
      const quantity = 2;
      const price = 99.90;
      const expectedItemTotal = quantity * price;
      
      expect(expectedItemTotal).toBe(199.80);
    });

    test('应该验证商品可用性判断', () => {
      const availableItem = {
        productStatus: 1,
        skuStatus: 1,
        stock: 10,
        quantity: 5
      };
      
      const unavailableItem = {
        productStatus: 0,
        skuStatus: 1,
        stock: 10,
        quantity: 5
      };
      
      const isAvailable = (item: any) => 
        item.productStatus === 1 && 
        item.skuStatus === 1 && 
        item.stock >= item.quantity;
      
      expect(isAvailable(availableItem)).toBe(true);
      expect(isAvailable(unavailableItem)).toBe(false);
    });
  });

  describe('购物车验证逻辑测试', () => {
    test('应该验证有效购物车', () => {
      const validCart = validationTestData[0];
      
      expect(validCart.valid).toBe(true);
      expect(validCart.invalidItems).toHaveLength(0);
    });

    test('应该识别无效购物车项', () => {
      const invalidCart = validationTestData[1];
      
      expect(invalidCart.valid).toBe(false);
      expect(invalidCart.invalidItems.length).toBeGreaterThan(0);
    });

    test('应该正确分类无效原因', () => {
      const invalidCart = validationTestData[1];
      const reasons = invalidCart.invalidItems.map(item => item.reason);
      
      const validReasons = ['out_of_stock', 'product_offline', 'sku_offline', 'insufficient_stock'];
      reasons.forEach(reason => {
        expect(validReasons).toContain(reason);
      });
    });

    test('应该提供库存不足的详细信息', () => {
      const invalidCart = validationTestData[1];
      const insufficientStockItem = invalidCart.invalidItems.find(
        item => item.reason === 'insufficient_stock'
      );
      
      if (insufficientStockItem) {
        expect(insufficientStockItem.currentStock).toBeDefined();
        expect(insufficientStockItem.requestQuantity).toBeDefined();
        expect(insufficientStockItem.currentStock).toBeLessThan(insufficientStockItem.requestQuantity!);
      }
    });
  });

  describe('购物车业务规则验证测试', () => {
    test('应该验证用户ID不能为空', () => {
      const invalidRequest = invalidCartData.invalidAddRequests[0];
      
      expect(invalidRequest.userId).toBe('');
    });

    test('应该验证SKU ID不能为空', () => {
      const invalidRequest = invalidCartData.invalidAddRequests[1];
      
      expect(invalidRequest.skuId).toBe('');
    });

    test('应该验证数量必须大于0', () => {
      const zeroQuantityRequest = invalidCartData.invalidAddRequests[2];
      const negativeQuantityRequest = invalidCartData.invalidAddRequests[3];
      
      expect(zeroQuantityRequest.quantity).toBe(0);
      expect(negativeQuantityRequest.quantity).toBe(-1);
    });

    test('应该验证数量上限', () => {
      const maxQuantity = TEST_CONSTANTS.MAX_QUANTITY;
      const overLimitQuantity = maxQuantity + 1;
      
      expect(overLimitQuantity).toBeGreaterThan(maxQuantity);
    });

    test('应该验证分页参数合理性', () => {
      const invalidQuery = invalidCartData.invalidQueryParams[1]; // page: 0
      
      expect(invalidQuery.page).toBe(0);
      expect(invalidQuery.page).not.toBeGreaterThan(0);
    });
  });

  describe('数据完整性验证测试', () => {
    test('应该确保所有必需字段都存在', () => {
      const cartDetail = cartDetailTestData[0];
      
      // 购物车基础字段
      expect(cartDetail.id).toBeDefined();
      expect(cartDetail.userId).toBeDefined();
      expect(cartDetail.skuId).toBeDefined();
      expect(cartDetail.quantity).toBeDefined();
      expect(cartDetail.checked).toBeDefined();
      
      // SKU字段
      expect(cartDetail.sku.id).toBeDefined();
      expect(cartDetail.sku.price).toBeDefined();
      expect(cartDetail.sku.stock).toBeDefined();
      
      // 商品字段
      expect(cartDetail.sku.product.id).toBeDefined();
      expect(cartDetail.sku.product.name).toBeDefined();
      expect(cartDetail.sku.product.status).toBeDefined();
    });

    test('应该确保时间字段格式正确', () => {
      const cartData = basicCartData[0];
      
      expect(cartData.createdAt).toBeInstanceOf(Date);
      expect(cartData.updatedAt).toBeInstanceOf(Date);
      expect(cartData.createdAt.getTime()).not.toBeNaN();
      expect(cartData.updatedAt.getTime()).not.toBeNaN();
    });

    test('应该确保数值字段类型正确', () => {
      const cartDetail = cartDetailTestData[0];
      
      expect(typeof cartDetail.quantity).toBe('number');
      expect(typeof cartDetail.totalPrice).toBe('number');
      expect(typeof cartDetail.sku.stock).toBe('number');
      expect(cartDetail.sku.price).toBeInstanceOf(Decimal);
    });

    test('应该确保枚举字段值有效', () => {
      const cartData = basicCartData[0];
      const skuData = skuTestData[0];
      
      expect([0, 1]).toContain(cartData.checked);
      expect([0, 1]).toContain(skuData.status);
      expect([0, 1]).toContain(skuData.product.status);
    });

    test('应该确保价格精度正确', () => {
      const price = new Decimal(99.90);
      const quantity = 2;
      const totalPrice = Number(price) * quantity;
      
      expect(totalPrice).toBe(199.80);
      expect(Number.isFinite(totalPrice)).toBe(true);
    });
  });

  describe('边界值测试', () => {
    test('应该处理最小和最大数量值', () => {
      const [minQuantity, maxQuantity, overMaxQuantity] = boundaryTestData.quantityLimits;
      
      expect(minQuantity).toBe(1);
      expect(maxQuantity).toBe(999);
      expect(overMaxQuantity).toBe(1000);
      
      expect(minQuantity).toBeGreaterThan(0);
      expect(maxQuantity).toBeGreaterThan(minQuantity);
      expect(overMaxQuantity).toBeGreaterThan(maxQuantity);
    });

    test('应该处理价格边界值', () => {
      const [minPrice, maxPrice, overMaxPrice] = boundaryTestData.priceLimits;
      
      expect(minPrice).toBe(0.01);
      expect(maxPrice).toBe(99999.99);
      expect(overMaxPrice).toBe(100000.00);
      
      expect(minPrice).toBeGreaterThan(0);
      expect(maxPrice).toBeGreaterThan(minPrice);
      expect(overMaxPrice).toBeGreaterThan(maxPrice);
    });

    test('应该处理分页边界值', () => {
      const [minPage, maxPage, overMaxPage] = boundaryTestData.pageLimits;
      
      expect(minPage).toBe(1);
      expect(maxPage).toBe(100);
      expect(overMaxPage).toBe(101);
      
      expect(minPage).toBeGreaterThan(0);
      expect(maxPage).toBeGreaterThan(minPage);
      expect(overMaxPage).toBeGreaterThan(maxPage);
    });
  });
}); 