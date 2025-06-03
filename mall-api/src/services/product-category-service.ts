/**
 * 商品分类服务层
 * 处理商品分类相关的业务逻辑，包括CRUD操作、树形结构管理等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { 
  IProductCategory,
  CreateProductCategoryRequest, 
  UpdateProductCategoryRequest,
  ProductCategoryQueryParams,
  ProductCategoryListResponse,
  CategoryTreeResponse,
  CategoryStatus
} from '../types/product';
import { logger } from '../utils/logger';

export class ProductCategoryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * 获取商品分类列表（分页）
   */
  async getCategoryList(params: ProductCategoryQueryParams): Promise<ProductCategoryListResponse> {
    try {
      const {
        parentId,
        level,
        status,
        keyword,
        page = 1,
        size = 20,
        sortBy = 'sort',
        sortOrder = 'asc'
      } = params;

      // 构建查询条件
      const where: any = {};
      
      if (parentId !== undefined) {
        where.parent_id = parentId;
      }
      if (level !== undefined) {
        where.level = level;
      }
      if (status !== undefined) {
        where.status = status;
      }
      if (keyword) {
        where.name = { contains: keyword };
      }

      // 构建排序条件
      const orderBy: any = {};
      if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else if (sortBy === 'created_at') {
        orderBy.created_at = sortOrder;
      } else if (sortBy === 'updated_at') {
        orderBy.updated_at = sortOrder;
      } else {
        orderBy.sort = sortOrder;
      }

      // 查询总数
      const total = await this.prisma.productCategory.count({ where });

      // 查询列表数据
      const categories = await this.prisma.productCategory.findMany({
        where,
        orderBy,
        skip: (page - 1) * size,
        take: size,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              level: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              level: true,
              status: true
            }
          },
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      const pages = Math.ceil(total / size);

      logger.info(`获取商品分类列表成功，查询到 ${categories.length} 条记录`);

      return {
        list: categories.map(this.formatCategoryResponse),
        total,
        page,
        size,
        pages
      };

    } catch (error) {
      logger.error('获取商品分类列表失败:', error);
      throw new Error('获取商品分类列表失败');
    }
  }

  /**
   * 根据ID获取分类详情
   */
  async getCategoryById(id: string): Promise<IProductCategory> {
    try {
      const category = await this.prisma.productCategory.findUnique({
        where: { id },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              level: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              level: true,
              status: true,
              sort: true
            },
            orderBy: {
              sort: 'asc'
            }
          },
          products: {
            select: {
              id: true,
              name: true,
              status: true
            },
            take: 10 // 只返回前10个商品
          }
        }
      });

      if (!category) {
        throw new Error('商品分类不存在');
      }

      logger.info(`获取商品分类详情成功: ${id}`);
      return this.formatCategoryResponse(category);

    } catch (error) {
      logger.error('获取商品分类详情失败:', error);
      if (error instanceof Error && error.message === '商品分类不存在') {
        throw error;
      }
      throw new Error('获取商品分类详情失败');
    }
  }

  /**
   * 获取分类树形结构
   */
  async getCategoryTree(status?: CategoryStatus): Promise<CategoryTreeResponse[]> {
    try {
      const where: any = {};
      if (status !== undefined) {
        where.status = status;
      }

      const categories = await this.prisma.productCategory.findMany({
        where,
        orderBy: [
          { level: 'asc' },
          { sort: 'asc' }
        ],
        select: {
          id: true,
          name: true,
          parent_id: true,
          level: true,
          sort: true,
          status: true
        }
      });

      // 构建树形结构
      const tree = this.buildCategoryTree(categories);

      logger.info(`获取分类树形结构成功，共 ${categories.length} 个分类`);
      return tree;

    } catch (error) {
      logger.error('获取分类树形结构失败:', error);
      throw new Error('获取分类树形结构失败');
    }
  }

  /**
   * 获取所有根分类
   */
  async getRootCategories(): Promise<IProductCategory[]> {
    try {
      const categories = await this.prisma.productCategory.findMany({
        where: { 
          parent_id: null,
          status: CategoryStatus.ENABLED
        },
        orderBy: { sort: 'asc' },
        include: {
          children: {
            where: { status: CategoryStatus.ENABLED },
            orderBy: { sort: 'asc' },
            select: {
              id: true,
              name: true,
              level: true,
              sort: true,
              status: true
            }
          }
        }
      });

      logger.info(`获取根分类成功，共 ${categories.length} 个根分类`);
      return categories.map(this.formatCategoryResponse);

    } catch (error) {
      logger.error('获取根分类失败:', error);
      throw new Error('获取根分类失败');
    }
  }

  /**
   * 获取指定分类的子分类
   */
  async getChildCategories(parentId: string): Promise<IProductCategory[]> {
    try {
      const categories = await this.prisma.productCategory.findMany({
        where: { parent_id: parentId },
        orderBy: { sort: 'asc' },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              level: true
            }
          },
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      logger.info(`获取子分类成功: ${parentId}，共 ${categories.length} 个子分类`);
      return categories.map(this.formatCategoryResponse);

    } catch (error) {
      logger.error('获取子分类失败:', error);
      throw new Error('获取子分类失败');
    }
  }

  /**
   * 创建新分类
   */
  async createCategory(data: CreateProductCategoryRequest): Promise<IProductCategory> {
    try {
      // 验证分类信息
      await this.validateCategory(data);

      // 计算分类层级
      let level = 1;
      let parentCategory = null;

      if (data.parentId) {
        parentCategory = await this.prisma.productCategory.findUnique({
          where: { id: data.parentId }
        });

        if (!parentCategory) {
          throw new Error('父分类不存在');
        }

        level = parentCategory.level + 1;

        // 检查层级限制（最多3级）
        if (level > 3) {
          throw new Error('分类层级不能超过3级');
        }
      }

      // 检查同级分类名称是否重复
      const existingCategory = await this.prisma.productCategory.findFirst({
        where: {
          name: data.name,
          parent_id: data.parentId || null
        }
      });

      if (existingCategory) {
        throw new Error('同级分类名称已存在');
      }

      // 创建分类
      const newCategory = await this.prisma.productCategory.create({
        data: {
          name: data.name,
          parent_id: data.parentId || null,
          level,
          sort: data.sort || 0,
          status: data.status !== undefined ? data.status : CategoryStatus.ENABLED
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              level: true
            }
          }
        }
      });

      logger.info(`创建商品分类成功: ${newCategory.id}`);
      return this.formatCategoryResponse(newCategory);

    } catch (error) {
      logger.error('创建商品分类失败:', error);
      if (error instanceof Error && (
        error.message === '父分类不存在' || 
        error.message === '分类层级不能超过3级' ||
        error.message === '同级分类名称已存在' ||
        error.message.includes('验证失败')
      )) {
        throw error;
      }
      throw new Error('创建商品分类失败');
    }
  }

  /**
   * 更新分类信息
   */
  async updateCategory(id: string, data: UpdateProductCategoryRequest): Promise<IProductCategory> {
    try {
      // 检查分类是否存在
      const existingCategory = await this.prisma.productCategory.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        throw new Error('商品分类不存在');
      }

      // 验证分类信息
      if (data.name || data.parentId !== undefined) {
        await this.validateCategory(data as CreateProductCategoryRequest);
      }

      let updateData: any = {};

      // 处理父分类变更
      if (data.parentId !== undefined) {
        if (data.parentId === id) {
          throw new Error('不能将分类设置为自己的子分类');
        }

        // 检查是否会形成循环引用
        if (data.parentId) {
          const isDescendant = await this.isDescendantCategory(data.parentId, id);
          if (isDescendant) {
            throw new Error('不能将分类移动到其子分类下');
          }

          const parentCategory = await this.prisma.productCategory.findUnique({
            where: { id: data.parentId }
          });

          if (!parentCategory) {
            throw new Error('父分类不存在');
          }

          const newLevel = parentCategory.level + 1;
          if (newLevel > 3) {
            throw new Error('分类层级不能超过3级');
          }

          updateData.parent_id = data.parentId;
          updateData.level = newLevel;
        } else {
          updateData.parent_id = null;
          updateData.level = 1;
        }
      }

      // 检查名称重复
      if (data.name) {
        const parentId = data.parentId !== undefined ? data.parentId : existingCategory.parent_id;
        const existingNameCategory = await this.prisma.productCategory.findFirst({
          where: {
            name: data.name,
            parent_id: parentId,
            id: { not: id }
          }
        });

        if (existingNameCategory) {
          throw new Error('同级分类名称已存在');
        }

        updateData.name = data.name;
      }

      if (data.sort !== undefined) updateData.sort = data.sort;
      if (data.status !== undefined) updateData.status = data.status;

      updateData.updated_at = new Date();

      // 更新分类
      const updatedCategory = await this.prisma.productCategory.update({
        where: { id },
        data: updateData,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              level: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              level: true,
              status: true
            }
          }
        }
      });

      // 如果层级发生变化，需要更新所有子分类的层级
      if (updateData.level) {
        await this.updateChildrenLevel(id, updateData.level);
      }

      logger.info(`更新商品分类成功: ${id}`);
      return this.formatCategoryResponse(updatedCategory);

    } catch (error) {
      logger.error('更新商品分类失败:', error);
      if (error instanceof Error && (
        error.message === '商品分类不存在' ||
        error.message === '父分类不存在' ||
        error.message === '不能将分类设置为自己的子分类' ||
        error.message === '不能将分类移动到其子分类下' ||
        error.message === '分类层级不能超过3级' ||
        error.message === '同级分类名称已存在' ||
        error.message.includes('验证失败')
      )) {
        throw error;
      }
      throw new Error('更新商品分类失败');
    }
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      // 检查分类是否存在
      const category = await this.prisma.productCategory.findUnique({
        where: { id },
        include: {
          children: true,
          products: true
        }
      });

      if (!category) {
        throw new Error('商品分类不存在');
      }

      // 检查是否有子分类
      if (category.children.length > 0) {
        throw new Error('该分类下存在子分类，不能删除');
      }

      // 检查是否有商品
      if (category.products.length > 0) {
        throw new Error('该分类下存在商品，不能删除');
      }

      // 删除分类
      await this.prisma.productCategory.delete({
        where: { id }
      });

      logger.info(`删除商品分类成功: ${id}`);

    } catch (error) {
      logger.error('删除商品分类失败:', error);
      if (error instanceof Error && (
        error.message === '商品分类不存在' ||
        error.message === '该分类下存在子分类，不能删除' ||
        error.message === '该分类下存在商品，不能删除'
      )) {
        throw error;
      }
      throw new Error('删除商品分类失败');
    }
  }

  /**
   * 批量更新分类排序
   */
  async updateCategoriesSort(updates: Array<{ id: string; sort: number }>): Promise<void> {
    try {
      // 使用事务批量更新
      await this.prisma.$transaction(
        updates.map(update => 
          this.prisma.productCategory.update({
            where: { id: update.id },
            data: { sort: update.sort }
          })
        )
      );

      logger.info(`批量更新分类排序成功，共更新 ${updates.length} 个分类`);

    } catch (error) {
      logger.error('批量更新分类排序失败:', error);
      throw new Error('批量更新分类排序失败');
    }
  }

  /**
   * 验证分类信息
   */
  private async validateCategory(data: Partial<CreateProductCategoryRequest>): Promise<void> {
    const errors: string[] = [];

    // 验证分类名称
    if (data.name) {
      if (data.name.length < 1 || data.name.length > 50) {
        errors.push('分类名称长度应在1-50个字符之间');
      }
    }

    // 验证排序值
    if (data.sort !== undefined && (data.sort < 0 || data.sort > 9999)) {
      errors.push('排序值应在0-9999之间');
    }

    if (errors.length > 0) {
      throw new Error(`分类验证失败: ${errors.join(', ')}`);
    }
  }

  /**
   * 检查是否为后代分类
   */
  private async isDescendantCategory(parentId: string, categoryId: string): Promise<boolean> {
    const children = await this.prisma.productCategory.findMany({
      where: { parent_id: parentId },
      select: { id: true }
    });

    for (const child of children) {
      if (child.id === categoryId) {
        return true;
      }
      const isDescendant = await this.isDescendantCategory(child.id, categoryId);
      if (isDescendant) {
        return true;
      }
    }

    return false;
  }

  /**
   * 更新子分类层级
   */
  private async updateChildrenLevel(parentId: string, parentLevel: number): Promise<void> {
    const children = await this.prisma.productCategory.findMany({
      where: { parent_id: parentId }
    });

    for (const child of children) {
      const newLevel = parentLevel + 1;
      await this.prisma.productCategory.update({
        where: { id: child.id },
        data: { level: newLevel }
      });

      // 递归更新子分类的子分类
      await this.updateChildrenLevel(child.id, newLevel);
    }
  }

  /**
   * 构建分类树形结构
   */
  private buildCategoryTree(categories: any[]): CategoryTreeResponse[] {
    const categoryMap = new Map();
    const tree: CategoryTreeResponse[] = [];

    // 创建分类映射
    categories.forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.name,
        level: category.level,
        sort: category.sort,
        status: category.status,
        children: []
      });
    });

    // 构建树形结构
    categories.forEach(category => {
      const node = categoryMap.get(category.id);
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
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
   * 格式化分类响应数据
   */
  private formatCategoryResponse(category: any): IProductCategory {
    return {
      id: category.id,
      name: category.name,
      parentId: category.parent_id,
      level: category.level,
      sort: category.sort,
      status: category.status,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
      parent: category.parent ? {
        id: category.parent.id,
        name: category.parent.name,
        parentId: undefined,
        level: category.parent.level,
        sort: 0,
        status: CategoryStatus.ENABLED,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined,
      children: category.children ? category.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        parentId: category.id,
        level: child.level,
        sort: child.sort,
        status: child.status,
        createdAt: new Date(),
        updatedAt: new Date()
      })) : undefined,
      products: category.products ? category.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        categoryId: category.id,
        price: 0,
        marketPrice: 0,
        status: product.status,
        stock: 0,
        sales: 0,
        sort: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })) : undefined
    };
  }
} 