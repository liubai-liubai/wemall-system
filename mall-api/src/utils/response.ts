import { Context } from 'koa';
import { ApiResponse, PageData } from '../types/common.js';

/**
 * 成功响应工具函数
 * @param ctx Koa上下文对象
 * @param data 响应数据
 * @param message 响应消息
 */
export const success = <T>(ctx: Context, data: T, message = '操作成功'): void => {
  const response: ApiResponse<T> = {
    code: 200,
    message,
    data,
    timestamp: Date.now()
  };
  ctx.body = response;
};

/**
 * 分页成功响应工具函数
 * @param ctx Koa上下文对象
 * @param list 数据列表
 * @param total 总数
 * @param page 当前页
 * @param size 页大小
 * @param message 响应消息
 */
export const successPage = <T>(
  ctx: Context,
  list: T[],
  total: number,
  page: number,
  size: number,
  message = '查询成功'
): void => {
  const pages = Math.ceil(total / size);
  const pageData: PageData<T> = {
    list,
    total,
    page,
    size,
    pages
  };
  
  const response: ApiResponse<PageData<T>> = {
    code: 200,
    message,
    data: pageData,
    timestamp: Date.now()
  };
  ctx.body = response;
};

/**
 * 错误响应工具函数
 * @param ctx Koa上下文对象
 * @param code 错误码
 * @param message 错误消息
 * @param data 错误数据
 */
export const error = <T = unknown>(
  ctx: Context, 
  code = 500, 
  message = '服务器内部错误', 
  data: T | null = null
): void => {
  const response: ApiResponse<T | null> = {
    code,
    message,
    data,
    timestamp: Date.now()
  };
  ctx.status = code < 1000 ? code : 500; // HTTP状态码
  ctx.body = response;
};

/**
 * 参数错误响应
 * @param ctx Koa上下文对象
 * @param message 错误消息
 * @param data 错误数据
 */
export const badRequest = <T = unknown>(
  ctx: Context, 
  message = '参数错误', 
  data: T | null = null
): void => {
  error(ctx, 400, message, data);
};

/**
 * 未授权响应
 * @param ctx Koa上下文对象
 * @param message 错误消息
 */
export const unauthorized = (ctx: Context, message = '未授权访问'): void => {
  error(ctx, 401, message);
};

/**
 * 禁止访问响应
 * @param ctx Koa上下文对象
 * @param message 错误消息
 */
export const forbidden = (ctx: Context, message = '禁止访问'): void => {
  error(ctx, 403, message);
};

/**
 * 资源不存在响应
 * @param ctx Koa上下文对象
 * @param message 错误消息
 */
export const notFound = (ctx: Context, message = '资源不存在'): void => {
  error(ctx, 404, message);
}; 