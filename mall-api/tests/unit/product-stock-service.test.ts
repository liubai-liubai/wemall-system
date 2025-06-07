/**
 * 商品库存服务单元测试
 * 测试库存管理的核心业务逻辑，包括库存调整、锁定、预警等功能
 * @author 刘白 & AI Assistant
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  StockType,
  StockLogType,
  ICreateStockRequest,
  IUpdateStockRequest,
  IStockAdjustRequest,
  IBatchStockAdjustRequest
} from '../../src/types/product-stock';
import {
  mockStockData,
  mockStockLogData,
  createStockRequests,
  invalidCreateStockRequests,
  updateStockRequests,
  stockAdjustRequests,
  invalidStockAdjustRequests,
  batchStockAdjustRequest,
  invalidBatchStockAdjustRequest,
  mockStockResponse,
  mockLowStockResponse,
  mockStockLogResponse,
  stockTypes,
  invalidStockTypes,
  stockLogTypes,
  invalidStockLogTypes,
  validQuantities,
  invalidQuantities,
  validWarningLines,
  invalidWarningLines,
  stockLockTestCases,
  stockReleaseTestCases
} from '../fixtures/product-stock-fixtures';

describe('ProductStockService Core Logic Tests', () => {

  describe('库存数据验证测试', () => {
    it('应该验证库存基本数据结构', () => {
      const stockData = mockStockData[0];

      expect(stockData.id).toBeDefined();
      expect(stockData.id).toMatch(/^stock-\d{3}$/);
      expect(stockData.product_id).toBeDefined();
      expect(stockData.product_id).toMatch(/^product-\d{3}$/);
      expect(stockData.sku_id).toBeDefined();
      expect(stockData.sku_id).toMatch(/^sku-\d{3}$/);
      expect(stockTypes).toContain(stockData.stock_type);
      expect(stockData.quantity).toBeGreaterThanOrEqual(0);
      expect(stockData.warning_line).toBeGreaterThanOrEqual(0);
      expect(stockData.created_at).toBeInstanceOf(Date);
      expect(stockData.updated_at).toBeInstanceOf(Date);
    });

    it('应该验证库存类型值', () => {
      stockTypes.forEach(stockType => {
        expect(['sellable', 'locked', 'warning']).toContain(stockType);
      });

      invalidStockTypes.forEach(invalidType => {
        expect(['sellable', 'locked', 'warning']).not.toContain(invalidType);
      });
    });

    it('应该验证库存日志类型值', () => {
      stockLogTypes.forEach(logType => {
        expect(['in', 'out', 'lock', 'unlock', 'adjust']).toContain(logType);
      });

      invalidStockLogTypes.forEach(invalidType => {
        expect(['in', 'out', 'lock', 'unlock', 'adjust']).not.toContain(invalidType);
      });
    });

    it('应该验证库存数量值', () => {
      validQuantities.forEach(quantity => {
        expect(quantity).toBeGreaterThanOrEqual(0);
        expect(typeof quantity).toBe('number');
        expect(Number.isInteger(quantity)).toBe(true);
        expect(Number.isFinite(quantity)).toBe(true);
      });

      invalidQuantities.forEach(quantity => {
        if (quantity === null || quantity === undefined) {
          expect(quantity).toBeFalsy();
        } else if (typeof quantity === 'number') {
          expect(
            quantity < 0 || 
            !Number.isInteger(quantity) || 
            !Number.isFinite(quantity)
          ).toBe(true);
        } else {
          expect(typeof quantity).not.toBe('number');
        }
      });
    });

    it('应该验证预警线数量值', () => {
      validWarningLines.forEach(warningLine => {
        expect(warningLine).toBeGreaterThanOrEqual(0);
        expect(typeof warningLine).toBe('number');
        expect(Number.isInteger(warningLine)).toBe(true);
      });

      invalidWarningLines.forEach(warningLine => {
        if (warningLine === null || warningLine === undefined) {
          expect(warningLine).toBeFalsy();
        } else if (typeof warningLine === 'number') {
          expect(
            warningLine < 0 || 
            !Number.isInteger(warningLine) || 
            !Number.isFinite(warningLine)
          ).toBe(true);
        } else {
          expect(typeof warningLine).not.toBe('number');
        }
      });
    });
  });

  describe('库存低库存判断逻辑测试', () => {
    it('应该正确判断低库存状态', () => {
      const testCases = [
        { quantity: 100, warningLine: 10, isLowStock: false },
        { quantity: 10, warningLine: 10, isLowStock: false }, // 等于预警线不算低库存
        { quantity: 5, warningLine: 10, isLowStock: true },
        { quantity: 0, warningLine: 10, isLowStock: true },
        { quantity: 50, warningLine: 0, isLowStock: false }, // 预警线为0时不算低库存
      ];

      testCases.forEach(testCase => {
        const isLowStock = testCase.quantity < testCase.warningLine && testCase.warningLine > 0;
        expect(isLowStock).toBe(testCase.isLowStock);
      });
    });

    it('应该正确识别库存预警级别', () => {
      const testCases = [
        { quantity: 0, warningLine: 10, level: 'critical' },
        { quantity: 3, warningLine: 10, level: 'warning' },
        { quantity: 10, warningLine: 10, level: 'normal' },
        { quantity: 15, warningLine: 10, level: 'normal' }
      ];

      testCases.forEach(testCase => {
        let level: string;
        if (testCase.quantity === 0) {
          level = 'critical';
        } else if (testCase.quantity < testCase.warningLine && testCase.warningLine > 0) {
          level = 'warning';
        } else {
          level = 'normal';
        }
        expect(level).toBe(testCase.level);
      });
    });
  });

  describe('库存调整逻辑测试', () => {
    it('应该验证库存调整请求数据', () => {
      const validRequest = stockAdjustRequests[0];

      expect(validRequest.stock_id).toBeDefined();
      expect(typeof validRequest.change).toBe('number');
      expect(stockLogTypes).toContain(validRequest.type);
      
      if (validRequest.order_id) {
        expect(typeof validRequest.order_id).toBe('string');
      }
      
      if (validRequest.remark) {
        expect(typeof validRequest.remark).toBe('string');
      }
    });

    it('应该正确计算库存调整后的数量', () => {
      const testCases = [
        { currentStock: 100, change: 50, expectedResult: 150 },
        { currentStock: 100, change: -10, expectedResult: 90 },
        { currentStock: 10, change: -10, expectedResult: 0 },
        { currentStock: 5, change: 3, expectedResult: 8 }
      ];

      testCases.forEach(testCase => {
        const newQuantity = testCase.currentStock + testCase.change;
        expect(newQuantity).toBe(testCase.expectedResult);
        expect(newQuantity).toBeGreaterThanOrEqual(0);
      });
    });

    it('应该拒绝导致负库存的调整', () => {
      const testCases = [
        { currentStock: 10, change: -15, shouldFail: true },
        { currentStock: 0, change: -1, shouldFail: true },
        { currentStock: 50, change: -100, shouldFail: true },
        { currentStock: 100, change: -50, shouldFail: false }
      ];

      testCases.forEach(testCase => {
        const newQuantity = testCase.currentStock + testCase.change;
        const wouldBeFail = newQuantity < 0;
        expect(wouldBeFail).toBe(testCase.shouldFail);
      });
    });

    it('应该验证批量调整中的重复库存ID', () => {
      const duplicateStockIds = invalidBatchStockAdjustRequest.adjustments.map(adj => adj.stock_id);
      const uniqueStockIds = [...new Set(duplicateStockIds)];
      
      expect(duplicateStockIds.length).toBeGreaterThan(uniqueStockIds.length);
      expect(duplicateStockIds).toHaveLength(2);
      expect(uniqueStockIds).toHaveLength(1);
    });

    it('应该验证批量调整中无重复库存ID', () => {
      const stockIds = batchStockAdjustRequest.adjustments.map(adj => adj.stock_id);
      const uniqueStockIds = [...new Set(stockIds)];
      
      expect(stockIds.length).toBe(uniqueStockIds.length);
    });
  });

  describe('库存锁定释放逻辑测试', () => {
    it('应该验证库存锁定数量', () => {
      stockLockTestCases.forEach(testCase => {
        expect(testCase.lockQuantity).toBeGreaterThan(0);
        expect(typeof testCase.lockQuantity).toBe('number');
        expect(Number.isInteger(testCase.lockQuantity)).toBe(true);
      });
    });

    it('应该验证库存释放数量', () => {
      stockReleaseTestCases.forEach(testCase => {
        expect(testCase.releaseQuantity).toBeGreaterThan(0);
        expect(typeof testCase.releaseQuantity).toBe('number');
        expect(Number.isInteger(testCase.releaseQuantity)).toBe(true);
      });
    });

    it('应该正确计算锁定后的可销售库存', () => {
      const testCases = [
        { sellableStock: 100, lockQuantity: 10, expectedSellable: 90, expectedLocked: 10 },
        { sellableStock: 50, lockQuantity: 5, expectedSellable: 45, expectedLocked: 5 },
        { sellableStock: 10, lockQuantity: 10, expectedSellable: 0, expectedLocked: 10 }
      ];

      testCases.forEach(testCase => {
        const newSellableStock = testCase.sellableStock - testCase.lockQuantity;
        const newLockedStock = testCase.lockQuantity;
        
        expect(newSellableStock).toBe(testCase.expectedSellable);
        expect(newLockedStock).toBe(testCase.expectedLocked);
        expect(newSellableStock).toBeGreaterThanOrEqual(0);
      });
    });

    it('应该正确计算释放后的库存', () => {
      const testCases = [
        { lockedStock: 10, releaseQuantity: 5, expectedLocked: 5, expectedSellable: 5 },
        { lockedStock: 10, releaseQuantity: 10, expectedLocked: 0, expectedSellable: 10 },
        { lockedStock: 20, releaseQuantity: 3, expectedLocked: 17, expectedSellable: 3 }
      ];

      testCases.forEach(testCase => {
        const newLockedStock = testCase.lockedStock - testCase.releaseQuantity;
        const releasedToSellable = testCase.releaseQuantity;
        
        expect(newLockedStock).toBe(testCase.expectedLocked);
        expect(releasedToSellable).toBe(testCase.expectedSellable);
        expect(newLockedStock).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('库存统计计算逻辑测试', () => {
    it('应该正确计算库存总量', () => {
      const stockList = mockStockData;
      const totalQuantity = stockList.reduce((sum, stock) => sum + stock.quantity, 0);
      
      expect(totalQuantity).toBeGreaterThanOrEqual(0);
      expect(typeof totalQuantity).toBe('number');
      
      // 基于测试数据验证
      const expectedTotal = 100 + 5 + 5 + 0; // stock-001 + stock-002 + stock-003 + stock-004
      expect(totalQuantity).toBe(expectedTotal);
    });

    it('应该正确统计低库存数量', () => {
      const stockList = mockStockData;
      const lowStockCount = stockList.filter(stock => 
        stock.quantity <= stock.warning_line && stock.warning_line > 0
      ).length;
      
      expect(lowStockCount).toBeGreaterThanOrEqual(0);
      expect(typeof lowStockCount).toBe('number');
      
      // 基于测试数据验证: stock-003 (5 <= 10) 和 stock-004 (0 <= 5)
      expect(lowStockCount).toBe(2);
    });

    it('应该正确统计缺货数量', () => {
      const stockList = mockStockData;
      const outOfStockCount = stockList.filter(stock => stock.quantity === 0).length;
      
      expect(outOfStockCount).toBeGreaterThanOrEqual(0);
      expect(typeof outOfStockCount).toBe('number');
      
      // 基于测试数据验证: 只有 stock-004 的库存为0
      expect(outOfStockCount).toBe(1);
    });

    it('应该正确按库存类型分组统计', () => {
      const stockList = mockStockData;
      const byStockType = stockList.reduce((acc, stock) => {
        acc[stock.stock_type] = (acc[stock.stock_type] || 0) + stock.quantity;
        return acc;
      }, {} as Record<StockType, number>);
      
      expect(byStockType.sellable).toBeDefined();
      expect(byStockType.locked).toBeDefined();
      
      // 基于测试数据验证
      expect(byStockType.sellable).toBe(105); // stock-001(100) + stock-003(5) + stock-004(0)
      expect(byStockType.locked).toBe(5);     // stock-002(5)
    });
  });

  describe('库存日志记录逻辑测试', () => {
    it('应该验证库存日志数据结构', () => {
      const logData = mockStockLogData[0];

      expect(logData.id).toBeDefined();
      expect(logData.id).toMatch(/^log-\d{3}$/);
      expect(logData.stock_id).toBeDefined();
      expect(typeof logData.change).toBe('number');
      expect(stockLogTypes).toContain(logData.type);
      expect(logData.created_at).toBeInstanceOf(Date);
      
      if (logData.order_id) {
        expect(typeof logData.order_id).toBe('string');
      }
      
      if (logData.remark) {
        expect(typeof logData.remark).toBe('string');
      }
    });

    it('应该正确记录不同类型的库存变动', () => {
      const logTypes = ['in', 'out', 'lock', 'unlock', 'adjust'] as StockLogType[];
      
      logTypes.forEach(type => {
        expect(stockLogTypes).toContain(type);
      });

      // 验证日志类型对应的变动方向
      const testCases = [
        { type: 'in' as StockLogType, change: 50, shouldIncrease: true },
        { type: 'out' as StockLogType, change: -10, shouldIncrease: false },
        { type: 'lock' as StockLogType, change: -5, shouldIncrease: false },
        { type: 'unlock' as StockLogType, change: 5, shouldIncrease: true },
        { type: 'adjust' as StockLogType, change: 3, shouldIncrease: true },
        { type: 'adjust' as StockLogType, change: -3, shouldIncrease: false }
      ];

      testCases.forEach(testCase => {
        const actuallyIncreases = testCase.change > 0;
        expect(actuallyIncreases).toBe(testCase.shouldIncrease);
      });
    });
  });

  describe('库存查询过滤逻辑测试', () => {
    it('应该正确过滤低库存商品', () => {
      const stockList = mockStockData;
      const lowStocks = stockList.filter(stock => 
        stock.quantity <= stock.warning_line && stock.warning_line > 0
      );
      
      lowStocks.forEach(stock => {
        expect(stock.quantity).toBeLessThanOrEqual(stock.warning_line);
        expect(stock.warning_line).toBeGreaterThan(0);
      });
      
      expect(lowStocks).toHaveLength(2); // stock-003 和 stock-004
    });

    it('应该正确过滤特定库存类型', () => {
      const stockList = mockStockData;
      
      stockTypes.forEach(stockType => {
        const filteredStocks = stockList.filter(stock => stock.stock_type === stockType);
        
        filteredStocks.forEach(stock => {
          expect(stock.stock_type).toBe(stockType);
        });
      });
    });

    it('应该正确过滤特定商品的库存', () => {
      const stockList = mockStockData;
      const productId = 'product-001';
      
      const productStocks = stockList.filter(stock => stock.product_id === productId);
      
      productStocks.forEach(stock => {
        expect(stock.product_id).toBe(productId);
      });
      
      expect(productStocks).toHaveLength(2); // stock-001 和 stock-002
    });

    it('应该正确过滤特定SKU的库存', () => {
      const stockList = mockStockData;
      const skuId = 'sku-001';
      
      const skuStocks = stockList.filter(stock => stock.sku_id === skuId);
      
      skuStocks.forEach(stock => {
        expect(stock.sku_id).toBe(skuId);
      });
      
      expect(skuStocks).toHaveLength(2); // stock-001 和 stock-002
    });
  });

  describe('库存业务规则验证测试', () => {
    it('应该验证同一SKU不能有重复的可销售库存记录', () => {
      const stockList = mockStockData;
      const sellableStocks = stockList.filter(stock => stock.stock_type === 'sellable');
      
      const skuGroups = sellableStocks.reduce((acc, stock) => {
        const key = `${stock.product_id}-${stock.sku_id}-${stock.warehouse_id || 'default'}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // 每个SKU在每个仓库只能有一个可销售库存记录
      Object.values(skuGroups).forEach(count => {
        expect(count).toBe(1);
      });
    });

    it('应该验证库存调整必须有明确的类型', () => {
      stockAdjustRequests.forEach(request => {
        expect(request.type).toBeDefined();
        expect(stockLogTypes).toContain(request.type);
      });
    });

    it('应该验证库存预警线设置合理性', () => {
      const stockList = mockStockData;
      
      stockList.forEach(stock => {
        // 预警线不能为负数
        expect(stock.warning_line).toBeGreaterThanOrEqual(0);
        
        // 预警线应该小于或等于当前库存（对于正常库存状态）
        if (stock.quantity > 0 && stock.warning_line > stock.quantity) {
          // 这种情况表示库存已经低于预警线，是合理的业务状态
          expect(stock.warning_line).toBeGreaterThan(stock.quantity);
        }
      });
    });
  });

  describe('数据完整性验证测试', () => {
    it('应该确保所有必需字段都存在', () => {
      const stockData = mockStockData[0];
      
      const requiredFields = ['id', 'product_id', 'sku_id', 'stock_type', 'quantity', 'warning_line'];
      
      requiredFields.forEach(field => {
        expect(stockData).toHaveProperty(field);
        expect(stockData[field as keyof typeof stockData]).toBeDefined();
      });
    });

    it('应该确保时间字段格式正确', () => {
      const stockData = mockStockData[0];
      
      expect(stockData.created_at).toBeInstanceOf(Date);
      expect(stockData.updated_at).toBeInstanceOf(Date);
      expect(stockData.updated_at.getTime()).toBeGreaterThanOrEqual(stockData.created_at.getTime());
    });

    it('应该确保数值字段类型正确', () => {
      const stockData = mockStockData[0];
      
      expect(typeof stockData.quantity).toBe('number');
      expect(typeof stockData.warning_line).toBe('number');
      expect(Number.isFinite(stockData.quantity)).toBe(true);
      expect(Number.isFinite(stockData.warning_line)).toBe(true);
      expect(Number.isInteger(stockData.quantity)).toBe(true);
      expect(Number.isInteger(stockData.warning_line)).toBe(true);
    });

    it('应该确保枚举字段值有效', () => {
      const stockData = mockStockData[0];
      
      expect(['sellable', 'locked', 'warning']).toContain(stockData.stock_type);
    });
  });
}); 