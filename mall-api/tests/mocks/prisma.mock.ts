/**
 * Prisma Mock工具
 * @author 刘白 & AI Assistant
 */

import { jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

// 创建Prisma模拟实例
export const prismaMock = {
  // 产品相关
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn()
  },

  // SKU相关
  productSku: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn()
  },

  // 库存相关
  productStock: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    upsert: jest.fn()
  },

  // 库存日志
  stockLog: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    count: jest.fn()
  },

  // 购物车相关
  shoppingCart: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn()
  },

  // 用户相关
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },

  // 管理员用户
  adminUser: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },

  // 角色相关
  role: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },

  // 权限相关
  permission: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },

  // 分类相关
  productCategory: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },

  // 属性相关
  productAttribute: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },

  // 图片相关
  productImage: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn()
  },

  // 会员相关
  userMember: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },

  // 会员等级
  memberLevel: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },

  // 积分记录
  memberPointLog: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  },

  // 用户地址
  userAddress: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateMany: jest.fn()
  },

  // 部门相关
  department: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },

  // 事务相关
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn()
} as unknown as PrismaClient;

// 重置所有Mock
export const resetAllMocks = () => {
  Object.values(prismaMock).forEach(model => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach(method => {
        if (jest.isMockFunction(method)) {
          method.mockReset();
        }
      });
    }
  });
  
  // 重置事务和连接相关的Mock
  (prismaMock.$transaction as jest.MockedFunction<any>).mockReset?.();
  (prismaMock.$connect as jest.MockedFunction<any>).mockReset?.();
  (prismaMock.$disconnect as jest.MockedFunction<any>).mockReset?.();
};

// 模拟事务行为
export const mockTransaction = (callback?: any) => {
  return (prismaMock.$transaction as jest.MockedFunction<any>).mockImplementation(async (fn: any) => {
    return await fn(prismaMock);
  });
};

export default prismaMock; 