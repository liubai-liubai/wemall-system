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
 * @author 刘白 & AI Assistant
 */
const setupMiddleware = (): void => {
  // 跨域支持 - 配置详细的CORS选项
  app.use(cors({
    origin: (ctx) => {
      // 允许的域名列表
      const allowedOrigins = [
        'http://localhost:5173',  // Vite开发服务器
        'http://localhost:3000',  // 本地开发
        'http://127.0.0.1:5173',  // 本地IP
        'http://127.0.0.1:3000'   // 本地IP
      ];
      
      const requestOrigin = ctx.headers.origin;
      if (!requestOrigin) {
        return '*';
      }
      
      if (allowedOrigins.includes(requestOrigin)) {
        return requestOrigin;
      }
      
      // 如果不在允许列表中，返回第一个允许的域名
      return allowedOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24小时
  }));
  
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
 * 设置路由处理器
 */
const setupRoutes = (): void => {
  app.use(healthCheckHandler);
  app.use(databaseTestHandler);
};

/**
 * 404处理中间件
 */
const notFoundHandler = async (ctx: Koa.Context): Promise<void> => {
  ctx.body = error('接口不存在', 404);
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
    
    // 3. 设置健康检查等路由
    setupRoutes();
    
    // 4. 注册主路由（这样路由就能使用bodyParser解析的数据）
    app.use(mainRouter.routes());
    app.use(mainRouter.allowedMethods());
    
    // 添加调试日志
    logger.info('主路由已注册，包含以下路由:');
    logger.info('- /api/v1/dashboard/stats');
    logger.info('- /api/v1/dashboard/system-info');
    logger.info('- /api/v1/dashboard/recent-activities');
    
    // 输出实际的路由堆栈用于调试
    logger.info('Router stack 详细信息:');
    mainRouter.stack.forEach((layer: any, index: number) => {
      logger.info(`Route ${index + 1}: ${layer.path || 'unknown'} - Methods: ${JSON.stringify(layer.methods)}`);
    });
    
    // 5. 最后注册404处理器
    app.use(notFoundHandler);
    
    // 6. 启动服务器
    startServer();
    
    // 7. 设置优雅关闭
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