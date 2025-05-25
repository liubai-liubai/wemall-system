/**
 * 部门相关API
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { request } from '@/utils/request';
import type {
  Department,
  DepartmentTreeNode,
  DepartmentQueryParams,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '@/types';

/**
 * 获取部门树形列表
 */
export const getDepartmentTree = (params?: DepartmentQueryParams) => {
  return request.get<DepartmentTreeNode[]>('/departments', params);
};

/**
 * 获取部门详情
 */
export const getDepartmentDetail = (id: string) => {
  return request.get<Department>(`/departments/${id}`);
};

/**
 * 创建部门
 */
export const createDepartment = (data: CreateDepartmentRequest) => {
  return request.post<Department>('/departments', data);
};

/**
 * 更新部门
 */
export const updateDepartment = (id: string, data: UpdateDepartmentRequest) => {
  return request.put<Department>(`/departments/${id}`, data);
};

/**
 * 删除部门
 */
export const deleteDepartment = (id: string) => {
  return request.delete(`/departments/${id}`);
};

/**
 * 启用/禁用部门
 */
export const toggleDepartmentStatus = (id: string, status: number) => {
  return request.patch<Department>(`/departments/${id}`, { status });
}; 