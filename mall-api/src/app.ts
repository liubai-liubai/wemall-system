import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { prisma, initDatabase, closeDatabase } from './config/database.js';
import { success, error } from './utils/response.js';
import { logger } from './utils/logger.js';
import { 
  IHealthCheckData, 
  IDatabaseTestData, 
  IErrorData 
} from './types/common.js';
import mainRouter from './routes/index.js';
import { swaggerUI, docsRedirect } from './middleware/swagger.js';

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
  
  // 新增：API文档重定向中间件
  app.use(docsRedirect());
  
  // 新增：Swagger UI中间件
  app.use(swaggerUI());
  
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
    ctx.body = success(data, '服务运行正常');
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
      ctx.body = success(data, '数据库连接成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      const errorData: IErrorData = {
        error: errorMessage
      };
      ctx.body = error('数据库连接失败', 500);
    }
    return;
  }
  await next();
};

/**
 * 404处理中间件
 */
const notFoundHandler = async (ctx: Koa.Context): Promise<void> => {
  ctx.body = error('接口不存在', 404);
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
 * 应用初始化
 */
const initializeApp = async (): Promise<void> => {
  try {
    // 1. 先连接数据库
    await initDatabase();
    
    // 2. 先配置基础中间件（包括bodyParser和Swagger）
    setupMiddleware();
    
    // 3. 注册主路由（这样路由就能使用bodyParser解析的数据）
    app.use(mainRouter.routes());
    app.use(mainRouter.allowedMethods());
    
    // 4. 设置其他路由（健康检查等）
    setupRoutes();
    
    // 5. 启动服务器
    startServer();
    
    // 6. 设置优雅关闭
    setupGracefulShutdown();
    
  } catch (err) {
    logger.error('应用初始化失败', err);
    process.exit(1);
  }
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
    logger.info(`API文档: http://localhost:${PORT}/api-docs`);
  });
};

/**
 * 优雅关闭处理
 */
const setupGracefulShutdown = (): void => {
  process.on('SIGTERM', async () => {
    console.log('收到 SIGTERM 信号，开始优雅关闭...');
    await closeDatabase();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('收到 SIGINT 信号，开始优雅关闭...');
    await closeDatabase();
    process.exit(0);
  });
};

// 启动应用
initializeApp();