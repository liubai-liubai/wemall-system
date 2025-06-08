/**
 * 部门管理服务
 * 处理部门相关的核心业务逻辑，包括部门的增删改查、部门树构建等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { 
  IDepartment, 
  ICreateDepartmentRequest, 
  IUpdateDepartmentRequest,
  IDepartmentQueryParams
} from '../types/system';
import { DepartmentModel, DepartmentDTO, DepartmentSimpleDTO, DepartmentTreeNode } from '../models/index';
import { formatDepartment } from '../utils/format';

const prisma = new PrismaClient();

export class DepartmentService {
  /**
   * 获取部门树形结构
   * @param params 查询参数
   * @returns 部门树
   */
  async getDepartmentTree(params: IDepartmentQueryParams = {}): Promise<DepartmentTreeNode[]> {
    const { name, status } = params;
    
    // 构建查询条件
    const where: any = {};
    if (name) where.name = { contains: name };
    if (status !== undefined) where.status = status;

    // 查询所有部门
    const departments = await prisma.department.findMany({
      where,
      include: {
        _count: {
          select: {
            admin_users: true,
          },
        },
      },
      orderBy: [{ sort: 'asc' }, { created_at: 'asc' }],
    });

    // 使用新的树节点构建器
    return this.buildDepartmentTreeNodes(departments);
  }

  /**
   * 构建部门树形结构（使用DepartmentTreeNode）
   * @param departments 部门平铺数组
   * @returns 部门树
   */
  private buildDepartmentTreeNodes(departments: any[]): DepartmentTreeNode[] {
    const nodeMap = new Map<string, DepartmentTreeNode>();
    const rootNodes: DepartmentTreeNode[] = [];

    // 创建所有节点
    departments.forEach(department => {
      const departmentData = formatDepartment(department) as IDepartment;
      // 添加用户数量
      departmentData.userCount = department._count?.admin_users || 0;
      
      const node = new DepartmentTreeNode(departmentData);
      nodeMap.set(department.id, node);
    });

    // 建立父子关系
    departments.forEach(department => {
      const node = nodeMap.get(department.id)!;
      if (department.parent_id) {
        const parentNode = nodeMap.get(department.parent_id);
        if (parentNode) {
          parentNode.children.push(node);
          node.parent = parentNode;
        }
      } else {
        rootNodes.push(node);
      }
    });

    // 排序子节点
    const sortNodes = (nodes: DepartmentTreeNode[]) => {
      nodes.sort((a, b) => a.department.sort - b.department.sort);
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
   * 构建部门树形结构（保留原有方法用于兼容）
   * @param departments 部门平铺数组
   * @returns 部门树
   */
  private buildDepartmentTree(departments: any[]): IDepartment[] {
    const departmentMap = new Map();
    const tree: IDepartment[] = [];

    // 创建映射
    departments.forEach(department => {
      departmentMap.set(department.id, {
        ...department,
        children: []
      });
    });

    // 构建树形结构
    departments.forEach(department => {
      const node = departmentMap.get(department.id);
      if (department.parent_id) {
        const parent = departmentMap.get(department.parent_id);
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
   * 根据ID获取部门详情
   * @param id 部门ID
   * @returns 部门信息
   */
  async getDepartmentById(id: string): Promise<DepartmentDTO | null> {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: [{ sort: 'asc' }],
        },
        _count: {
          select: {
            admin_users: true,
          },
        },
      },
    });

    if (!department) return null;

    const departmentData = formatDepartment(department) as IDepartment;
    // 添加用户数量
    departmentData.userCount = department._count?.admin_users || 0;

    return new DepartmentDTO(departmentData);
  }

  /**
   * 创建部门
   * @param data 创建部门数据
   * @returns 创建的部门信息
   */
  async createDepartment(data: ICreateDepartmentRequest): Promise<DepartmentDTO> {
    // 处理空字符串，转换为null
    const parentId = data.parentId?.trim() || null;
    const leaderId = data.leaderId?.trim() || null;
    const phone = data.phone?.trim() || null;
    const email = data.email?.trim() || null;

    // 如果有父部门，验证父部门是否存在
    if (parentId) {
      const parentDepartment = await prisma.department.findUnique({
        where: { id: parentId },
      });

      if (!parentDepartment) {
        throw new Error('父部门不存在');
      }
    }

    // 如果有负责人，验证负责人是否存在
    if (leaderId) {
      const leader = await prisma.adminUser.findUnique({
        where: { id: leaderId },
      });

      if (!leader) {
        throw new Error('部门负责人不存在');
      }
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        parent_id: parentId,
        leader_id: leaderId,
        phone: phone,
        email: email,
        sort: data.sort || 0,
      },
    });

    return await this.getDepartmentById(department.id) as DepartmentDTO;
  }

  /**
   * 更新部门
   * @param id 部门ID
   * @param data 更新数据
   * @returns 更新后的部门信息
   */
  async updateDepartment(id: string, data: IUpdateDepartmentRequest): Promise<DepartmentDTO> {
    // 检查部门是否存在
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      throw new Error('部门不存在');
    }

    // 如果更新父部门，验证父部门是否存在且不是自己
    if (data.parentId) {
      if (data.parentId === id) {
        throw new Error('不能将自己设为父部门');
      }

      const parentDepartment = await prisma.department.findUnique({
        where: { id: data.parentId },
      });

      if (!parentDepartment) {
        throw new Error('父部门不存在');
      }

      // 检查是否会形成循环引用
      if (await this.wouldCreateCycle(id, data.parentId)) {
        throw new Error('不能选择子部门作为父部门');
      }
    }

    // 如果有负责人，验证负责人是否存在
    if (data.leaderId) {
      const leader = await prisma.adminUser.findUnique({
        where: { id: data.leaderId },
      });

      if (!leader) {
        throw new Error('部门负责人不存在');
      }
    }

    await prisma.department.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.parentId !== undefined && { parent_id: data.parentId }),
        ...(data.leaderId !== undefined && { leader_id: data.leaderId }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.sort !== undefined && { sort: data.sort }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    return await this.getDepartmentById(id) as DepartmentDTO;
  }

  /**
   * 删除部门
   * @param id 部门ID
   */
  async deleteDepartment(id: string): Promise<void> {
    // 检查部门是否存在
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
      include: {
        children: true,
        admin_users: true,
      },
    });

    if (!existingDepartment) {
      throw new Error('部门不存在');
    }

    // 检查是否有子部门
    if (existingDepartment.children.length > 0) {
      throw new Error('存在子部门，无法删除');
    }

    // 检查是否有员工
    if (existingDepartment.admin_users.length > 0) {
      throw new Error('部门下有员工，无法删除');
    }

    await prisma.department.delete({
      where: { id },
    });
  }

  /**
   * 检查是否会形成循环引用
   * @param departmentId 部门ID
   * @param parentId 父部门ID
   * @returns 是否会形成循环
   */
  private async wouldCreateCycle(departmentId: string, parentId: string): Promise<boolean> {
    let currentId: string | null = parentId;
    
    while (currentId) {
      if (currentId === departmentId) {
        return true;
      }
      
      const department: { parent_id: string | null } | null = await prisma.department.findUnique({
        where: { id: currentId },
        select: { parent_id: true },
      });
      
      currentId = department?.parent_id || null;
    }
    
    return false;
  }

  /**
   * 获取部门下的所有子部门ID（递归）
   * @param departmentId 部门ID
   * @returns 子部门ID数组
   */
  async getChildDepartmentIds(departmentId: string): Promise<string[]> {
    const children = await prisma.department.findMany({
      where: { parent_id: departmentId },
      select: { id: true },
    });

    let allChildIds = children.map(child => child.id);

    // 递归获取子部门的子部门
    for (const child of children) {
      const grandChildren = await this.getChildDepartmentIds(child.id);
      allChildIds = allChildIds.concat(grandChildren);
    }

    return allChildIds;
  }
}

export const departmentService = new DepartmentService();
