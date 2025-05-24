/**
 * API统一响应格式接口
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
 * 健康检查响应数据接口
 */
export interface IHealthCheckData {
  status: string;
  timestamp: string;
  version: string;
}

/**
 * 数据库测试响应数据接口
 */
export interface IDatabaseTestData {
  database: string;
  timestamp: string;
}

/**
 * 错误响应数据接口
 */
export interface IErrorData {
  error: string;
} 