/**
 * API统一响应格式接口
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * 分页查询参数接口
 */
export interface PageQuery {
  page?: number;
  size?: number;
}

/**
 * 分页响应数据接口
 */
export interface PageData<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * 分页响应格式接口
 */
export interface PageResponse<T> extends ApiResponse<PageData<T>> {}

/**
 * 用户信息接口
 */
export interface IUserInfo {
  id: string;
  openId: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
}

/**
 * 通用类型定义
 * 定义应用中使用的公共接口和类型
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

/**
 * 健康检查数据接口
 */
export interface IHealthCheckData {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

/**
 * 数据库测试数据接口
 */
export interface IDatabaseTestData {
  database: 'connected' | 'disconnected';
  timestamp: string;
}

/**
 * 错误数据接口
 */
export interface IErrorData {
  error: string;
  details?: unknown;
}

/**
 * 通用响应状态
 */
export type ResponseStatus = 'success' | 'error' | 'warning';

/**
 * 分页参数接口
 */
export interface IPaginationParams {
  page: number;
  size: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 分页响应数据接口
 */
export interface IPaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
} 