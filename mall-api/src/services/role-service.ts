/**
 * 角色管理服务
 * 处理角色相关的核心业务逻辑，包括角色的增删改查、角色权限管理等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { 
  IRole, 
  ICreateRoleRequest, 
  IUpdateRoleRequest,
  IRoleQueryParams
} from '../types/system.js';
import { PageData } from '../types/common.js';
import { RoleModel, RoleDTO, RoleSimpleDTO } from '../models/index.js';
import { formatRole } from '../utils/format.js';

const prisma = new PrismaClient();

export class RoleService {
  /**
   * 获取角色分页列表
   * @param params 查询参数
   * @returns 角色分页数据
   */
  async getRoleList(params: IRoleQueryParams): Promise<PageData<RoleDTO>> {
    const { name, code, status, page = 1, size = 10 } = params;
    
    // 构建查询条件
    const where: any = {};
    if (name) where.name = { contains: name };
    if (code) where.code = { contains: code };
    if (status !== undefined) where.status = status;

    // 查询总数
    const total = await prisma.role.count({ where });

    // 查询列表
    const list = await prisma.role.findMany({
      where,
      include: {
        role_permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            admin_user_roles: true,
          },
        },
      },
      orderBy: [{ sort: 'asc' }, { created_at: 'desc' }],
      skip: (page - 1) * size,
      take: size,
    });

    // 转换为DTO格式
    const formattedList = list.map(role => {
      const roleData = formatRole(role) as IRole;
      // 添加关联数据到roleData
      roleData.permissions = role.role_permissions?.map((rp: any) => rp.permission);
      roleData.userCount = role._count?.admin_user_roles || 0;
      
      return new RoleDTO(roleData, {
        includePermissions: true,
      });
    });

    const pages = Math.ceil(total / size);

    return {
      list: formattedList,
      total,
      page,
      size,
      pages,
    };
  }

  /**
   * 获取所有角色（不分页）
   * @returns 角色列表
   */
  async getAllRoles(): Promise<RoleSimpleDTO[]> {
    const roles = await prisma.role.findMany({
      where: { status: 1 },
      orderBy: [{ sort: 'asc' }, { created_at: 'desc' }],
    });

    return roles.map(role => {
      const roleData = formatRole(role) as IRole;
      return new RoleSimpleDTO(roleData);
    });
  }

  /**
   * 根据ID获取角色详情
   * @param id 角色ID
   * @returns 角色信息
   */
  async getRoleById(id: string): Promise<RoleDTO | null> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        role_permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            admin_user_roles: true,
          },
        },
      },
    });

    if (!role) return null;

    const roleData = formatRole(role) as IRole;
    // 添加关联数据
    roleData.permissions = role.role_permissions?.map((rp: any) => rp.permission);
    roleData.userCount = role._count?.admin_user_roles || 0;

    return new RoleDTO(roleData, {
      includePermissions: true,
    });
  }

  /**
   * 创建角色
   * @param data 创建角色数据
   * @returns 创建的角色信息
   */
  async createRole(data: ICreateRoleRequest): Promise<RoleDTO> {
    // 检查角色编码是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { code: data.code },
    });

    if (existingRole) {
      throw new Error('角色编码已存在');
    }

    // 验证权限ID是否存在
    if (data.permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: data.permissionIds } },
      });

      if (permissions.length !== data.permissionIds.length) {
        throw new Error('部分权限不存在');
      }
    }

    // 创建角色
    const role = await prisma.role.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        sort: data.sort || 0,
      },
    });

    // 分配权限
    if (data.permissionIds.length > 0) {
      await this.assignPermissionsToRole(role.id, data.permissionIds);
    }

    return await this.getRoleById(role.id) as RoleDTO;
  }

  /**
   * 更新角色
   * @param id 角色ID
   * @param data 更新数据
   * @returns 更新后的角色信息
   */
  async updateRole(id: string, data: IUpdateRoleRequest): Promise<RoleDTO> {
    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new Error('角色不存在');
    }

    // 如果更新编码，检查是否重复
    if (data.name && data.name !== existingRole.name) {
      const duplicateRole = await prisma.role.findFirst({
        where: { 
          name: data.name,
          id: { not: id }
        },
      });

      if (duplicateRole) {
        throw new Error('角色名称已存在');
      }
    }

    // 验证权限ID是否存在
    if (data.permissionIds && data.permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: data.permissionIds } },
      });

      if (permissions.length !== data.permissionIds.length) {
        throw new Error('部分权限不存在');
      }
    }

    // 更新角色基本信息
    await prisma.role.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.sort !== undefined && { sort: data.sort }),
      },
    });

    // 更新权限分配
    if (data.permissionIds !== undefined) {
      await this.assignPermissionsToRole(id, data.permissionIds);
    }

    return await this.getRoleById(id) as RoleDTO;
  }

  /**
   * 删除角色
   * @param id 角色ID
   */
  async deleteRole(id: string): Promise<void> {
    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        admin_user_roles: true,
      },
    });

    if (!existingRole) {
      throw new Error('角色不存在');
    }

    // 检查是否有用户使用该角色
    if (existingRole.admin_user_roles.length > 0) {
      throw new Error('该角色正在被用户使用，无法删除');
    }

    // 删除角色（会自动删除关联的权限记录）
    await prisma.role.delete({
      where: { id },
    });
  }

  /**
   * 为角色分配权限
   * @param roleId 角色ID
   * @param permissionIds 权限ID数组
   */
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    // 删除现有权限关联
    await prisma.rolePermission.deleteMany({
      where: { role_id: roleId },
    });

    // 创建新的权限关联
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId,
      }));

      await prisma.rolePermission.createMany({
        data: rolePermissions,
      });
    }
  }

  /**
   * 获取角色的权限ID列表
   * @param roleId 角色ID
   * @returns 权限ID数组
   */
  async getRolePermissionIds(roleId: string): Promise<string[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role_id: roleId },
      select: { permission_id: true },
    });

    return rolePermissions.map(rp => rp.permission_id);
  }
}

export const roleService = new RoleService();
