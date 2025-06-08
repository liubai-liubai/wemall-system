/**
 * 集成测试环境设置
 * 负责配置集成测试所需的服务器、数据库、环境变量等基础设施
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { jest, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { Server } from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import router from '../../src/routes/index';

// 全局测试配置
jest.setTimeout(60000); // 集成测试需要更长时间

/**
 * 集成测试环境变量配置
 * 设置专用的测试环境配置，避免与开发环境冲突
 */
export const setupTestEnvironment = (): void => {
  // 核心环境标识
  process.env.NODE_ENV = 'test';
  
  // JWT配置（测试专用）
  process.env.JWT_SECRET = 'integration-test-jwt-secret-key-12345';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  
  // 数据库配置（集成测试专用数据库）
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 
    'mysql://root:123456@localhost:3307/mall_integration_test';
  
  // Redis配置（测试专用）
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.REDIS_PASSWORD = '';
  process.env.REDIS_DB = '2'; // 使用独立的DB索引避免冲突
  
  // 微信小程序配置（测试环境）
  process.env.WECHAT_APP_ID = 'integration_test_app_id';
  process.env.WECHAT_APP_SECRET = 'integration_test_app_secret';
  
  // 服务配置
  process.env.PORT = '0'; // 自动分配端口
  process.env.API_PREFIX = '/api/v1';
  
  // 日志配置
  process.env.LOG_LEVEL = 'error'; // 集成测试时减少日志输出
  
  // 文件上传配置（测试环境）
  process.env.UPLOAD_DIR = './tests/temp/uploads';
  process.env.MAX_FILE_SIZE = '10485760'; // 10MB
  
  // 性能测试配置
  process.env.MAX_REQUEST_SIZE = '50mb';
  process.env.REQUEST_TIMEOUT = '30000';
};

/**
 * 测试服务器类
 * 管理Koa应用实例的启动和关闭
 */
export class TestServer {
  private app: Koa;
  private server: Server | null = null;
  private port: number = 0;
  
  constructor() {
    this.app = new Koa();
    this.setupMiddleware();
  }
  
  /**
   * 配置中间件
   * 按照生产环境的配置设置测试服务器中间件
   */
  private setupMiddleware(): void {
    // 错误处理中间件
    this.app.use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        console.error('集成测试服务器错误:', error);
        ctx.status = error instanceof Error && 'status' in error 
          ? (error as any).status || 500 
          : 500;
        ctx.body = {
          code: ctx.status,
          message: error instanceof Error ? error.message : '服务器内部错误',
          data: null,
          timestamp: Date.now()
        };
      }
    });
    
    // CORS中间件
    this.app.use(cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true
    }));
    
    // 请求体解析中间件
    this.app.use(bodyParser({
      jsonLimit: process.env.MAX_REQUEST_SIZE || '50mb',
      textLimit: process.env.MAX_REQUEST_SIZE || '50mb',
      enableTypes: ['json', 'form', 'text']
    }));
    
    // 注册路由
    this.app.use(router.routes());
    this.app.use(router.allowedMethods());
  }
  
  /**
   * 启动测试服务器
   * @returns Promise<number> 返回服务器监听的端口号
   */
  async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(0, () => {
        const address = this.server?.address();
        if (address && typeof address === 'object') {
          this.port = address.port;
          console.log(`集成测试服务器启动成功，端口: ${this.port}`);
          resolve(this.port);
        } else {
          reject(new Error('无法获取服务器端口'));
        }
      });
      
      this.server.on('error', (error) => {
        console.error('测试服务器启动失败:', error);
        reject(error);
      });
    });
  }
  
  /**
   * 停止测试服务器
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error) => {
          if (error) {
            console.error('测试服务器停止失败:', error);
            reject(error);
          } else {
            console.log('集成测试服务器已停止');
            this.server = null;
            this.port = 0;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
  
  /**
   * 获取服务器端口
   */
  getPort(): number {
    return this.port;
  }
  
  /**
   * 获取服务器基础URL
   */
  getBaseUrl(): string {
    return `http://localhost:${this.port}`;
  }
  
  /**
   * 获取API基础URL
   */
  getApiBaseUrl(): string {
    return `${this.getBaseUrl()}${process.env.API_PREFIX || '/api/v1'}`;
  }
}

// 全局测试服务器实例
let globalTestServer: TestServer | null = null;

/**
 * 获取全局测试服务器实例
 */
export const getTestServer = (): TestServer => {
  if (!globalTestServer) {
    globalTestServer = new TestServer();
  }
  return globalTestServer;
};

/**
 * 全局测试环境设置钩子
 * 在所有测试开始前执行
 */
export const setupGlobalTestEnvironment = async (): Promise<void> => {
  // 设置环境变量
  setupTestEnvironment();
  
  // 启动测试服务器
  const testServer = getTestServer();
  await testServer.start();
  
  console.log('🚀 集成测试环境准备完成');
  console.log(`📡 测试服务器地址: ${testServer.getApiBaseUrl()}`);
};

/**
 * 全局测试环境清理钩子
 * 在所有测试结束后执行
 */
export const cleanupGlobalTestEnvironment = async (): Promise<void> => {
  // 停止测试服务器
  if (globalTestServer) {
    await globalTestServer.stop();
    globalTestServer = null;
  }
  
  console.log('🧹 集成测试环境清理完成');
};

/**
 * Jest全局钩子设置
 */
beforeAll(async () => {
  await setupGlobalTestEnvironment();
});

afterAll(async () => {
  await cleanupGlobalTestEnvironment();
});

// 每个测试前后的清理
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// 未处理的Promise拒绝处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('集成测试中未处理的Promise拒绝:', {
    reason,
    promise
  });
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  console.error('集成测试中未捕获的异常:', error);
  process.exit(1);
}); 