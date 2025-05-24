/**
 * 统一响应格式工具
 * 提供标准化的API响应格式，确保所有接口返回格式一致
 * @author AI Assistant
 * @since 1.0.0
 */

import { Context } from 'koa';

/**
 * API响应基础接口
 */
interface ApiResponse<T = unknown> {
  code: number;        // 状态码
  message: string;     // 消息
  data: T;            // 数据
  timestamp: number;   // 时间戳
}

/**
 * 分页响应数据接口
 */
interface PageData<T> {
  list: T[];          // 数据列表
  total: number;      // 总数
  page: number;       // 当前页
  size: number;       // 页大小
  pages: number;      // 总页数
}

/**
 * 成功响应
 * @param ctx Koa上下文
 * @param data 响应数据
 * @param message 响应消息
 * @param code HTTP状态码
 */
export function success<T>(
  ctx: Context,
  data: T,
  message: string = '操作成功',
  code: number = 200
): void {
  const response: ApiResponse<T> = {
    code,
    message,
    data,
    timestamp: Date.now()
  };
  
  ctx.status = code;
  ctx.body = response;
}

/**
 * 错误响应
 * @param ctx Koa上下文
 * @param message 错误消息
 * @param code HTTP状态码
 * @param data 错误详情数据
 */
export function error<T = null>(
  ctx: Context,
  message: string,
  code: number = 500,
  data: T = null as T
): void {
  const response: ApiResponse<T> = {
    code,
    message,
    data,
    timestamp: Date.now()
  };
  
  ctx.status = code;
  ctx.body = response;
}

/**
 * 分页响应
 * @param ctx Koa上下文
 * @param list 数据列表
 * @param total 总数
 * @param page 当前页
 * @param size 页大小
 * @param message 响应消息
 */
export function paginate<T>(
  ctx: Context,
  list: T[],
  total: number,
  page: number,
  size: number,
  message: string = '获取成功'
): void {
  const pages = Math.ceil(total / size);
  
  const pageData: PageData<T> = {
    list,
    total,
    page,
    size,
    pages
  };
  
  success(ctx, pageData, message);
}

/**
 * 响应状态码常量
 */
export const HTTP_STATUS = {
  OK: 200,                    // 成功
  CREATED: 201,              // 创建成功
  NO_CONTENT: 204,           // 无内容
  BAD_REQUEST: 400,          // 请求错误
  UNAUTHORIZED: 401,         // 未授权
  FORBIDDEN: 403,            // 禁止访问
  NOT_FOUND: 404,            // 未找到
  METHOD_NOT_ALLOWED: 405,   // 方法不允许
  CONFLICT: 409,             // 冲突
  UNPROCESSABLE_ENTITY: 422, // 无法处理的实体
  INTERNAL_SERVER_ERROR: 500, // 服务器内部错误
  BAD_GATEWAY: 502,          // 网关错误
  SERVICE_UNAVAILABLE: 503   // 服务不可用
} as const; 