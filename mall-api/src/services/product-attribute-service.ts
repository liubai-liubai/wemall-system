/**
 * 商品属性管理服务
 * 处理商品属性相关的业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import {
  IProductAttributeDetail,
  CreateAttributeServiceRequest,
  UpdateAttributeServiceRequest,
  AttributeQueryOptions,
  ProductAttributeListResponse,
  BatchAttributeOperationResponse,
  ProductAttributeStatsResponse,
  ProductAttributeResponse,
  BatchCreateAttributesRequest,
  BatchAttributeOperationRequest
} from '../types/product-attribute';

const prisma = new PrismaClient();

export class ProductAttributeService {

  /**
   * 创建商品属性
   * @param data 创建数据
   * @returns 创建的商品属性
   */
  async createAttribute(data: CreateAttributeServiceRequest): Promise<ProductAttributeResponse> {
    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    // 检查同一商品下是否已存在相同的属性名称
    const existingAttribute = await prisma.productAttribute.findFirst({
      where: {
        product_id: data.productId,
        name: data.name
      }
    });

    if (existingAttribute) {
      throw new Error('该商品已存在相同名称的属性');
    }

    const attribute = await prisma.productAttribute.create({
      data: {
        product_id: data.productId,
        name: data.name,
        value: data.value
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    return this.formatAttributeResponse(attribute);
  }

  /**
   * 批量创建商品属性
   * @param data 批量创建数据
   * @returns 创建结果
   */
  async batchCreateAttributes(data: BatchCreateAttributesRequest): Promise<BatchAttributeOperationResponse> {
    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    // 获取现有属性名称
    const existingAttributes = await prisma.productAttribute.findMany({
      where: { product_id: data.productId },
      select: { name: true }
    });

    const existingNames = new Set(existingAttributes.map(attr => attr.name));
    const results: BatchAttributeOperationResponse = {
      successCount: 0,
      failureCount: 0,
      failures: []
    };

    // 批量创建
    for (const attr of data.attributes) {
      try {
        if (existingNames.has(attr.name)) {
          results.failureCount++;
          results.failures.push({
            id: '', // 创建时没有ID
            error: `属性名称"${attr.name}"已存在`
          });
          continue;
        }

        await prisma.productAttribute.create({
          data: {
            product_id: data.productId,
            name: attr.name,
            value: attr.value
          }
        });

        results.successCount++;
      } catch (error) {
        results.failureCount++;
        results.failures.push({
          id: '',
          error: error instanceof Error ? error.message : '创建失败'
        });
      }
    }

    return results;
  }

  /**
   * 根据ID获取商品属性
   * @param id 属性ID
   * @returns 商品属性详情
   */
  async getAttributeById(id: string): Promise<ProductAttributeResponse | null> {
    const attribute = await prisma.productAttribute.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    if (!attribute) {
      return null;
    }

    return this.formatAttributeResponse(attribute);
  }

  /**
   * 更新商品属性
   * @param id 属性ID
   * @param data 更新数据
   * @returns 更新后的商品属性
   */
  async updateAttribute(id: string, data: UpdateAttributeServiceRequest): Promise<ProductAttributeResponse> {
    // 检查属性是否存在
    const existingAttribute = await prisma.productAttribute.findUnique({
      where: { id }
    });

    if (!existingAttribute) {
      throw new Error('商品属性不存在');
    }

    // 如果更新名称，检查同一商品下是否已存在相同名称的其他属性
    if (data.name && data.name !== existingAttribute.name) {
      const duplicateAttribute = await prisma.productAttribute.findFirst({
        where: {
          product_id: existingAttribute.product_id,
          name: data.name,
          id: { not: id }
        }
      });

      if (duplicateAttribute) {
        throw new Error('该商品已存在相同名称的属性');
      }
    }

    const attribute = await prisma.productAttribute.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.value && { value: data.value })
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    return this.formatAttributeResponse(attribute);
  }

  /**
   * 删除商品属性
   * @param id 属性ID
   */
  async deleteAttribute(id: string): Promise<void> {
    const attribute = await prisma.productAttribute.findUnique({
      where: { id }
    });

    if (!attribute) {
      throw new Error('商品属性不存在');
    }

    await prisma.productAttribute.delete({
      where: { id }
    });
  }

  /**
   * 获取商品属性列表
   * @param options 查询选项
   * @returns 分页的商品属性列表
   */
  async getAttributeList(options: AttributeQueryOptions): Promise<ProductAttributeListResponse> {
    const { page, size, productId, name, value, keyword, includeProduct = true } = options;
    
    // 构建查询条件
    const where: any = {};
    
    if (productId) {
      where.product_id = productId;
    }
    
    if (name) {
      where.name = { contains: name };
    }
    
    if (value) {
      where.value = { contains: value };
    }
    
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { value: { contains: keyword } }
      ];
    }

    const [attributes, total] = await Promise.all([
      prisma.productAttribute.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        include: includeProduct ? {
          product: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        } : undefined,
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.productAttribute.count({ where })
    ]);

    const list = attributes.map(attr => this.formatAttributeResponse(attr));

    return {
      list,
      total,
      page,
      size,
      pages: Math.ceil(total / size)
    };
  }

  /**
   * 根据商品ID获取属性列表
   * @param productId 商品ID
   * @returns 商品属性列表
   */
  async getAttributesByProductId(productId: string): Promise<ProductAttributeResponse[]> {
    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    const attributes = await prisma.productAttribute.findMany({
      where: { product_id: productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    return attributes.map(attr => this.formatAttributeResponse(attr));
  }

  /**
   * 批量操作商品属性
   * @param data 批量操作数据
   * @returns 操作结果
   */
  async batchOperateAttributes(data: BatchAttributeOperationRequest): Promise<BatchAttributeOperationResponse> {
    const results: BatchAttributeOperationResponse = {
      successCount: 0,
      failureCount: 0,
      failures: []
    };

    for (const id of data.ids) {
      try {
        if (data.operation === 'delete') {
          await this.deleteAttribute(id);
        } else if (data.operation === 'update' && data.updateData) {
          await this.updateAttribute(id, data.updateData);
        }
        results.successCount++;
      } catch (error) {
        results.failureCount++;
        results.failures.push({
          id,
          error: error instanceof Error ? error.message : '操作失败'
        });
      }
    }

    return results;
  }

  /**
   * 获取商品属性统计信息
   * @returns 统计信息
   */
  async getAttributeStats(): Promise<ProductAttributeStatsResponse> {
    const [
      totalAttributes,
      totalProducts,
      topAttributeNames,
      topAttributeValues
    ] = await Promise.all([
      // 总属性数
      prisma.productAttribute.count(),
      
      // 有属性的商品数
      prisma.productAttribute.groupBy({
        by: ['product_id'],
        _count: { product_id: true }
      }).then(groups => groups.length),
      
      // 最常用的属性名称
      prisma.productAttribute.groupBy({
        by: ['name'],
        _count: { name: true },
        orderBy: { _count: { name: 'desc' } },
        take: 10
      }),
      
      // 最常用的属性值
      prisma.productAttribute.groupBy({
        by: ['value'],
        _count: { value: true },
        orderBy: { _count: { value: 'desc' } },
        take: 10
      })
    ]);

    return {
      totalAttributes,
      totalProducts,
      avgAttributesPerProduct: totalProducts > 0 ? Math.round((totalAttributes / totalProducts) * 100) / 100 : 0,
      topAttributeNames: topAttributeNames.map(item => ({
        name: item.name,
        count: item._count.name
      })),
      topAttributeValues: topAttributeValues.map(item => ({
        value: item.value,
        count: item._count.value
      }))
    };
  }

  /**
   * 格式化属性响应数据
   * @param attribute 原始属性数据
   * @returns 格式化后的属性数据
   */
  private formatAttributeResponse(attribute: any): ProductAttributeResponse {
    return {
      id: attribute.id,
      productId: attribute.product_id,
      name: attribute.name,
      value: attribute.value,
      createdAt: attribute.created_at.toISOString(),
      ...(attribute.product && {
        product: {
          id: attribute.product.id,
          name: attribute.product.name,
          status: attribute.product.status
        }
      })
    };
  }
} 