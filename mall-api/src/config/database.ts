import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

/**
 * 创建Prisma客户端单例
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

/**
 * 数据库连接测试
 * @returns Promise<void>
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败', error);
    process.exit(1);
  }
};

/**
 * 数据库断开连接
 * @returns Promise<void>
 */
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('数据库连接已断开');
};
