/**
 * Prisma数据库模拟对象
 * 用于单元测试中模拟数据库操作，避免依赖真实数据库
 * @author 刘白 & AI Assistant
 */

import { jest } from '@jest/globals';

/**
 * 创建Prisma模拟对象
 * 包含用户、角色、权限等模型的常用方法模拟
 */
export const createPrismaMock = (): any => {
  return {
    // 用户模型
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn()
    },

    // 角色模型
    role: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn()
    },

    // 权限模型
    permission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },

    // 角色权限关联模型
    rolePermission: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },

    // 刷新令牌模型
    refreshToken: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },

    // 管理员用户模型
    adminUser: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },

    // 管理员用户角色关联模型
    adminUserRole: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },

    // 部门模型
    department: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },

    // 商品分类模型
    productCategory: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },

    // 商品模型
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },

    // SKU模型
    sku: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },

    // 购物车模型
    shoppingCart: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },

    // 订单模型
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },

    // 事务方法
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn()
  };
};

/**
 * 重置所有模拟方法
 * @param prismaMock Prisma模拟对象
 */
export const resetPrismaMock = (prismaMock: any) => {
  Object.values(prismaMock).forEach((model: any) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method: any) => {
        if (jest.isMockFunction(method)) {
          method.mockReset();
        }
      });
    } else if (jest.isMockFunction(model)) {
      model.mockReset();
    }
  });
};

/**
 * 设置Prisma模拟的默认返回值
 * @param prismaMock Prisma模拟对象
 */
export const setupPrismaMockDefaults = (prismaMock: any) => {
  // 设置默认的空返回值
  prismaMock.user.findUnique.mockResolvedValue(null);
  prismaMock.user.findMany.mockResolvedValue([]);
  prismaMock.user.count.mockResolvedValue(0);

  prismaMock.role.findUnique.mockResolvedValue(null);
  prismaMock.role.findMany.mockResolvedValue([]);
  prismaMock.role.count.mockResolvedValue(0);

  prismaMock.permission.findUnique.mockResolvedValue(null);
  prismaMock.permission.findMany.mockResolvedValue([]);

  prismaMock.refreshToken.findUnique.mockResolvedValue(null);
  prismaMock.refreshToken.findMany.mockResolvedValue([]);

  // 设置事务方法的默认行为
  prismaMock.$transaction.mockImplementation(async (callback: any) => {
    if (typeof callback === 'function') {
      return await callback(prismaMock);
    }
    return [];
  });

  // 设置连接方法的默认行为
  prismaMock.$connect.mockResolvedValue(undefined);
  prismaMock.$disconnect.mockResolvedValue(undefined);
}; 