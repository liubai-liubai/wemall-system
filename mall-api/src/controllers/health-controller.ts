/**
 * 健康检查控制器
 * 处理服务健康状态检查的业务逻辑
 * @author AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';
import { success, error, HTTP_STATUS } from '../utils/response.ts';
import { prisma } from '../config/database.ts';

/**
 * 基础健康状态接口
 */
interface BasicHealthStatus {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  uptime: number;
}

/**
 * 详细健康状态接口
 */
interface DetailedHealthStatus extends BasicHealthStatus {
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  timestamp: number;
}

class HealthController {
  /**
   * 基础健康检查
   * GET /api/v1/health
   * @param ctx Koa上下文
   */
  async basic(ctx: Context): Promise<void> {
    try {
      const healthStatus: BasicHealthStatus = {
        status: 'healthy',
        service: 'wemall-api',
        version: '1.0.0',
        uptime: process.uptime()
      };

      success(ctx, healthStatus, '服务运行正常', HTTP_STATUS.OK);
    } catch (err) {
      error(ctx, '服务状态检查失败', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 详细健康检查
   * GET /api/v1/health/detailed
   * @param ctx Koa上下文
   */
  async detailed(ctx: Context): Promise<void> {
    try {
      // 检查数据库连接
      const dbStartTime = Date.now();
      let dbStatus: 'connected' | 'disconnected' = 'disconnected';
      let dbResponseTime = 0;

      try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
        dbResponseTime = Date.now() - dbStartTime;
      } catch (dbError) {
        dbResponseTime = Date.now() - dbStartTime;
        console.error('数据库连接检查失败:', dbError);
      }

      // 获取内存使用情况
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal;
      const usedMemory = memoryUsage.heapUsed;
      const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

      const detailedStatus: DetailedHealthStatus = {
        status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
        service: 'wemall-api',
        version: '1.0.0',
        uptime: process.uptime(),
        database: {
          status: dbStatus,
          responseTime: dbResponseTime
        },
        memory: {
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: memoryPercentage
        },
        timestamp: Date.now()
      };

      if (dbStatus === 'connected') {
        success(ctx, detailedStatus, '服务详细状态检查完成', HTTP_STATUS.OK);
      } else {
        error(ctx, '数据库连接失败', HTTP_STATUS.SERVICE_UNAVAILABLE, detailedStatus);
      }
    } catch (err) {
      console.error('详细健康检查失败:', err);
      error(ctx, '详细状态检查失败', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

// 导出控制器实例
export const healthController = new HealthController();
