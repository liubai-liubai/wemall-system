/**
 * API客户端封装工具
 * 提供统一的HTTP请求接口，支持认证、请求拦截、响应处理等功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import supertest, { Test, SuperTest } from 'supertest';
import { expect } from '@jest/globals';
import { getTestServer } from '../setup';

/**
 * API响应接口定义
 * 统一的API响应格式
 */
export interface IApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * 分页响应接口定义
 */
export interface IPageResponse<T = any> {
  code: number;
  message: string;
  data: {
    list: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  timestamp: number;
}

/**
 * HTTP方法枚举
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

/**
 * 请求配置接口
 */
export interface IRequestConfig {
  headers?: Record<string, string>;
  query?: Record<string, any>;
  timeout?: number;
  expect?: number | number[];
  auth?: {
    token?: string;
    type?: 'Bearer' | 'JWT';
  };
}

/**
 * API客户端类
 * 封装HTTP请求的统一客户端
 */
export class ApiClient {
  private defaultHeaders: Record<string, string> = {};
  private authToken: string | null = null;
  
  constructor() {
    // 设置默认请求头
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Integration-Test-Client/1.0.0'
    };
  }
  
  /**
   * 获取测试服务器基础URL
   * 动态获取，确保服务器已启动
   */
  private getBaseUrl(): string {
    const testServer = getTestServer();
    return testServer.getApiBaseUrl();
  }
  
  /**
   * 设置认证Token
   * @param token JWT Token
   * @param type Token类型
   */
  setAuthToken(token: string, type: 'Bearer' | 'JWT' = 'Bearer'): void {
    this.authToken = token;
    this.defaultHeaders['Authorization'] = `${type} ${token}`;
  }
  
  /**
   * 清除认证Token
   */
  clearAuthToken(): void {
    this.authToken = null;
    delete this.defaultHeaders['Authorization'];
  }
  
  /**
   * 获取当前认证Token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }
  
  /**
   * 设置默认请求头
   * @param headers 请求头对象
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    Object.assign(this.defaultHeaders, headers);
  }
  
  /**
   * 发起HTTP请求的通用方法
   * @param method HTTP方法
   * @param path API路径
   * @param data 请求数据
   * @param config 请求配置
   */
  private async makeRequest<T = any>(
    method: HttpMethod,
    path: string,
    data?: any,
    config: IRequestConfig = {}
  ): Promise<supertest.Response> {
    // 构建完整路径
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    
    // 合并请求头
    const headers = {
      ...this.defaultHeaders,
      ...config.headers
    };
    
    // 认证处理
    if (config.auth?.token) {
      const type = config.auth.type || 'Bearer';
      headers['Authorization'] = `${type} ${config.auth.token}`;
    }
    
    // 构建请求
    const baseUrl = this.getBaseUrl();
    const agent = supertest(baseUrl);
    let request = (agent as any)[method.toLowerCase()](fullPath);
    
    // 设置请求头
    Object.entries(headers).forEach(([key, value]) => {
      request = request.set(key, value);
    });
    
    // 设置查询参数
    if (config.query) {
      request = request.query(config.query);
    }
    
    // 设置请求体
    if (data && (method === HttpMethod.POST || method === HttpMethod.PUT || method === HttpMethod.PATCH)) {
      request = request.send(data);
    }
    
    // 设置超时
    if (config.timeout) {
      request = request.timeout(config.timeout);
    }
    
    // 设置期望状态码
    if (config.expect) {
      const expectCodes = Array.isArray(config.expect) ? config.expect : [config.expect];
      expectCodes.forEach(code => {
        request = request.expect(code);
      });
    }
    
    return request;
  }
  
  /**
   * GET请求
   * @param path API路径
   * @param config 请求配置
   */
  async get<T = any>(
    path: string,
    config: IRequestConfig = {}
  ): Promise<supertest.Response> {
    return this.makeRequest<T>(HttpMethod.GET, path, undefined, config);
  }
  
  /**
   * POST请求
   * @param path API路径
   * @param data 请求数据
   * @param config 请求配置
   */
  async post<T = any>(
    path: string,
    data?: any,
    config: IRequestConfig = {}
  ): Promise<supertest.Response> {
    return this.makeRequest<T>(HttpMethod.POST, path, data, config);
  }
  
  /**
   * PUT请求
   * @param path API路径
   * @param data 请求数据
   * @param config 请求配置
   */
  async put<T = any>(
    path: string,
    data?: any,
    config: IRequestConfig = {}
  ): Promise<supertest.Response> {
    return this.makeRequest<T>(HttpMethod.PUT, path, data, config);
  }
  
  /**
   * PATCH请求
   * @param path API路径
   * @param data 请求数据
   * @param config 请求配置
   */
  async patch<T = any>(
    path: string,
    data?: any,
    config: IRequestConfig = {}
  ): Promise<supertest.Response> {
    return this.makeRequest<T>(HttpMethod.PATCH, path, data, config);
  }
  
  /**
   * DELETE请求
   * @param path API路径
   * @param config 请求配置
   */
  async delete<T = any>(
    path: string,
    config: IRequestConfig = {}
  ): Promise<supertest.Response> {
    return this.makeRequest<T>(HttpMethod.DELETE, path, undefined, config);
  }
  
  /**
   * 上传文件请求
   * @param path API路径
   * @param fieldName 文件字段名
   * @param filePath 文件路径
   * @param config 请求配置
   */
  async upload(
    path: string,
    fieldName: string,
    filePath: string,
    config: IRequestConfig = {}
  ): Promise<supertest.Response> {
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    
    const baseUrl = this.getBaseUrl();
    const agent = supertest(baseUrl);
    let request = agent.post(fullPath);
    
    // 设置认证头
    if (this.authToken) {
      request = request.set('Authorization', this.defaultHeaders['Authorization'] || '');
    }
    
    // 设置其他请求头（排除Content-Type，让supertest自动设置）
    Object.entries(config.headers || {}).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type') {
        request = request.set(key, value);
      }
    });
    
    // 添加文件
    request = request.attach(fieldName, filePath);
    
    return request;
  }
}

/**
 * 响应工具类
 * 提供响应数据解析和断言的便捷方法
 */
export class ResponseHelper {
  
  /**
   * 验证API响应格式
   * @param response supertest响应对象
   * @param expectedCode 期望的业务状态码
   */
  static validateApiResponse<T = any>(
    response: supertest.Response,
    expectedCode?: number
  ): IApiResponse<T> {
    // 验证HTTP状态码
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
    
    // 验证响应体结构
    expect(response.body).toHaveProperty('code');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('timestamp');
    
    // 验证字段类型
    expect(typeof response.body.code).toBe('number');
    expect(typeof response.body.message).toBe('string');
    expect(typeof response.body.timestamp).toBe('number');
    
    // 验证业务状态码
    if (expectedCode !== undefined) {
      expect(response.body.code).toBe(expectedCode);
    }
    
    return response.body as IApiResponse<T>;
  }
  
  /**
   * 验证分页响应格式
   * @param response supertest响应对象
   * @param expectedCode 期望的业务状态码
   */
  static validatePageResponse<T = any>(
    response: supertest.Response,
    expectedCode?: number
  ): IPageResponse<T> {
    const apiResponse = this.validateApiResponse(response, expectedCode);
    
    // 验证分页数据结构
    expect(apiResponse.data).toHaveProperty('list');
    expect(apiResponse.data).toHaveProperty('total');
    expect(apiResponse.data).toHaveProperty('page');
    expect(apiResponse.data).toHaveProperty('size');
    expect(apiResponse.data).toHaveProperty('pages');
    
    // 验证分页字段类型
    expect(Array.isArray(apiResponse.data.list)).toBe(true);
    expect(typeof apiResponse.data.total).toBe('number');
    expect(typeof apiResponse.data.page).toBe('number');
    expect(typeof apiResponse.data.size).toBe('number');
    expect(typeof apiResponse.data.pages).toBe('number');
    
    return apiResponse as IPageResponse<T>;
  }
  
  /**
   * 验证错误响应
   * @param response supertest响应对象
   * @param expectedHttpStatus 期望的HTTP状态码
   * @param expectedErrorCode 期望的错误码
   */
  static validateErrorResponse(
    response: supertest.Response,
    expectedHttpStatus?: number,
    expectedErrorCode?: number
  ): IApiResponse {
    // 验证HTTP状态码
    if (expectedHttpStatus !== undefined) {
      expect(response.status).toBe(expectedHttpStatus);
    } else {
      expect(response.status).toBeGreaterThanOrEqual(400);
    }
    
    // 验证响应体结构
    expect(response.body).toHaveProperty('code');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('timestamp');
    
    // 验证错误码
    if (expectedErrorCode !== undefined) {
      expect(response.body.code).toBe(expectedErrorCode);
    } else {
      expect(response.body.code).toBeGreaterThanOrEqual(400);
    }
    
    return response.body as IApiResponse;
  }
  
  /**
   * 提取响应数据
   * @param response supertest响应对象
   */
  static extractData<T = any>(response: supertest.Response): T {
    const apiResponse = this.validateApiResponse<T>(response);
    return apiResponse.data;
  }
  
  /**
   * 提取分页列表数据
   * @param response supertest响应对象
   */
  static extractPageList<T = any>(response: supertest.Response): T[] {
    const pageResponse = this.validatePageResponse<T>(response);
    return pageResponse.data.list;
  }
}

// 导出工厂函数
export const createApiClient = (): ApiClient => new ApiClient();

// 导出默认实例
export const apiClient = new ApiClient(); 