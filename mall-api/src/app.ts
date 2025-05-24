import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { prisma, connectDatabase, disconnectDatabase } from './config/database.js';
import { success, error } from './utils/response.js';
import { logger } from './utils/logger.js';
import { 
  IHealthCheckData, 
  IDatabaseTestData, 
  IErrorData 
} from './types/common.js';

/**
 * 创建Koa应用实例
 */
const app = new Koa();

/**
 * 配置基础中间件
 */
const setupMiddleware = (): void => {
  // 跨域支持
  app.use(cors());
  
  // 请求体解析
  app.use(bodyParser());
  
  // 请求日志中间件
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    logger.info(`${ctx.method} ${ctx.url} - ${ctx.status} - ${duration}ms`);
  });
};

/**
 * 健康检查接口
 */
const healthCheckHandler = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  if (ctx.path === '/health') {
    const data: IHealthCheckData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    success(ctx, data, '服务运行正常');
    return;
  }
  await next();
};

/**
 * 数据库连接测试接口
 */
const databaseTestHandler = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  if (ctx.path === '/db-test') {
    try {
      await prisma.$connect();
      const data: IDatabaseTestData = {
        database: 'connected',
        timestamp: new Date().toISOString()
      };
      success(ctx, data, '数据库连接成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      const errorData: IErrorData = {
        error: errorMessage
      };
      error(ctx, 500, '数据库连接失败', errorData);
    }
    return;
  }
  await next();
};

/**
 * 404处理中间件
 */
const notFoundHandler = async (ctx: Koa.Context): Promise<void> => {
  error(ctx, 404, '接口不存在', null);
};

/**
 * 设置路由处理器
 */
const setupRoutes = (): void => {
  app.use(healthCheckHandler);
  app.use(databaseTestHandler);
  app.use(notFoundHandler);
};

/**
 * 启动服务器
 */
const startServer = (): void => {
  const PORT = Number(process.env.PORT) || 3000;
  
  app.listen(PORT, () => {
    logger.info(`服务器启动成功 - 端口: ${PORT}`);
    logger.info(`本地地址: http://localhost:${PORT}`);
    logger.info(`健康检查: http://localhost:${PORT}/health`);
    logger.info(`数据库测试: http://localhost:${PORT}/db-test`);
  });
};

/**
 * 优雅关闭处理
 */
const setupGracefulShutdown = (): void => {
  process.on('SIGINT', async () => {
    logger.info('正在关闭服务器...');
    await disconnectDatabase();
    process.exit(0);
  });
};

/**
 * 应用初始化
 */
const initializeApp = async (): Promise<void> => {
  try {
    // 连接数据库
    await connectDatabase();
    
    // 配置中间件
    setupMiddleware();
    
    // 设置路由
    setupRoutes();
    
    // 启动服务器
    startServer();
    
    // 设置优雅关闭
    setupGracefulShutdown();
    
  } catch (err) {
    logger.error('应用初始化失败', err);
    process.exit(1);
  }
};

// 启动应用
initializeApp();