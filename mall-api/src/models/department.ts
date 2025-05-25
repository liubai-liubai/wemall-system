/**
 * 部门模型定义
 * 定义部门相关的数据传输对象、业务实体和验证模型
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { IDepartment, IAdminUser } from '../types/system.js';

/**
 * 部门实体模型
 * 扩展基础接口，添加业务方法
 */
export class DepartmentModel implements IDepartment {
  id: string;
  name: string;
  parentId?: string;
  leaderId?: string;
  phone?: string;
  email?: string;
  sort: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  children?: IDepartment[];
  parent?: IDepartment;
  leader?: IAdminUser;
  userCount?: number;

  constructor(data: IDepartment) {
    this.id = data.id;
    this.name = data.name;
    this.parentId = data.parentId;
    this.leaderId = data.leaderId;
    this.phone = data.phone;
    this.email = data.email;
    this.sort = data.sort;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.children = data.children;
    this.parent = data.parent;
    this.leader = data.leader;
    this.userCount = data.userCount;
  }

  /**
   * 检查部门是否为活跃状态
   */
  isActive(): boolean {
    return this.status === 1;
  }

  /**
   * 检查是否为根部门
   */
  isRoot(): boolean {
    return !this.parentId;
  }

  /**
   * 检查是否有子部门
   */
  hasChildren(): boolean {
    return !!(this.children && this.children.length > 0);
  }

  /**
   * 检查是否有员工
   */
  hasUsers(): boolean {
    return (this.userCount || 0) > 0;
  }

  /**
   * 检查是否有负责人
   */
  hasLeader(): boolean {
    return !!this.leaderId;
  }

  /**
   * 获取部门层级深度
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
   * 获取部门完整名称（包含上级部门）
   */
  getFullName(): string {
    const names: string[] = [];
    let current: IDepartment | undefined = this;
    
    while (current) {
      names.unshift(current.name);
      current = current.parent;
    }
    
    return names.join(' / ');
  }

  /**
   * 获取部门状态文本
   */
  getStatusText(): string {
    return this.status === 1 ? '启用' : '禁用';
  }

  /**
   * 检查部门是否可以删除
   */
  canDelete(): boolean {
    // 有子部门或有员工的部门不能删除
    return !this.hasChildren() && !this.hasUsers();
  }

  /**
   * 检查是否可以设置为指定部门的父部门
   */
  canBeParentOf(targetDepartmentId: string): boolean {
    // 不能设置自己为父部门
    if (this.id === targetDepartmentId) return false;
    
    // 不能设置子部门为父部门（避免循环）
    const childIds = this.getAllChildIds();
    return !childIds.includes(targetDepartmentId);
  }

  /**
   * 获取所有子部门ID（递归）
   */
  private getAllChildIds(): string[] {
    const ids: string[] = [];
    
    const traverse = (dept: IDepartment) => {
      if (dept.children) {
        for (const child of dept.children) {
          ids.push(child.id);
          traverse(child);
        }
      }
    };
    
    traverse(this);
    return ids;
  }
}

/**
 * 部门数据传输对象
 * 用于API响应的标准化数据格式
 */
export class DepartmentDTO {
  id: string;
  name: string;
  fullName: string;
  parentId?: string;
  parentName?: string;
  leaderId?: string;
  leaderName?: string;
  phone?: string;
  email?: string;
  sort: number;
  status: number;
  statusText: string;
  userCount: number;
  childCount: number;
  isRoot: boolean;
  hasChildren: boolean;
  canDelete: boolean;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
  children?: DepartmentDTO[];

  constructor(department: IDepartment) {
    this.id = department.id;
    this.name = department.name;
    this.fullName = this.calculateFullName(department);
    this.parentId = department.parentId;
    this.parentName = department.parent?.name;
    this.leaderId = department.leaderId;
    this.leaderName = department.leader?.realName || department.leader?.username;
    this.phone = department.phone;
    this.email = department.email;
    this.sort = department.sort;
    this.status = department.status;
    this.statusText = department.status === 1 ? '启用' : '禁用';
    this.userCount = department.userCount || 0;
    this.childCount = department.children?.length || 0;
    this.isRoot = !department.parentId;
    this.hasChildren = this.childCount > 0;
    this.canDelete = this.childCount === 0 && this.userCount === 0;
    this.depth = this.calculateDepth(department);
    this.createdAt = department.createdAt;
    this.updatedAt = department.updatedAt;
    
    if (department.children) {
      this.children = department.children.map(child => new DepartmentDTO(child));
    }
  }

  private calculateFullName(department: IDepartment): string {
    const names: string[] = [];
    let current: IDepartment | undefined = department;
    
    while (current) {
      names.unshift(current.name);
      current = current.parent;
    }
    
    return names.join(' / ');
  }

  private calculateDepth(department: IDepartment): number {
    if (!department.parentId) return 0;
    
    let depth = 0;
    let current = department.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }
}

/**
 * 部门简化数据传输对象
 * 用于下拉选择等场景
 */
export class DepartmentSimpleDTO {
  id: string;
  name: string;
  fullName: string;
  parentId?: string;

  constructor(department: IDepartment) {
    this.id = department.id;
    this.name = department.name;
    this.fullName = this.calculateFullName(department);
    this.parentId = department.parentId;
  }

  private calculateFullName(department: IDepartment): string {
    const names: string[] = [];
    let current: IDepartment | undefined = department;
    
    while (current) {
      names.unshift(current.name);
      current = current.parent;
    }
    
    return names.join(' / ');
  }
}

/**
 * 部门树节点
 * 用于部门树的构建和操作
 */
export class DepartmentTreeNode {
  department: DepartmentModel;
  parent?: DepartmentTreeNode;
  children: DepartmentTreeNode[] = [];

  constructor(department: IDepartment, parent?: DepartmentTreeNode) {
    this.department = new DepartmentModel(department);
    this.parent = parent;
  }

  /**
   * 添加子节点
   */
  addChild(department: IDepartment): DepartmentTreeNode {
    const childNode = new DepartmentTreeNode(department, this);
    this.children.push(childNode);
    return childNode;
  }

  /**
   * 移除子节点
   */
  removeChild(nodeId: string): boolean {
    const index = this.children.findIndex(child => child.department.id === nodeId);
    if (index > -1) {
      this.children.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 查找子节点
   */
  findChild(nodeId: string): DepartmentTreeNode | undefined {
    return this.children.find(child => child.department.id === nodeId);
  }

  /**
   * 获取所有后代节点ID
   */
  getAllDescendantIds(): string[] {
    const ids: string[] = [];
    
    const traverse = (node: DepartmentTreeNode) => {
      for (const child of node.children) {
        ids.push(child.department.id);
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

  /**
   * 排序子节点
   */
  sortChildren(): void {
    this.children.sort((a, b) => a.department.sort - b.department.sort);
    this.children.forEach(child => child.sortChildren());
  }
} 