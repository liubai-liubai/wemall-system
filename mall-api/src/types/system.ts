/**
 * 系统管理模块类型定义
 * 定义管理员用户、角色、权限、部门等相关接口和类型
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

// ================================
// 管理员用户相关类型
// ================================

/**
 * 管理员用户信息接口
 */
export interface IAdminUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  realName?: string;
  departmentId?: string;
  status: number; // 1:启用 0:禁用
  lastLoginTime?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // 关联数据
  department?: IDepartment;
  roles?: IRole[];
}

/**
 * 创建管理员用户请求接口
 */
export interface ICreateAdminUserRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  realName?: string;
  departmentId?: string;
  roleIds: string[]; // 角色ID数组
}

/**
 * 更新管理员用户请求接口
 */
export interface IUpdateAdminUserRequest {
  email?: string;
  phone?: string;
  realName?: string;
  departmentId?: string;
  status?: number;
  roleIds?: string[];
}

/**
 * 管理员登录请求接口
 */
export interface IAdminLoginRequest {
  username: string;
  password: string;
  captcha?: string;
}

/**
 * 管理员登录响应接口
 */
export interface IAdminLoginResponse {
  token: string;
  refreshToken: string;
  userInfo: IAdminUser;
  permissions: string[];
  menus: IMenuPermission[];
}

// ================================
// 角色相关类型
// ================================

/**
 * 角色信息接口
 */
export interface IRole {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: number; // 1:启用 0:禁用
  sort: number;
  createdAt: Date;
  updatedAt: Date;
  
  // 关联数据
  permissions?: IPermission[];
  userCount?: number; // 使用该角色的用户数量
}

/**
 * 创建角色请求接口
 */
export interface ICreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  sort?: number;
  permissionIds: string[]; // 权限ID数组
}

/**
 * 更新角色请求接口
 */
export interface IUpdateRoleRequest {
  name?: string;
  description?: string;
  status?: number;
  sort?: number;
  permissionIds?: string[];
}

// ================================
// 权限相关类型
// ================================

/**
 * 权限类型枚举
 */
export enum PermissionType {
  MENU = 'menu',     // 菜单权限
  BUTTON = 'button', // 按钮权限
  API = 'api'        // API权限
}

/**
 * 权限信息接口
 */
export interface IPermission {
  id: string;
  name: string;
  code: string;
  type: PermissionType;
  parentId?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: number; // 1:启用 0:禁用
  createdAt: Date;
  updatedAt: Date;
  
  // 关联数据
  children?: IPermission[];
  parent?: IPermission;
}

/**
 * 菜单权限接口（用于前端路由）
 */
export interface IMenuPermission {
  id: string;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  sort: number;
  children?: IMenuPermission[];
}

/**
 * 创建权限请求接口
 */
export interface ICreatePermissionRequest {
  name: string;
  code: string;
  type: PermissionType;
  parentId?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
}

/**
 * 更新权限请求接口
 */
export interface IUpdatePermissionRequest {
  name?: string;
  code?: string;
  type?: PermissionType;
  parentId?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  status?: number;
}

// ================================
// 部门相关类型
// ================================

/**
 * 部门信息接口
 */
export interface IDepartment {
  id: string;
  name: string;
  parentId?: string;
  leaderId?: string;
  phone?: string;
  email?: string;
  sort: number;
  status: number; // 1:启用 0:禁用
  createdAt: Date;
  updatedAt: Date;
  
  // 关联数据
  children?: IDepartment[];
  parent?: IDepartment;
  leader?: IAdminUser;
  userCount?: number; // 部门用户数量
}

/**
 * 创建部门请求接口
 */
export interface ICreateDepartmentRequest {
  name: string;
  parentId?: string;
  leaderId?: string;
  phone?: string;
  email?: string;
  sort?: number;
}

/**
 * 更新部门请求接口
 */
export interface IUpdateDepartmentRequest {
  name?: string;
  parentId?: string;
  leaderId?: string;
  phone?: string;
  email?: string;
  sort?: number;
  status?: number;
}

// ================================
// 日志相关类型
// ================================

/**
 * 操作日志接口
 */
export interface IOperationLog {
  id: string;
  userId?: string;
  userType: string; // admin:管理员 user:普通用户
  module: string;
  action: string;
  description?: string;
  url?: string;
  method?: string;
  params?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  executeTime?: number; // 执行时间(ms)
  status: number; // 1:成功 0:失败
  errorMsg?: string;
  createdAt: Date;
  
  // 关联数据
  adminUser?: IAdminUser;
}

/**
 * 登录日志接口
 */
export interface ILoginLog {
  id: string;
  userId?: string;
  userType: string; // admin:管理员 user:普通用户
  username: string;
  ip?: string;
  userAgent?: string;
  loginTime: Date;
  status: number; // 1:成功 0:失败
  errorMsg?: string;
  createdAt: Date;
}

/**
 * 日志查询参数接口
 */
export interface ILogQueryParams {
  userId?: string;
  userType?: string;
  module?: string;
  action?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
  page?: number;
  size?: number;
}

// ================================
// 系统配置相关类型
// ================================

/**
 * 系统配置接口
 */
export interface ISystemConfig {
  id: string;
  key: string;
  value?: string;
  name: string;
  description?: string;
  type: string; // text|number|boolean|json
  group: string;
  options?: Record<string, unknown>;
  sort: number;
  isPublic: number; // 1:公开 0:私有
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 更新系统配置请求接口
 */
export interface IUpdateSystemConfigRequest {
  value: string;
}

// ================================
// 通知公告相关类型
// ================================

/**
 * 通知公告接口
 */
export interface IAnnouncement {
  id: string;
  title: string;
  content: string;
  type: string; // notice:通知 announcement:公告
  level: string; // info|warning|error
  target: string; // all:全部 admin:管理员 user:用户
  isTop: number; // 1:置顶 0:普通
  status: number; // 1:发布 0:草稿
  publishTime?: Date;
  expireTime?: Date;
  authorId: string;
  readCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建通知公告请求接口
 */
export interface ICreateAnnouncementRequest {
  title: string;
  content: string;
  type?: string;
  level?: string;
  target?: string;
  isTop?: number;
  publishTime?: string;
  expireTime?: string;
}

// ================================
// 站内信相关类型
// ================================

/**
 * 站内信接口
 */
export interface IMessage {
  id: string;
  fromId?: string;
  toId: string;
  title: string;
  content: string;
  type: string; // system:系统 user:用户
  isRead: number; // 1:已读 0:未读
  readTime?: Date;
  createdAt: Date;
}

/**
 * 发送站内信请求接口
 */
export interface ISendMessageRequest {
  toId: string;
  title: string;
  content: string;
  type?: string;
}

// ================================
// 错误码相关类型
// ================================

/**
 * 错误码接口
 */
export interface IErrorCode {
  id: string;
  code: string;
  message: string;
  description?: string;
  module: string;
  level: string; // info|warning|error
  solution?: string;
  status: number; // 1:启用 0:禁用
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建错误码请求接口
 */
export interface ICreateErrorCodeRequest {
  code: string;
  message: string;
  description?: string;
  module: string;
  level?: string;
  solution?: string;
}

// ================================
// 查询参数相关类型
// ================================

/**
 * 管理员用户查询参数接口
 */
export interface IAdminUserQueryParams {
  username?: string;
  email?: string;
  phone?: string;
  realName?: string;
  departmentId?: string;
  status?: number;
  page?: number;
  size?: number;
}

/**
 * 角色查询参数接口
 */
export interface IRoleQueryParams {
  name?: string;
  code?: string;
  status?: number;
  page?: number;
  size?: number;
}

/**
 * 权限查询参数接口
 */
export interface IPermissionQueryParams {
  name?: string;
  code?: string;
  type?: PermissionType;
  parentId?: string;
  status?: number;
}

/**
 * 部门查询参数接口
 */
export interface IDepartmentQueryParams {
  name?: string;
  parentId?: string;
  status?: number;
}
