/**
 * 权限管理服务
 * 处理权限相关的核心业务逻辑，包括权限的增删改查、权限树构建等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { 
  IPermission, 
  ICreatePermissionRequest, 
  IUpdatePermissionRequest,
  IPermissionQueryParams,
  IMenuPermission,
  PermissionType
} from '../types/system.js';
import { PermissionModel, PermissionDTO, MenuPermissionDTO, PermissionTreeNode } from '../models/index.js';
import { formatPermission } from '../utils/format.js';

const prisma = new PrismaClient();

export class PermissionService {
  /**
   * 获取权限列表（树形结构）
   * @param params 查询参数
   * @returns 权限树
   */
  async getPermissionTree(params: IPermissionQueryParams = {}): Promise<PermissionTreeNode[]> {
    const { name, code, type, status } = params;
    
    // 构建查询条件
    const where: any = {};
    if (name) where.name = { contains: name };
    if (code) where.code = { contains: code };
    if (type) where.type = type;
    if (status !== undefined) where.status = status;

    // 查询所有权限
    const permissions = await prisma.permission.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { created_at: 'asc' }],
    });

    // 使用新的树节点构建器
    return this.buildPermissionTreeNodes(permissions);
  }

  /**
   * 构建权限树形结构（使用PermissionTreeNode）
   * @param permissions 权限平铺数组
   * @returns 权限树
   */
  private buildPermissionTreeNodes(permissions: any[]): PermissionTreeNode[] {
    const nodeMap = new Map<string, PermissionTreeNode>();
    const rootNodes: PermissionTreeNode[] = [];

    // 创建所有节点
    permissions.forEach(permission => {
      const permissionData = formatPermission(permission) as IPermission;
      const node = new PermissionTreeNode(permissionData);
      nodeMap.set(permission.id, node);
    });

    // 建立父子关系
    permissions.forEach(permission => {
      const node = nodeMap.get(permission.id)!;
      if (permission.parent_id) {
        const parentNode = nodeMap.get(permission.parent_id);
        if (parentNode) {
          parentNode.children.push(node);
          node.parent = parentNode;
        }
      } else {
        rootNodes.push(node);
      }
    });

    // 排序子节点
    const sortNodes = (nodes: PermissionTreeNode[]) => {
      nodes.sort((a, b) => a.permission.sort - b.permission.sort);
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };
    
    sortNodes(rootNodes);
    return rootNodes;
  }

  /**
   * 构建权限树形结构（保留原有方法用于兼容）
   * @param permissions 权限平铺数组
   * @returns 权限树
   */
  private buildPermissionTree(permissions: any[]): IPermission[] {
    const permissionMap = new Map();
    const tree: IPermission[] = [];

    // 创建映射
    permissions.forEach(permission => {
      permissionMap.set(permission.id, {
        ...permission,
        children: []
      });
    });

    // 构建树形结构
    permissions.forEach(permission => {
      const node = permissionMap.get(permission.id);
      if (permission.parent_id) {
        const parent = permissionMap.get(permission.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  }

  /**
   * 根据ID获取权限详情
   * @param id 权限ID
   * @returns 权限信息
   */
  async getPermissionById(id: string): Promise<PermissionDTO | null> {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: [{ sort: 'asc' }],
        },
      },
    });

    if (!permission) return null;

    const permissionData = formatPermission(permission) as IPermission;
    return new PermissionDTO(permissionData);
  }

  /**
   * 创建权限
   * @param data 创建权限数据
   * @returns 创建的权限信息
   */
  async createPermission(data: ICreatePermissionRequest): Promise<PermissionDTO> {
    // 检查权限编码是否已存在
    const existingPermission = await prisma.permission.findUnique({
      where: { code: data.code },
    });

    if (existingPermission) {
      throw new Error('权限编码已存在');
    }

    // 如果有父权限，验证父权限是否存在
    if (data.parentId) {
      const parentPermission = await prisma.permission.findUnique({
        where: { id: data.parentId },
      });

      if (!parentPermission) {
        throw new Error('父权限不存在');
      }
    }

    const permission = await prisma.permission.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        parent_id: data.parentId,
        path: data.path,
        component: data.component,
        icon: data.icon,
        sort: data.sort || 0,
      },
    });

    const permissionData = formatPermission(permission) as IPermission;
    return new PermissionDTO(permissionData);
  }

  /**
   * 更新权限
   * @param id 权限ID
   * @param data 更新数据
   * @returns 更新后的权限信息
   */
  async updatePermission(id: string, data: IUpdatePermissionRequest): Promise<PermissionDTO> {
    // 检查权限是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      throw new Error('权限不存在');
    }

    // 如果更新编码，检查是否重复
    if (data.code && data.code !== existingPermission.code) {
      const duplicatePermission = await prisma.permission.findUnique({
        where: { code: data.code },
      });

      if (duplicatePermission) {
        throw new Error('权限编码已存在');
      }
    }

    // 如果更新父权限，验证父权限是否存在且不是自己
    if (data.parentId) {
      if (data.parentId === id) {
        throw new Error('不能将自己设为父权限');
      }

      const parentPermission = await prisma.permission.findUnique({
        where: { id: data.parentId },
      });

      if (!parentPermission) {
        throw new Error('父权限不存在');
      }
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.type && { type: data.type }),
        ...(data.parentId !== undefined && { parent_id: data.parentId }),
        ...(data.path !== undefined && { path: data.path }),
        ...(data.component !== undefined && { component: data.component }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.sort !== undefined && { sort: data.sort }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    const permissionData = formatPermission(permission) as IPermission;
    return new PermissionDTO(permissionData);
  }

  /**
   * 删除权限
   * @param id 权限ID
   */
  async deletePermission(id: string): Promise<void> {
    // 检查权限是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
      include: {
        children: true,
        role_permissions: true,
      },
    });

    if (!existingPermission) {
      throw new Error('权限不存在');
    }

    // 检查是否有子权限
    if (existingPermission.children.length > 0) {
      throw new Error('存在子权限，无法删除');
    }

    // 检查是否有角色使用该权限
    if (existingPermission.role_permissions.length > 0) {
      throw new Error('该权限正在被角色使用，无法删除');
    }

    await prisma.permission.delete({
      where: { id },
    });
  }

  /**
   * 根据用户ID获取菜单权限（用于前端路由）
   * @param userId 用户ID
   * @returns 菜单权限树
   */
  async getUserMenuPermissions(userId: string): Promise<MenuPermissionDTO[]> {
    // 通过用户角色获取权限
    const permissions = await prisma.permission.findMany({
      where: {
        role_permissions: {
          some: {
            role: {
              admin_user_roles: {
                some: {
                  user_id: userId,
                },
              },
            },
          },
        },
        type: PermissionType.MENU,
        status: 1,
      },
      orderBy: [{ sort: 'asc' }],
    });

    // 构建菜单树
    return this.buildMenuTreeDTOs(permissions);
  }

  /**
   * 构建菜单权限树（使用MenuPermissionDTO）
   * @param permissions 权限数组
   * @returns 菜单树
   */
  private buildMenuTreeDTOs(permissions: any[]): MenuPermissionDTO[] {
    const menuMap = new Map<string, MenuPermissionDTO>();
    const tree: MenuPermissionDTO[] = [];

    // 创建映射
    permissions.forEach(permission => {
      const permissionData = formatPermission(permission) as IPermission;
      const menuDTO = new MenuPermissionDTO(permissionData);
      menuMap.set(permission.id, menuDTO);
    });

    // 构建树形结构
    permissions.forEach(permission => {
      const node = menuMap.get(permission.id)!;
      if (permission.parent_id) {
        const parent = menuMap.get(permission.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    // 排序
    const sortMenus = (menus: MenuPermissionDTO[]) => {
      menus.sort((a, b) => a.sort - b.sort);
      menus.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
          sortMenus(menu.children);
        }
      });
    };

    sortMenus(tree);
    return tree;
  }

  /**
   * 构建菜单权限树（保留原有方法用于兼容）
   * @param permissions 权限数组
   * @returns 菜单树
   */
  private buildMenuTree(permissions: any[]): IMenuPermission[] {
    const menuMap = new Map();
    const tree: IMenuPermission[] = [];

    // 创建映射
    permissions.forEach(permission => {
      menuMap.set(permission.id, {
        id: permission.id,
        name: permission.name,
        path: permission.path,
        component: permission.component,
        icon: permission.icon,
        sort: permission.sort,
        children: []
      });
    });

    // 构建树形结构
    permissions.forEach(permission => {
      const node = menuMap.get(permission.id);
      if (permission.parent_id) {
        const parent = menuMap.get(permission.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  }

  /**
   * 根据用户ID获取权限编码列表
   * @param userId 用户ID
   * @returns 权限编码数组
   */
  async getUserPermissionCodes(userId: string): Promise<string[]> {
    const permissions = await prisma.permission.findMany({
      where: {
        role_permissions: {
          some: {
            role: {
              admin_user_roles: {
                some: {
                  user_id: userId,
                },
              },
            },
          },
        },
        status: 1,
      },
      select: {
        code: true,
      },
    });

    return permissions.map(p => p.code);
  }
}

export const permissionService = new PermissionService();
