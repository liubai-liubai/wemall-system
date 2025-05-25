/**
 * 角色模型定义
 * 定义角色相关的数据传输对象、业务实体和验证模型
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { IRole, IPermission } from '../types/system.js';

/**
 * 角色实体模型
 * 扩展基础接口，添加业务方法
 */
export class RoleModel implements IRole {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: number;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
  permissions?: IPermission[];
  userCount?: number;

  constructor(data: IRole) {
    this.id = data.id;
    this.name = data.name;
    this.code = data.code;
    this.description = data.description;
    this.status = data.status;
    this.sort = data.sort;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.permissions = data.permissions;
    this.userCount = data.userCount;
  }

  /**
   * 检查角色是否为活跃状态
   */
  isActive(): boolean {
    return this.status === 1;
  }

  /**
   * 检查角色是否为系统内置角色
   */
  isBuiltIn(): boolean {
    // 系统内置角色通常以 ROLE_ 开头且为大写
    return this.code.startsWith('ROLE_') && this.code === this.code.toUpperCase();
  }

  /**
   * 获取角色的权限编码列表
   */
  getPermissionCodes(): string[] {
    return this.permissions?.map(p => p.code) || [];
  }

  /**
   * 检查角色是否拥有指定权限
   */
  hasPermission(permissionCode: string): boolean {
    return this.getPermissionCodes().includes(permissionCode);
  }

  /**
   * 获取角色状态文本
   */
  getStatusText(): string {
    return this.status === 1 ? '启用' : '禁用';
  }

  /**
   * 检查角色是否可以删除
   */
  canDelete(): boolean {
    // 系统内置角色或有用户使用的角色不能删除
    return !this.isBuiltIn() && (this.userCount || 0) === 0;
  }
}

/**
 * 角色数据传输对象
 * 用于API响应的标准化数据格式
 */
export class RoleDTO {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: number;
  statusText: string;
  sort: number;
  userCount: number;
  permissionCount: number;
  isBuiltIn: boolean;
  canDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[]; // 权限编码列表

  constructor(role: IRole, options?: {
    includePermissions?: boolean;
  }) {
    this.id = role.id;
    this.name = role.name;
    this.code = role.code;
    this.description = role.description;
    this.status = role.status;
    this.statusText = role.status === 1 ? '启用' : '禁用';
    this.sort = role.sort;
    this.userCount = role.userCount || 0;
    this.permissionCount = role.permissions?.length || 0;
    this.isBuiltIn = role.code.startsWith('ROLE_') && role.code === role.code.toUpperCase();
    this.canDelete = !this.isBuiltIn && this.userCount === 0;
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
    
    if (options?.includePermissions) {
      this.permissions = role.permissions?.map(p => p.code);
    }
  }
}

/**
 * 角色简化数据传输对象
 * 用于下拉选择等场景
 */
export class RoleSimpleDTO {
  id: string;
  name: string;
  code: string;
  description?: string;

  constructor(role: IRole) {
    this.id = role.id;
    this.name = role.name;
    this.code = role.code;
    this.description = role.description;
  }
} 