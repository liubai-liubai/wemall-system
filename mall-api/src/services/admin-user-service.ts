/**
 * 管理员用户管理服务
 * 处理管理员用户相关的核心业务逻辑，包括用户增删改查、登录认证等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { 
  IAdminUser, 
  ICreateAdminUserRequest, 
  IUpdateAdminUserRequest,
  IAdminUserQueryParams,
  IAdminLoginRequest,
  IAdminLoginResponse
} from '../types/system';
import { PageData } from '../types/common';
import { AdminUserModel, AdminUserDTO } from '../models/index';
import { jwtUtils } from '../utils/jwt';
import { permissionService } from './permission-service';
import { formatAdminUser } from '../utils/format';

const prisma = new PrismaClient();

export class AdminUserService {
  /**
   * 获取管理员用户分页列表
   * @param params 查询参数
   * @returns 用户分页数据
   */
  async getAdminUserList(params: IAdminUserQueryParams): Promise<PageData<AdminUserDTO>> {
    const { 
      username, 
      email, 
      phone, 
      realName, 
      departmentId, 
      status, 
      page = 1, 
      size = 10 
    } = params;
    
    // 构建查询条件
    const where: any = {};
    if (username) where.username = { contains: username };
    if (email) where.email = { contains: email };
    if (phone) where.phone = { contains: phone };
    if (realName) where.real_name = { contains: realName };
    if (departmentId) where.department_id = departmentId;
    if (status !== undefined) where.status = status;

    // 查询总数
    const total = await prisma.adminUser.count({ where });

    // 查询列表
    const list = await prisma.adminUser.findMany({
      where,
      include: {
        department: true,
        admin_user_roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * size,
      take: size,
    });

    // 转换数据格式，使用AdminUserDTO
    const formattedList = list.map(user => {
      const userData = formatAdminUser(user) as IAdminUser;
      return new AdminUserDTO(userData, {
        departmentName: user.department?.name,
        maskSensitiveData: true, // 列表查询默认脱敏
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
   * 根据ID获取管理员用户详情
   * @param id 用户ID
   * @returns 用户信息
   */
  async getAdminUserById(id: string): Promise<AdminUserDTO | null> {
    const user = await prisma.adminUser.findUnique({
      where: { id },
      include: {
        department: true,
        admin_user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) return null;

    // 转换为DTO格式
    const userData = formatAdminUser(user) as IAdminUser;
    return new AdminUserDTO(userData, {
      departmentName: user.department?.name,
      roles: user.admin_user_roles?.map((aur: any) => aur.role.name),
      permissions: [], // 这里可以根据需要获取权限列表
      maskSensitiveData: false, // 详情查询不脱敏
    });
  }

  /**
   * 根据用户名获取管理员用户（用于登录）
   * @param username 用户名
   * @returns 用户信息（包含密码）
   */
  async getAdminUserByUsername(username: string): Promise<any> {
    return await prisma.adminUser.findUnique({
      where: { username },
      include: {
        department: true,
        admin_user_roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * 创建管理员用户
   * @param data 创建用户数据
   * @returns 创建的用户信息
   */
  async createAdminUser(data: ICreateAdminUserRequest): Promise<AdminUserDTO> {
    // 检查用户名是否已存在
    const existingUser = await prisma.adminUser.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    if (data.email) {
      const existingEmail = await prisma.adminUser.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new Error('邮箱已存在');
      }
    }

    // 验证部门ID是否存在
    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });

      if (!department) {
        throw new Error('部门不存在');
      }
    }

    // 验证角色ID是否存在
    if (data.roleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: { id: { in: data.roleIds } },
      });

      if (roles.length !== data.roleIds.length) {
        throw new Error('部分角色不存在');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 创建用户
    const user = await prisma.adminUser.create({
      data: {
        username: data.username,
        password: hashedPassword,
        email: data.email,
        phone: data.phone,
        real_name: data.realName,
        department_id: data.departmentId,
      },
    });

    // 分配角色
    if (data.roleIds.length > 0) {
      await this.assignRolesToUser(user.id, data.roleIds);
    }

    return await this.getAdminUserById(user.id) as AdminUserDTO;
  }

  /**
   * 更新管理员用户
   * @param id 用户ID
   * @param data 更新数据
   * @returns 更新后的用户信息
   */
  async updateAdminUser(id: string, data: IUpdateAdminUserRequest): Promise<AdminUserDTO> {
    // 检查用户是否存在
    const existingUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('用户不存在');
    }

    // 检查邮箱是否重复
    if (data.email && data.email !== existingUser.email) {
      const duplicateEmail = await prisma.adminUser.findUnique({
        where: { email: data.email },
      });

      if (duplicateEmail) {
        throw new Error('邮箱已存在');
      }
    }

    // 验证部门ID是否存在
    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });

      if (!department) {
        throw new Error('部门不存在');
      }
    }

    // 验证角色ID是否存在
    if (data.roleIds && data.roleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: { id: { in: data.roleIds } },
      });

      if (roles.length !== data.roleIds.length) {
        throw new Error('部分角色不存在');
      }
    }

    // 更新用户基本信息
    await prisma.adminUser.update({
      where: { id },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.realName !== undefined && { real_name: data.realName }),
        ...(data.departmentId !== undefined && { department_id: data.departmentId }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    // 更新角色分配
    if (data.roleIds !== undefined) {
      await this.assignRolesToUser(id, data.roleIds);
    }

    return await this.getAdminUserById(id) as AdminUserDTO;
  }

  /**
   * 删除管理员用户
   * @param id 用户ID
   */
  async deleteAdminUser(id: string): Promise<void> {
    // 检查用户是否存在
    const existingUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('用户不存在');
    }

    // TODO: 检查是否为超级管理员，超级管理员不能删除

    // 删除用户（会自动删除关联的角色记录）
    await prisma.adminUser.delete({
      where: { id },
    });
  }

  /**
   * 管理员登录
   * @param data 登录数据
   * @returns 登录响应信息
   */
  async adminLogin(data: IAdminLoginRequest): Promise<IAdminLoginResponse> {
    // 查找用户
    const user = await this.getAdminUserByUsername(data.username);

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw new Error('账号已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    // 更新登录信息
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        last_login_time: new Date(),
        last_login_ip: '127.0.0.1', // TODO: 从请求中获取真实IP
      },
    });

    // 生成Token
    const token = jwtUtils.generateToken({ userId: user.id, userType: 'admin' });
    const refreshToken = jwtUtils.generateRefreshToken({ userId: user.id, userType: 'admin' });

    // 获取用户权限
    const permissions = await permissionService.getUserPermissionCodes(user.id);
    const menus = await permissionService.getUserMenuPermissions(user.id);

    // 排除密码字段
    const { password, ...userInfo } = user;

    return {
      token,
      refreshToken,
      userInfo: {
        ...userInfo,
        roles: user.admin_user_roles.map((aur: any) => aur.role),
      } as IAdminUser,
      permissions,
      menus,
    };
  }

  /**
   * 为用户分配角色
   * @param userId 用户ID
   * @param roleIds 角色ID数组
   */
  async assignRolesToUser(userId: string, roleIds: string[]): Promise<void> {
    // 删除现有角色关联
    await prisma.adminUserRole.deleteMany({
      where: { user_id: userId },
    });

    // 创建新的角色关联
    if (roleIds.length > 0) {
      const userRoles = roleIds.map(roleId => ({
        user_id: userId,
        role_id: roleId,
      }));

      await prisma.adminUserRole.createMany({
        data: userRoles,
      });
    }
  }

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param newPassword 新密码
   */
  async resetPassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.adminUser.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}

export const adminUserService = new AdminUserService();
