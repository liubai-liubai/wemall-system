/**
 * 商品图片服务层
 * @author 刘白 & AI Assistant
 */

import { PrismaClient } from '@prisma/client';
import {
  IProductImageService,
  ICreateProductImageRequest,
  IUpdateProductImageRequest,
  IBatchCreateProductImageRequest,
  IBatchUpdateSortRequest,
  IProductImageQuery,
  IProductImageResponse,
  IProductImagePageResponse,
  IProductImageStats
} from '../types/product-image';

const prisma = new PrismaClient();

export class ProductImageService implements IProductImageService {

  /**
   * 格式化商品图片数据
   */
  private formatImage(image: any): IProductImageResponse {
    return {
      id: image.id,
      product_id: image.product_id,
      url: image.url,
      type: image.type,
      sort: image.sort,
      created_at: image.created_at,
      product: image.product ? {
        id: image.product.id,
        name: image.product.name,
        main_image: image.product.main_image
      } : undefined
    };
  }

  /**
   * 验证商品是否存在
   */
  private async validateProduct(productId: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      throw new Error('商品不存在');
    }
  }

  /**
   * 验证图片是否属于指定商品
   */
  private async validateImageOwnership(imageId: string, productId: string): Promise<void> {
    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        product_id: productId
      }
    });
    
    if (!image) {
      throw new Error('图片不存在或不属于该商品');
    }
  }

  /**
   * 创建商品图片
   */
  async create(data: ICreateProductImageRequest): Promise<IProductImageResponse> {
    // 验证商品存在
    await this.validateProduct(data.product_id);

    // 如果没有指定排序，自动设置为最大值+1
    if (data.sort === undefined) {
      const maxSort = await prisma.productImage.findFirst({
        where: { product_id: data.product_id },
        orderBy: { sort: 'desc' }
      });
      data.sort = maxSort ? maxSort.sort + 1 : 0;
    }

    const image = await prisma.productImage.create({
      data: {
        product_id: data.product_id,
        url: data.url,
        type: data.type || 'main',
        sort: data.sort
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        }
      }
    });

    return this.formatImage(image);
  }

  /**
   * 根据ID查找图片
   */
  async findById(id: string): Promise<IProductImageResponse | null> {
    const image = await prisma.productImage.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        }
      }
    });

    return image ? this.formatImage(image) : null;
  }

  /**
   * 更新图片信息
   */
  async update(id: string, data: IUpdateProductImageRequest): Promise<IProductImageResponse> {
    // 检查图片是否存在
    const existingImage = await this.findById(id);
    if (!existingImage) {
      throw new Error('图片不存在');
    }

    const image = await prisma.productImage.update({
      where: { id },
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        }
      }
    });

    return this.formatImage(image);
  }

  /**
   * 删除图片
   */
  async delete(id: string): Promise<void> {
    // 检查图片是否存在
    const existingImage = await this.findById(id);
    if (!existingImage) {
      throw new Error('图片不存在');
    }

    await prisma.productImage.delete({
      where: { id }
    });
  }

  /**
   * 根据商品ID查找图片
   */
  async findByProductId(productId: string, type?: string): Promise<IProductImageResponse[]> {
    const whereCondition: any = { product_id: productId };
    if (type) {
      whereCondition.type = type;
    }

    const images = await prisma.productImage.findMany({
      where: whereCondition,
      orderBy: [
        { sort: 'asc' },
        { created_at: 'asc' }
      ],
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        }
      }
    });

    return images.map(image => this.formatImage(image));
  }

  /**
   * 分页查询图片
   */
  async findWithPagination(query: IProductImageQuery): Promise<IProductImagePageResponse> {
    const {
      page = 1,
      size = 10,
      product_id,
      type,
      keyword,
      sort_by = 'sort',
      sort_order = 'asc'
    } = query;

    const skip = (page - 1) * size;
    
    // 构建查询条件
    const whereCondition: any = {};
    
    if (product_id) {
      whereCondition.product_id = product_id;
    }
    
    if (type) {
      whereCondition.type = type;
    }
    
    if (keyword) {
      whereCondition.OR = [
        { url: { contains: keyword } },
        { product: { name: { contains: keyword } } }
      ];
    }

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // 查询数据
    const [images, total] = await Promise.all([
      prisma.productImage.findMany({
        where: whereCondition,
        skip,
        take: size,
        orderBy,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              main_image: true
            }
          }
        }
      }),
      prisma.productImage.count({ where: whereCondition })
    ]);

    const pages = Math.ceil(total / size);

    return {
      list: images.map(image => this.formatImage(image)),
      total,
      page,
      size,
      pages
    };
  }

  /**
   * 批量创建图片
   */
  async batchCreate(data: IBatchCreateProductImageRequest): Promise<IProductImageResponse[]> {
    // 验证商品存在
    await this.validateProduct(data.product_id);

    // 获取当前最大排序值
    const maxSort = await prisma.productImage.findFirst({
      where: { product_id: data.product_id },
      orderBy: { sort: 'desc' }
    });

    let currentSort = maxSort ? maxSort.sort + 1 : 0;

    // 准备批量创建数据
    const createData = data.images.map((image, index) => ({
      product_id: data.product_id,
      url: image.url,
      type: image.type || 'main',
      sort: image.sort !== undefined ? image.sort : currentSort + index
    }));

    // 批量创建
    await prisma.productImage.createMany({
      data: createData
    });

    // 查询创建的图片
    const createdImages = await prisma.productImage.findMany({
      where: {
        product_id: data.product_id,
        url: { in: data.images.map(img => img.url) }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        }
      }
    });

    return createdImages.map(image => this.formatImage(image));
  }

  /**
   * 批量更新排序
   */
  async batchUpdateSort(data: IBatchUpdateSortRequest): Promise<void> {
    // 验证商品存在
    await this.validateProduct(data.product_id);

    // 验证所有图片都属于该商品
    for (const item of data.sorts) {
      await this.validateImageOwnership(item.id, data.product_id);
    }

    // 批量更新排序
    const updatePromises = data.sorts.map(item =>
      prisma.productImage.update({
        where: { id: item.id },
        data: { sort: item.sort }
      })
    );

    await Promise.all(updatePromises);
  }

  /**
   * 批量删除图片
   */
  async batchDelete(ids: string[]): Promise<void> {
    // 验证所有图片存在
    const existingImages = await prisma.productImage.findMany({
      where: { id: { in: ids } }
    });

    if (existingImages.length !== ids.length) {
      throw new Error('部分图片不存在');
    }

    await prisma.productImage.deleteMany({
      where: { id: { in: ids } }
    });
  }

  /**
   * 设置主图
   */
  async setMainImage(productId: string, imageId: string): Promise<void> {
    // 验证商品和图片
    await this.validateProduct(productId);
    await this.validateImageOwnership(imageId, productId);

    // 将该商品的所有图片设置为非主图
    await prisma.productImage.updateMany({
      where: { 
        product_id: productId,
        type: 'main'
      },
      data: { type: 'detail' }
    });

    // 设置指定图片为主图
    await prisma.productImage.update({
      where: { id: imageId },
      data: { type: 'main', sort: 0 }
    });
  }

  /**
   * 根据类型获取图片
   */
  async getImagesByType(productId: string, type: 'main' | 'detail' | 'sku'): Promise<IProductImageResponse[]> {
    await this.validateProduct(productId);
    
    return this.findByProductId(productId, type);
  }

  /**
   * 重新排序图片
   */
  async reorderImages(productId: string, imageIds: string[]): Promise<void> {
    // 验证商品存在
    await this.validateProduct(productId);

    // 验证所有图片都属于该商品
    for (const imageId of imageIds) {
      await this.validateImageOwnership(imageId, productId);
    }

    // 重新设置排序
    const updatePromises = imageIds.map((imageId, index) =>
      prisma.productImage.update({
        where: { id: imageId },
        data: { sort: index }
      })
    );

    await Promise.all(updatePromises);
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<IProductImageStats> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      byType,
      recentUploads,
      productCount
    ] = await Promise.all([
      // 总图片数
      prisma.productImage.count(),
      
      // 按类型统计
      prisma.productImage.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      
      // 最近7天上传数
      prisma.productImage.count({
        where: {
          created_at: { gte: sevenDaysAgo }
        }
      }),
      
      // 有图片的商品数量
      prisma.product.count({
        where: {
          images: {
            some: {}
          }
        }
      })
    ]);

    // 格式化按类型统计数据
    const typeStats = { main: 0, detail: 0, sku: 0 };
    byType.forEach(item => {
      typeStats[item.type as keyof typeof typeStats] = item._count.type;
    });

    // 计算平均每个商品的图片数
    const avgImagesPerProduct = productCount > 0 ? Number((total / productCount).toFixed(2)) : 0;

    return {
      total,
      by_type: typeStats,
      recent_uploads: recentUploads,
      avg_images_per_product: avgImagesPerProduct
    };
  }
} 