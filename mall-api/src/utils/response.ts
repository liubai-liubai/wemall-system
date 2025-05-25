/**
 * 响应格式化工具
 * 提供统一的API响应格式，确保前端获得一致的数据结构
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ApiResponse, PageResponse } from '../types/common.js';

/**
 * 成功响应
 * @param data 响应数据
 * @param message 响应消息
 * @param code 响应状态码
 * @returns 格式化的成功响应
 */
export function success<T = any>(
  data: T = null as any, 
  message = '操作成功', 
  code = 200
): ApiResponse<T> {
  return {
    code,
    message,
    data,
    timestamp: Date.now(),
  };
}

/**
 * 错误响应
 * @param message 错误消息
 * @param code 错误状态码
 * @param data 错误数据
 * @returns 格式化的错误响应
 */
export function error<T = any>(
  message = '操作失败', 
  code = 500, 
  data: T = null as any
): ApiResponse<T> {
  return {
    code,
    message,
    data,
    timestamp: Date.now(),
  };
}

/**
 * 分页响应
 * @param list 数据列表
 * @param total 总数
 * @param page 当前页
 * @param size 页大小
 * @param message 响应消息
 * @param code 响应状态码
 * @returns 格式化的分页响应
 */
export function pageSuccess<T = any>(
  list: T[],
  total: number,
  page: number,
  size: number,
  message = '获取成功',
  code = 200
): PageResponse<T> {
  const pages = Math.ceil(total / size);
  
  return {
    code,
    message,
    data: {
    list,
    total,
    page,
    size,
      pages,
    },
    timestamp: Date.now(),
  };
}

/**
 * 验证错误响应
 * @param errors 验证错误详情
 * @param message 错误消息
 * @returns 格式化的验证错误响应
 */
export function validationError(
  errors: Record<string, string[]>,
  message = '参数验证失败'
): ApiResponse<Record<string, string[]>> {
  return {
    code: 400,
    message,
    data: errors,
    timestamp: Date.now(),
  };
}

/**
 * 认证错误响应
 * @param message 错误消息
 * @returns 格式化的认证错误响应
 */
export function authError(message = '认证失败'): ApiResponse<null> {
  return {
    code: 401,
    message,
    data: null,
    timestamp: Date.now(),
  };
}

/**
 * 权限错误响应
 * @param message 错误消息
 * @returns 格式化的权限错误响应
 */
export function permissionError(message = '权限不足'): ApiResponse<null> {
  return {
    code: 403,
    message,
    data: null,
    timestamp: Date.now(),
  };
}

/**
 * 资源不存在错误响应
 * @param message 错误消息
 * @returns 格式化的404错误响应
 */
export function notFoundError(message = '资源不存在'): ApiResponse<null> {
  return {
    code: 404,
    message,
    data: null,
    timestamp: Date.now(),
  };
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