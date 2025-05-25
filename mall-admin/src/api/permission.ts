/**
 * 权限相关API
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { request } from '@/utils/request';
import type {
  Permission,
  PermissionTreeNode,
  PermissionQueryParams,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from '@/types';

/**
 * 获取权限树形列表
 */
export const getPermissionTree = (params?: PermissionQueryParams) => {
  return request.get<PermissionTreeNode[]>('/permissions', params);
};

/**
 * 获取所有权限列表（用于角色分配权限）
 */
export const getAllPermissions = () => {
  return request.get<Permission[]>('/permissions/all');
};

/**
 * 获取权限详情
 */
export const getPermissionDetail = (id: string) => {
  return request.get<Permission>(`/permissions/${id}`);
};

/**
 * 创建权限
 */
export const createPermission = (data: CreatePermissionRequest) => {
  return request.post<Permission>('/permissions', data);
};

/**
 * 更新权限
 */
export const updatePermission = (id: string, data: UpdatePermissionRequest) => {
  return request.put<Permission>(`/permissions/${id}`, data);
};

/**
 * 删除权限
 */
export const deletePermission = (id: string) => {
  return request.delete(`/permissions/${id}`);
};

/**
 * 启用/禁用权限
 */
export const togglePermissionStatus = (id: string, status: number) => {
  return request.patch<Permission>(`/permissions/${id}`, { status });
}; 