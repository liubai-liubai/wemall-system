/**
 * 角色相关API
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { request } from '@/utils/request';
import type {
  Role,
  RoleQueryParams,
  CreateRoleRequest,
  UpdateRoleRequest,
  PageResponse,
} from '@/types';

/**
 * 获取角色分页列表
 */
export const getRoleList = (params: RoleQueryParams) => {
  return request.get<PageResponse<Role>>('/roles', params);
};

/**
 * 获取所有角色列表（用于下拉选择）
 */
export const getAllRoles = () => {
  return request.get<Role[]>('/roles/all');
};

/**
 * 获取角色详情
 */
export const getRoleDetail = (id: string) => {
  return request.get<Role>(`/roles/${id}`);
};

/**
 * 创建角色
 */
export const createRole = (data: CreateRoleRequest) => {
  return request.post<Role>('/roles', data);
};

/**
 * 更新角色
 */
export const updateRole = (id: string, data: UpdateRoleRequest) => {
  return request.put<Role>(`/roles/${id}`, data);
};

/**
 * 删除角色
 */
export const deleteRole = (id: string) => {
  return request.delete(`/roles/${id}`);
};

/**
 * 启用/禁用角色
 */
export const toggleRoleStatus = (id: string, status: number) => {
  return request.patch<Role>(`/roles/${id}`, { status });
};

/**
 * 获取角色权限ID列表
 */
export const getRolePermissionIds = (id: string) => {
  return request.get<string[]>(`/roles/${id}/permissions`);
}; 