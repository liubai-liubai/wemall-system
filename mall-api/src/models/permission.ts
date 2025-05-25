/**
 * 权限模型定义
 * 定义权限相关的数据传输对象、业务实体和验证模型
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { IPermission, IMenuPermission, PermissionType } from '../types/system.js';

/**
 * 权限实体模型
 * 扩展基础接口，添加业务方法
 */
export class PermissionModel implements IPermission {
  id: string;
  name: string;
  code: string;
  type: PermissionType;
  parentId?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  children?: IPermission[];
  parent?: IPermission;

  constructor(data: IPermission) {
    this.id = data.id;
    this.name = data.name;
    this.code = data.code;
    this.type = data.type;
    this.parentId = data.parentId;
    this.path = data.path;
    this.component = data.component;
    this.icon = data.icon;
    this.sort = data.sort;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.children = data.children;
    this.parent = data.parent;
  }

  /**
   * 检查权限是否为活跃状态
   */
  isActive(): boolean {
    return this.status === 1;
  }

  /**
   * 检查是否为菜单权限
   */
  isMenu(): boolean {
    return this.type === PermissionType.MENU;
  }

  /**
   * 检查是否为按钮权限
   */
  isButton(): boolean {
    return this.type === PermissionType.BUTTON;
  }

  /**
   * 检查是否为API权限
   */
  isApi(): boolean {
    return this.type === PermissionType.API;
  }

  /**
   * 检查是否为根节点
   */
  isRoot(): boolean {
    return !this.parentId;
  }

  /**
   * 检查是否有子节点
   */
  hasChildren(): boolean {
    return !!(this.children && this.children.length > 0);
  }

  /**
   * 获取权限层级深度
   */
  getDepth(): number {
    if (this.isRoot()) return 0;
    
    let depth = 0;
    let current = this.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  /**
   * 获取完整路径
   */
  getFullPath(): string {
    const paths: string[] = [];
    let current: IPermission | undefined = this;
    
    while (current) {
      if (current.path) {
        paths.unshift(current.path);
      }
      current = current.parent;
    }
    
    return paths.join('');
  }

  /**
   * 获取权限状态文本
   */
  getStatusText(): string {
    return this.status === 1 ? '启用' : '禁用';
  }

  /**
   * 获取权限类型文本
   */
  getTypeText(): string {
    const typeMap = {
      [PermissionType.MENU]: '菜单',
      [PermissionType.BUTTON]: '按钮',
      [PermissionType.API]: 'API'
    };
    return typeMap[this.type];
  }

  /**
   * 检查权限是否可以删除
   */
  canDelete(): boolean {
    // 有子权限的不能删除
    return !this.hasChildren();
  }
}

/**
 * 权限数据传输对象
 * 用于API响应的标准化数据格式
 */
export class PermissionDTO {
  id: string;
  name: string;
  code: string;
  type: PermissionType;
  typeText: string;
  parentId?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: number;
  statusText: string;
  isRoot: boolean;
  hasChildren: boolean;
  canDelete: boolean;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
  children?: PermissionDTO[];

  constructor(permission: IPermission) {
    this.id = permission.id;
    this.name = permission.name;
    this.code = permission.code;
    this.type = permission.type;
    this.typeText = this.getTypeText(permission.type);
    this.parentId = permission.parentId;
    this.path = permission.path;
    this.component = permission.component;
    this.icon = permission.icon;
    this.sort = permission.sort;
    this.status = permission.status;
    this.statusText = permission.status === 1 ? '启用' : '禁用';
    this.isRoot = !permission.parentId;
    this.hasChildren = !!(permission.children && permission.children.length > 0);
    this.canDelete = !this.hasChildren;
    this.depth = this.calculateDepth(permission);
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
    
    if (permission.children) {
      this.children = permission.children.map(child => new PermissionDTO(child));
    }
  }

  private getTypeText(type: PermissionType): string {
    const typeMap = {
      [PermissionType.MENU]: '菜单',
      [PermissionType.BUTTON]: '按钮',
      [PermissionType.API]: 'API'
    };
    return typeMap[type];
  }

  private calculateDepth(permission: IPermission): number {
    if (!permission.parentId) return 0;
    
    let depth = 0;
    let current = permission.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }
}

/**
 * 菜单权限数据传输对象
 * 用于前端路由构建
 */
export class MenuPermissionDTO implements IMenuPermission {
  id: string;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  sort: number;
  children?: MenuPermissionDTO[];

  constructor(permission: IPermission) {
    this.id = permission.id;
    this.name = permission.name;
    this.path = permission.path || '';
    this.component = permission.component;
    this.icon = permission.icon;
    this.sort = permission.sort;
    
    if (permission.children) {
      this.children = permission.children
        .filter(child => child.type === PermissionType.MENU && child.status === 1)
        .sort((a, b) => a.sort - b.sort)
        .map(child => new MenuPermissionDTO(child));
    }
  }
}

/**
 * 权限树节点
 * 用于权限树的构建和操作
 */
export class PermissionTreeNode {
  permission: PermissionModel;
  parent?: PermissionTreeNode;
  children: PermissionTreeNode[] = [];

  constructor(permission: IPermission, parent?: PermissionTreeNode) {
    this.permission = new PermissionModel(permission);
    this.parent = parent;
  }

  /**
   * 添加子节点
   */
  addChild(permission: IPermission): PermissionTreeNode {
    const childNode = new PermissionTreeNode(permission, this);
    this.children.push(childNode);
    return childNode;
  }

  /**
   * 移除子节点
   */
  removeChild(nodeId: string): boolean {
    const index = this.children.findIndex(child => child.permission.id === nodeId);
    if (index > -1) {
      this.children.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 查找子节点
   */
  findChild(nodeId: string): PermissionTreeNode | undefined {
    return this.children.find(child => child.permission.id === nodeId);
  }

  /**
   * 获取所有后代节点ID
   */
  getAllDescendantIds(): string[] {
    const ids: string[] = [];
    
    const traverse = (node: PermissionTreeNode) => {
      for (const child of node.children) {
        ids.push(child.permission.id);
        traverse(child);
      }
    };
    
    traverse(this);
    return ids;
  }

  /**
   * 检查是否为叶子节点
   */
  isLeaf(): boolean {
    return this.children.length === 0;
  }

  /**
   * 获取节点深度
   */
  getDepth(): number {
    let depth = 0;
    let current = this.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }
} 