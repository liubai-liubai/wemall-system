/**
 * 商品管理业务服务层
 * 负责商品相关的核心业务逻辑处理
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { 
  IProduct, 
  IProductCreateParams, 
  IProductUpdateParams, 
  IProductQueryParams,
  IProductDetail,
  CategoryStatus
} from '../types/product';
import { PageData } from '../types/common';

const prisma = new PrismaClient();

export class ProductService {
  /**
   * 创建商品
   * @param params 商品创建参数
   * @returns 创建的商品信息
   */
  async createProduct(params: IProductCreateParams): Promise<IProduct> {
    try {
      // 验证分类是否存在
      const category = await prisma.productCategory.findUnique({
        where: { id: params.categoryId }
      });

      if (!category) {
        throw new Error('商品分类不存在');
      }

      // 创建商品
      const product = await prisma.product.create({
        data: {
          name: params.name,
          category_id: params.categoryId,
          brand: params.brand || null,
          description: params.description || null,
          main_image: params.mainImage || null,
          price: params.price,
          market_price: params.marketPrice,
          status: params.status ?? 1,
          stock: params.stock ?? 0,
          sort: params.sort ?? 0,
        }
      });

      return {
        id: product.id,
        name: product.name,
        categoryId: product.category_id,
        brand: product.brand || undefined,
        description: product.description || undefined,
        mainImage: product.main_image || undefined,
        price: product.price,
        marketPrice: product.market_price,
        status: product.status,
        stock: product.stock,
        sales: product.sales,
        sort: product.sort,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    } catch (error) {
      throw new Error(`创建商品失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取商品详情
   * @param id 商品ID
   * @returns 商品详情信息
   */
  async getProductById(id: string): Promise<IProductDetail | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          skus: true,
          attributes: true,
          images: true,
          product_stocks: {
            include: {
              sku: true
            }
          }
        }
      });

      if (!product) {
        return null;
      }

      return {
        id: product.id,
        name: product.name,
        categoryId: product.category_id,
        brand: product.brand || undefined,
        description: product.description || undefined,
        mainImage: product.main_image || undefined,
        price: product.price,
        marketPrice: product.market_price,
        status: product.status,
        stock: product.stock,
        sales: product.sales,
        sort: product.sort,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          parentId: product.category.parent_id || undefined,
          level: product.category.level,
          sort: product.category.sort,
          status: product.category.status as CategoryStatus,
          createdAt: product.category.created_at,
          updatedAt: product.category.updated_at
        } : undefined,
        skus: product.skus.map(sku => ({
          id: sku.id,
          productId: sku.product_id,
          skuCode: sku.sku_code,
          price: sku.price,
          stock: sku.stock,
          attributes: sku.attributes as Record<string, unknown>,
          status: sku.status,
          createdAt: sku.created_at,
          updatedAt: sku.updated_at
        })),
        attributes: product.attributes.map(attr => ({
          id: attr.id,
          productId: attr.product_id,
          name: attr.name,
          value: attr.value,
          createdAt: attr.created_at
        })),
        images: product.images.map(img => ({
          id: img.id,
          productId: img.product_id,
          url: img.url,
          type: img.type,
          sort: img.sort,
          createdAt: img.created_at
        })),
        stocks: product.product_stocks.map(stock => ({
          id: stock.id,
          productId: stock.product_id,
          skuId: stock.sku_id,
          warehouseId: stock.warehouse_id || undefined,
          stockType: stock.stock_type,
          quantity: stock.quantity,
          warningLine: stock.warning_line,
          createdAt: stock.created_at,
          updatedAt: stock.updated_at
        }))
      };
    } catch (error) {
      throw new Error(`获取商品详情失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新商品信息
   * @param id 商品ID
   * @param params 更新参数
   * @returns 更新后的商品信息
   */
  async updateProduct(id: string, params: IProductUpdateParams): Promise<IProduct> {
    try {
      // 检查商品是否存在
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      });

      if (!existingProduct) {
        throw new Error('商品不存在');
      }

      // 如果更新分类，验证分类是否存在
      if (params.categoryId) {
        const category = await prisma.productCategory.findUnique({
          where: { id: params.categoryId }
        });

        if (!category) {
          throw new Error('商品分类不存在');
        }
      }

      // 更新商品
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(params.name && { name: params.name }),
          ...(params.categoryId && { category_id: params.categoryId }),
          ...(params.brand !== undefined && { brand: params.brand || null }),
          ...(params.description !== undefined && { description: params.description || null }),
          ...(params.mainImage !== undefined && { main_image: params.mainImage || null }),
          ...(params.price && { price: params.price }),
          ...(params.marketPrice && { market_price: params.marketPrice }),
          ...(params.status !== undefined && { status: params.status }),
          ...(params.stock !== undefined && { stock: params.stock }),
          ...(params.sort !== undefined && { sort: params.sort }),
        }
      });

      return {
        id: product.id,
        name: product.name,
        categoryId: product.category_id,
        brand: product.brand || undefined,
        description: product.description || undefined,
        mainImage: product.main_image || undefined,
        price: product.price,
        marketPrice: product.market_price,
        status: product.status,
        stock: product.stock,
        sales: product.sales,
        sort: product.sort,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    } catch (error) {
      throw new Error(`更新商品失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除商品
   * @param id 商品ID
   * @returns 是否删除成功
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      // 检查商品是否存在
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      });

      if (!existingProduct) {
        throw new Error('商品不存在');
      }

      // 使用事务删除商品及相关数据
      await prisma.$transaction(async (tx) => {
        // 删除库存记录
        await tx.productStock.deleteMany({
          where: { product_id: id }
        });

        // 删除商品图片
        await tx.productImage.deleteMany({
          where: { product_id: id }
        });

        // 删除商品属性
        await tx.productAttribute.deleteMany({
          where: { product_id: id }
        });

        // 删除SKU
        await tx.productSku.deleteMany({
          where: { product_id: id }
        });

        // 删除商品
        await tx.product.delete({
          where: { id }
        });
      });

      return true;
    } catch (error) {
      throw new Error(`删除商品失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 分页查询商品列表
   * @param params 查询参数
   * @returns 分页商品列表
   */
  async getProductList(params: IProductQueryParams): Promise<PageData<IProduct>> {
    try {
      const {
        page = 1,
        size = 10,
        name,
        categoryId,
        brand,
        status,
        minPrice,
        maxPrice,
        sort = 'createdAt',
        order = 'desc'
      } = params;

      // 构建查询条件
      const where: any = {};

      if (name) {
        where.name = {
          contains: name
        };
      }

      if (categoryId) {
        where.category_id = categoryId;
      }

      if (brand) {
        where.brand = {
          contains: brand
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

      // 排序字段映射
      const sortField = sort === 'createdAt' ? 'created_at' : 
                       sort === 'updatedAt' ? 'updated_at' : sort;

      // 查询总数
      const total = await prisma.product.count({ where });

      // 分页查询
      const products = await prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          [sortField]: order
        },
        skip: (page - 1) * size,
        take: size
      });

      const list = products.map(product => ({
        id: product.id,
        name: product.name,
        categoryId: product.category_id,
        brand: product.brand || undefined,
        description: product.description || undefined,
        mainImage: product.main_image || undefined,
        price: product.price,
        marketPrice: product.market_price,
        status: product.status,
        stock: product.stock,
        sales: product.sales,
        sort: product.sort,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));

      return {
        list,
        total,
        page,
        size,
        pages: Math.ceil(total / size)
      };
    } catch (error) {
      throw new Error(`获取商品列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量操作商品
   * @param ids 商品ID列表
   * @param action 操作类型
   * @returns 操作结果
   */
  async batchOperateProducts(ids: string[], action: 'delete' | 'online' | 'offline'): Promise<{ success: number; failed: number }> {
    try {
      let success = 0;
      let failed = 0;

      for (const id of ids) {
        try {
          if (action === 'delete') {
            await this.deleteProduct(id);
          } else if (action === 'online') {
            await this.updateProduct(id, { status: 1 });
          } else if (action === 'offline') {
            await this.updateProduct(id, { status: 0 });
          }
          success++;
        } catch {
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      throw new Error(`批量操作商品失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取商品统计信息
   * @returns 商品统计数据
   */
  async getProductStats(): Promise<{
    total: number;
    online: number;
    offline: number;
    lowStock: number;
  }> {
    try {
      const [total, online, offline, lowStock] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { status: 1 } }),
        prisma.product.count({ where: { status: 0 } }),
        prisma.product.count({ where: { stock: { lte: 10 } } })
      ]);

      return {
        total,
        online,
        offline,
        lowStock
      };
    } catch (error) {
      throw new Error(`获取商品统计失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
} 