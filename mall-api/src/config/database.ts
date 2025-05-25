/**
 * 数据库配置文件
 * 统一管理Prisma客户端实例和数据库连接配置
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';

/**
 * Prisma客户端实例
 * 全局单例，确保整个应用使用同一个数据库连接
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

/**
 * 数据库连接初始化
 * 应用启动时调用，确保数据库连接正常
 */
export async function initDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

/**
 * 优雅关闭数据库连接
 * 应用关闭时调用，确保连接正确释放
 */
export async function closeDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接失败:', error);
  }
}
