/**
 * SKU管理业务逻辑服务
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import {
  ISkuCreateParams,
  ISkuUpdateParams,
  ISkuQueryParams,
  ISkuListResponse,
  ISkuDetail,
  ISkuStockStats,
  ISkuBatchParams
} from '../types/sku.js';

const prisma = new PrismaClient();

export class SkuService {
  /**
   * 创建SKU
   */
  async createSku(params: ISkuCreateParams): Promise<ISkuDetail> {
    // 1. 验证商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: params.productId }
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    // 2. 检查SKU编码是否重复
    const existingSku = await prisma.productSku.findUnique({
      where: { sku_code: params.skuCode }
    });

    if (existingSku) {
      throw new Error('SKU编码已存在');
    }

    // 3. 创建SKU
    const sku = await prisma.productSku.create({
      data: {
        product_id: params.productId,
        sku_code: params.skuCode,
        price: params.price,
        stock: params.stock || 0,
        attributes: (params.attributes || {}) as any,
        status: params.status || 1
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category_id: true,
            status: true
          }
        }
      }
    });

    return this.formatSkuDetail(sku);
  }

  /**
   * 获取SKU详情
   */
  async getSkuById(id: string): Promise<ISkuDetail | null> {
    const sku = await prisma.productSku.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category_id: true,
            status: true
          }
        }
      }
    });

    if (!sku) {
      return null;
    }

    return this.formatSkuDetail(sku);
  }

  /**
   * 更新SKU
   */
  async updateSku(id: string, params: ISkuUpdateParams): Promise<ISkuDetail> {
    // 1. 验证SKU是否存在
    const existingSku = await prisma.productSku.findUnique({
      where: { id }
    });

    if (!existingSku) {
      throw new Error('SKU不存在');
    }

    // 2. 如果更新SKU编码，检查是否重复
    if (params.skuCode && params.skuCode !== existingSku.sku_code) {
      const duplicateSku = await prisma.productSku.findUnique({
        where: { sku_code: params.skuCode }
      });

      if (duplicateSku) {
        throw new Error('SKU编码已存在');
      }
    }

    // 3. 更新SKU
    const updateData: any = {};
    if (params.skuCode) updateData.sku_code = params.skuCode;
    if (params.price !== undefined) updateData.price = params.price;
    if (params.stock !== undefined) updateData.stock = params.stock;
    if (params.attributes !== undefined) updateData.attributes = params.attributes as any;
    if (params.status !== undefined) updateData.status = params.status;

    const sku = await prisma.productSku.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category_id: true,
            status: true
          }
        }
      }
    });

    return this.formatSkuDetail(sku);
  }

  /**
   * 删除SKU
   */
  async deleteSku(id: string): Promise<void> {
    // 1. 验证SKU是否存在
    const sku = await prisma.productSku.findUnique({
      where: { id }
    });

    if (!sku) {
      throw new Error('SKU不存在');
    }

    // 2. 检查是否有关联的购物车记录
    const cartCount = await prisma.shoppingCart.count({
      where: { sku_id: id }
    });

    if (cartCount > 0) {
      throw new Error('SKU已被添加到购物车，无法删除');
    }

    // 3. 检查是否有关联的订单记录
    const orderItemCount = await prisma.orderItem.count({
      where: { sku_id: id }
    });

    if (orderItemCount > 0) {
      throw new Error('SKU已有订单记录，无法删除');
    }

    // 4. 删除SKU
    await prisma.productSku.delete({
      where: { id }
    });
  }

  /**
   * 获取SKU列表（分页）
   */
  async getSkuList(params: ISkuQueryParams): Promise<ISkuListResponse> {
    const {
      page = 1,
      size = 10,
      productId,
      skuCode,
      status,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc'
    } = params;

    const skip = (page - 1) * size;

    // 构建查询条件
    const where: any = {};

    if (productId) {
      where.product_id = productId;
    }

    if (skuCode) {
      where.sku_code = {
        contains: skuCode
      };
    }

    if (status !== undefined) {
      where.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // 字段映射
    const sortFieldMap: Record<string, string> = {
      skuCode: 'sku_code',
      price: 'price',
      stock: 'stock',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };

    const orderBy = {
      [sortFieldMap[sort] || 'created_at']: order
    };

    // 查询数据
    const [skus, total] = await Promise.all([
      prisma.productSku.findMany({
        where,
        skip,
        take: size,
        orderBy,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category_id: true,
              status: true
            }
          }
        }
      }),
      prisma.productSku.count({ where })
    ]);

    const list = skus.map(sku => this.formatSkuDetail(sku));

    return {
      list,
      total,
      page,
      size,
      pages: Math.ceil(total / size)
    };
  }

  /**
   * 根据商品ID获取SKU列表
   */
  async getSkusByProductId(productId: string): Promise<ISkuDetail[]> {
    const skus = await prisma.productSku.findMany({
      where: { product_id: productId },
      orderBy: { created_at: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category_id: true,
            status: true
          }
        }
      }
    });

    return skus.map(sku => this.formatSkuDetail(sku));
  }

  /**
   * 获取SKU库存统计
   */
  async getSkuStockStats(): Promise<ISkuStockStats> {
    const [totalSkus, lowStockSkus, outOfStockSkus, stockValueResult] = await Promise.all([
      // 总SKU数量
      prisma.productSku.count({
        where: { status: 1 }
      }),
      // 低库存SKU数量（库存少于10）
      prisma.productSku.count({
        where: {
          status: 1,
          stock: { lt: 10, gt: 0 }
        }
      }),
      // 缺货SKU数量
      prisma.productSku.count({
        where: {
          status: 1,
          stock: 0
        }
      }),
      // 库存总价值
      prisma.productSku.aggregate({
        where: { status: 1 },
        _sum: {
          stock: true
        }
      })
    ]);

    return {
      totalSkus,
      lowStockSkus,
      outOfStockSkus,
      totalStockValue: Number(stockValueResult._sum.stock || 0)
    };
  }

  /**
   * 批量操作SKU
   */
  async batchOperateSkus(params: ISkuBatchParams): Promise<any> {
    const { ids, action, stockAdjustment } = params;
    const results = [];

    for (const id of ids) {
      try {
        switch (action) {
          case 'delete':
            await this.deleteSku(id);
            results.push({ id, success: true });
            break;

          case 'enable':
            await prisma.productSku.update({
              where: { id },
              data: { status: 1 }
            });
            results.push({ id, success: true });
            break;

          case 'disable':
            await prisma.productSku.update({
              where: { id },
              data: { status: 0 }
            });
            results.push({ id, success: true });
            break;

          case 'adjustStock':
            if (stockAdjustment === undefined) {
              throw new Error('库存调整数量不能为空');
            }
            await this.adjustSkuStock(id, stockAdjustment);
            results.push({ id, success: true });
            break;

          default:
            results.push({ id, success: false, message: '不支持的操作类型' });
        }
      } catch (error) {
        results.push({
          id,
          success: false,
          message: error instanceof Error ? error.message : '操作失败'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      successCount,
      failureCount,
      details: results
    };
  }

  /**
   * 调整SKU库存
   */
  async adjustSkuStock(id: string, adjustment: number, reason?: string): Promise<ISkuDetail> {
    const sku = await prisma.productSku.findUnique({
      where: { id }
    });

    if (!sku) {
      throw new Error('SKU不存在');
    }

    const newStock = sku.stock + adjustment;
    if (newStock < 0) {
      throw new Error('调整后库存不能小于0');
    }

    const updatedSku = await prisma.productSku.update({
      where: { id },
      data: { stock: newStock },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category_id: true,
            status: true
          }
        }
      }
    });

    return this.formatSkuDetail(updatedSku);
  }

  /**
   * 格式化SKU详情数据
   */
  private formatSkuDetail(sku: any): ISkuDetail {
    return {
      id: sku.id,
      productId: sku.product_id,
      skuCode: sku.sku_code,
      price: Number(sku.price),
      stock: sku.stock,
      attributes: sku.attributes as Record<string, unknown>,
      status: sku.status,
      createdAt: sku.created_at,
      updatedAt: sku.updated_at,
      product: {
        id: sku.product.id,
        name: sku.product.name,
        categoryId: sku.product.category_id,
        status: sku.product.status
      }
    };
  }
} 