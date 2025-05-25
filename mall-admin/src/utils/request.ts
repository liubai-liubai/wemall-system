/**
 * HTTP请求工具
 * 基于axios封装，提供统一的请求和响应处理
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { config } from '@/config';
import type { ApiResponse } from '@/types';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从本地存储获取token
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 如果是FormData，则移除Content-Type让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url, config.data || config.params);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    console.log('✅ Response:', response.config.url, data);
    
    // 如果响应成功
    if (data.code === 0 || data.code === 200) {
      return response;
    }
    
    // 处理业务错误
    const message = data.message || '请求失败';
    ElMessage.error(message);
    
    return Promise.reject(new Error(message));
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    const { response } = error;
    let message = '网络错误，请稍后重试';
    
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 400:
          message = data?.message || '请求参数错误';
          break;
        case 401:
          message = '登录已过期，请重新登录';
          handleAuthError();
          break;
        case 403:
          message = '权限不足，无法访问';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 422:
          message = data?.message || '请求参数验证失败';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        case 502:
          message = '网关错误';
          break;
        case 503:
          message = '服务不可用';
          break;
        case 504:
          message = '网关超时';
          break;
        default:
          message = data?.message || `请求失败 (${status})`;
      }
    } else if (error.code === 'NETWORK_ERROR') {
      message = '网络连接失败，请检查网络设置';
    } else if (error.code === 'TIMEOUT') {
      message = '请求超时，请稍后重试';
    }
    
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

/**
 * 处理认证错误
 */
const handleAuthError = () => {
  // 清除本地存储
  localStorage.removeItem(config.storage.token);
  localStorage.removeItem(config.storage.refreshToken);
  localStorage.removeItem(config.storage.userInfo);
  localStorage.removeItem(config.storage.permissions);
  localStorage.removeItem(config.storage.menus);
  
  // 提示用户重新登录
  ElMessageBox.confirm('登录状态已过期，是否重新登录？', '提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 跳转到登录页
    window.location.href = '/login';
  }).catch(() => {
    // 用户取消，跳转到首页
    window.location.href = '/';
  });
};

// 导出请求方法
export const request = {
  /**
   * GET请求
   */
  get<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.get(url, { params, ...config }).then(res => res.data);
  },

  /**
   * POST请求
   */
  post<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.post(url, data, config).then(res => res.data);
  },

  /**
   * PUT请求
   */
  put<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.put(url, data, config).then(res => res.data);
  },

  /**
   * PATCH请求
   */
  patch<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.patch(url, data, config).then(res => res.data);
  },

  /**
   * DELETE请求
   */
  delete<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.delete(url, { params, ...config }).then(res => res.data);
  },

  /**
   * 上传文件
   */
  upload<T = any>(url: string, file: File, data?: object, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, (data as any)[key]);
      });
    }
    
    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }).then(res => res.data);
  },

  /**
   * 下载文件
   */
  download(url: string, params?: object, filename?: string): Promise<void> {
    return service.get(url, {
      params,
      responseType: 'blob',
    }).then((response: any) => {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    });
  },
};

export default service; 