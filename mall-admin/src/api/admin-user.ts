/**
 * 管理员用户相关API
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { request } from '@/utils/request';
import type {
  AdminUser,
  AdminUserQueryParams,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  PageResponse,
} from '@/types';

/**
 * 获取管理员用户分页列表
 */
export const getAdminUserList = (params: AdminUserQueryParams) => {
  return request.get<PageResponse<AdminUser>>('/admin-users', params);
};

/**
 * 获取管理员用户详情
 */
export const getAdminUserDetail = (id: string) => {
  return request.get<AdminUser>(`/admin-users/${id}`);
};

/**
 * 创建管理员用户
 */
export const createAdminUser = (data: CreateAdminUserRequest) => {
  return request.post<AdminUser>('/admin-users', data);
};

/**
 * 更新管理员用户
 */
export const updateAdminUser = (id: string, data: UpdateAdminUserRequest) => {
  return request.put<AdminUser>(`/admin-users/${id}`, data);
};

/**
 * 删除管理员用户
 */
export const deleteAdminUser = (id: string) => {
  return request.delete(`/admin-users/${id}`);
};

/**
 * 重置管理员用户密码
 */
export const resetAdminUserPassword = (id: string, password: string) => {
  return request.post(`/admin-users/${id}/reset-password`, { password });
};

/**
 * 启用/禁用管理员用户
 */
export const toggleAdminUserStatus = (id: string, status: number) => {
  return request.patch<AdminUser>(`/admin-users/${id}`, { status });
}; 