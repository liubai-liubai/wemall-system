/**
 * 全局类型定义
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

// API 响应基础类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 分页响应类型
export interface PageResponse<T> extends ApiResponse {
  data: {
    list: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
}

// 分页请求参数
export interface PageParams {
  page?: number;
  size?: number;
}

// 分页查询参数
export interface PageQuery extends PageParams {
  [key: string]: any;
}

// 用户相关类型
export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  realName?: string;
  avatar?: string;
  status: number;
  departmentId?: string;
  departmentName?: string;
  department?: Department;
  roles?: Role[];
  lastLoginAt?: string;
  lastLoginTime?: string;
  lastLoginIp?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 管理员用户查询参数
export interface AdminUserQueryParams extends PageParams {
  username?: string;
  email?: string;
  phone?: string;
  realName?: string;
  departmentId?: string;
  status?: number;
}

// 创建管理员用户请求
export interface CreateAdminUserRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  realName?: string;
  departmentId?: string;
  roleIds: string[];
}

// 更新管理员用户请求
export interface UpdateAdminUserRequest {
  email?: string;
  phone?: string;
  realName?: string;
  departmentId?: string;
  status?: number;
  roleIds?: string[];
}

// 部门相关类型
export interface Department {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
  parentName?: string;
  parent?: Department;
  children?: Department[];
  leaderId?: string;
  leader?: AdminUser;
  managerName?: string;
  phone?: string;
  email?: string;
  sort: number;
  status: number;
  description?: string;
  remark?: string;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

// 部门树节点
export interface DepartmentTreeNode {
  id: string;
  name: string;
  parentId?: string;
  children: DepartmentTreeNode[];
  userCount?: number;
  sort: number;
  status: number;
}

// 部门查询参数
export interface DepartmentQueryParams {
  name?: string;
  status?: number;
}

// 创建部门请求
export interface CreateDepartmentRequest {
  name: string;
  parentId?: string;
  leaderId?: string;
  phone?: string;
  email?: string;
  sort?: number;
}

// 更新部门请求
export interface UpdateDepartmentRequest {
  name?: string;
  parentId?: string;
  leaderId?: string;
  phone?: string;
  email?: string;
  sort?: number;
  status?: number;
}

// 角色相关类型
export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  sort: number;
  status: number;
  permissions?: Permission[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

// 角色查询参数
export interface RoleQueryParams extends PageParams {
  name?: string;
  code?: string;
  status?: number;
}

// 创建角色请求
export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  sort?: number;
  permissionIds: string[];
}

// 更新角色请求
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  status?: number;
  sort?: number;
  permissionIds?: string[];
}

// 权限相关类型
export interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: string;
  parent?: Permission;
  children?: Permission[];
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: number;
  hidden?: boolean;
  keepAlive?: boolean;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 权限树节点
export interface PermissionTreeNode {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: string;
  children: PermissionTreeNode[];
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: number;
}

// 权限查询参数
export interface PermissionQueryParams {
  name?: string;
  code?: string;
  type?: 'menu' | 'button' | 'api';
  status?: number;
}

// 创建权限请求
export interface CreatePermissionRequest {
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
}

// 更新权限请求
export interface UpdatePermissionRequest {
  name?: string;
  code?: string;
  type?: 'menu' | 'button' | 'api';
  parentId?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  status?: number;
}

// 登录相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  userInfo: AdminUser;
  permissions: string[];
  menus: Permission[];
}

// 用户状态枚举
export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1
}

// 权限类型枚举
export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api'
}

// 通用状态枚举
export enum Status {
  DISABLED = 0,
  ENABLED = 1
}

// 菜单项类型
export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  component?: string;
  hidden?: boolean;
}

// 表格列配置
export interface TableColumn {
  prop: string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  sortable?: boolean;
  formatter?: (row: any, column: any, value: any) => string;
  align?: 'left' | 'center' | 'right';
}

// 表单规则
export interface FormRule {
  required?: boolean;
  message?: string;
  trigger?: string | string[];
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (rule: any, value: any, callback: any) => void;
} 