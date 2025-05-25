/**
 * 认证相关API
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { request } from '@/utils/request';
import type { LoginRequest, LoginResponse } from '@/types';

/**
 * 管理员登录
 */
export const login = (data: LoginRequest) => {
  return request.post<LoginResponse>('/auth/admin/login', data);
};

/**
 * 管理员登出
 */
export const logout = () => {
  return request.post('/auth/admin/logout');
};

/**
 * 刷新token
 */
export const refreshToken = (refreshToken: string) => {
  return request.post<{ token: string; refreshToken: string }>('/auth/refresh-token', {
    refreshToken,
  });
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return request.get('/auth/me');
};

/**
 * 修改密码
 */
export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  return request.post('/auth/change-password', data);
}; 