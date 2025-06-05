/**
 * 测试工具函数
 * @author 刘白 & AI Assistant
 */

import { randomUUID } from 'crypto';

// 生成测试用的UUID
export const generateTestId = (): string => {
  return randomUUID();
};

// 生成测试用的时间戳
export const generateTestTimestamp = (): Date => {
  return new Date();
};

// 生成随机字符串
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 生成随机数字
export const generateRandomNumber = (min: number = 1, max: number = 1000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 生成随机布尔值
export const generateRandomBoolean = (): boolean => {
  return Math.random() < 0.5;
};

// 生成测试用的商品数据
export const generateTestProduct = (overrides: any = {}) => {
  const id = generateTestId();
  const now = generateTestTimestamp();
  
  return {
    id,
    name: `测试商品-${generateRandomString(6)}`,
    slug: `test-product-${generateRandomString(6)}`,
    description: `测试商品描述-${generateRandomString(10)}`,
    content: `测试商品详情-${generateRandomString(20)}`,
    categoryId: generateTestId(),
    brand: `测试品牌-${generateRandomString(4)}`,
    tags: `测试标签1,测试标签2,测试标签3`,
    status: 'ACTIVE' as const,
    sort: generateRandomNumber(1, 100),
    seoTitle: `SEO标题-${generateRandomString(8)}`,
    seoKeywords: `关键词1,关键词2,关键词3`,
    seoDescription: `SEO描述-${generateRandomString(15)}`,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
};

// 生成测试用的SKU数据
export const generateTestSku = (productId: string, overrides: any = {}) => {
  const id = generateTestId();
  const now = generateTestTimestamp();
  
  return {
    id,
    productId,
    skuCode: `SKU-${generateRandomString(8)}`,
    name: `测试SKU-${generateRandomString(6)}`,
    price: generateRandomNumber(100, 9999),
    originalPrice: generateRandomNumber(100, 9999),
    weight: generateRandomNumber(100, 5000),
    volume: generateRandomNumber(100, 10000),
    barcode: generateRandomString(13),
    image: `https://example.com/images/${generateRandomString(10)}.jpg`,
    status: 'ACTIVE' as const,
    sort: generateRandomNumber(1, 100),
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
};

// 生成测试用的库存数据
export const generateTestStock = (skuId: string, overrides: any = {}) => {
  const id = generateTestId();
  const now = generateTestTimestamp();
  
  return {
    id,
    skuId,
    warehouseId: generateTestId(),
    stockType: 'NORMAL' as const,
    totalStock: generateRandomNumber(0, 1000),
    availableStock: generateRandomNumber(0, 1000),
    lockedStock: generateRandomNumber(0, 100),
    safetyStock: generateRandomNumber(10, 50),
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
};

// 生成测试用的购物车数据
export const generateTestCart = (userId: string, skuId: string, overrides: any = {}) => {
  const id = generateTestId();
  const now = generateTestTimestamp();
  
  return {
    id,
    userId,
    skuId,
    quantity: generateRandomNumber(1, 10),
    addedAt: now,
    updatedAt: now,
    ...overrides
  };
};

// 生成测试用的用户数据
export const generateTestUser = (overrides: any = {}) => {
  const id = generateTestId();
  const now = generateTestTimestamp();
  
  return {
    id,
    openid: `test_openid_${generateRandomString(10)}`,
    unionid: `test_unionid_${generateRandomString(10)}`,
    nickname: `测试用户-${generateRandomString(4)}`,
    avatar: `https://example.com/avatars/${generateRandomString(10)}.jpg`,
    gender: generateRandomNumber(0, 2),
    language: 'zh_CN',
    city: '测试城市',
    province: '测试省份',
    country: '中国',
    phone: `138${generateRandomString(8)}`,
    email: `test${generateRandomString(6)}@example.com`,
    status: 'ACTIVE' as const,
    registeredAt: now,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
};

// 生成测试用的管理员数据
export const generateTestAdminUser = (overrides: any = {}) => {
  const id = generateTestId();
  const now = generateTestTimestamp();
  
  return {
    id,
    username: `admin_${generateRandomString(6)}`,
    password: '$2a$10$test.hash.password.for.testing.only',
    realName: `测试管理员-${generateRandomString(4)}`,
    email: `admin${generateRandomString(6)}@example.com`,
    phone: `138${generateRandomString(8)}`,
    avatar: `https://example.com/avatars/${generateRandomString(10)}.jpg`,
    departmentId: generateTestId(),
    status: 'ACTIVE' as const,
    lastLoginAt: now,
    lastLoginIp: '127.0.0.1',
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
};

// 断言助手函数
export const expectToBeUUID = (value: string) => {
  expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
};

export const expectToBeValidTimestamp = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  expect(date.getTime()).not.toBeNaN();
  expect(date.getTime()).toBeGreaterThan(0);
};

// API响应结构断言
export const expectApiResponse = (response: any) => {
  expect(response).toHaveProperty('code');
  expect(response).toHaveProperty('message');
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('timestamp');
  expect(typeof response.code).toBe('number');
  expect(typeof response.message).toBe('string');
  expect(typeof response.timestamp).toBe('number');
};

// 分页响应结构断言
export const expectPageResponse = (response: any) => {
  expectApiResponse(response);
  expect(response.data).toHaveProperty('list');
  expect(response.data).toHaveProperty('total');
  expect(response.data).toHaveProperty('page');
  expect(response.data).toHaveProperty('size');
  expect(response.data).toHaveProperty('pages');
  expect(Array.isArray(response.data.list)).toBe(true);
  expect(typeof response.data.total).toBe('number');
  expect(typeof response.data.page).toBe('number');
  expect(typeof response.data.size).toBe('number');
  expect(typeof response.data.pages).toBe('number');
};

// 等待指定时间（用于异步测试）
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 模拟异步操作
export const mockAsyncOperation = async <T>(result: T, delay: number = 100): Promise<T> => {
  await sleep(delay);
  return result;
};

// 模拟错误
export const mockError = (message: string = '测试错误'): Error => {
  return new Error(message);
};

// 深度克隆对象（测试时避免引用问题）
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
}; 