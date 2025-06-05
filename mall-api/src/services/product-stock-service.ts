/**
 * 库存管理服务层
 * @author 刘白 & AI Assistant
 */

import { PrismaClient } from '@prisma/client';
import {
  IProductStockService,
  ICreateStockRequest,
  IUpdateStockRequest,
  IStockAdjustRequest,
  IBatchStockAdjustRequest,
  IStockQuery,
  IStockLogQuery,
  IStockResponse,
  IStockLogResponse,
  IStockPageResponse,
  IStockLogPageResponse,
  IStockStats,
  IStockAlert
} from '../types/product-stock';

const prisma = new PrismaClient();

export class ProductStockService implements IProductStockService {

  /**
   * 格式化库存数据
   */
  private formatStock(stock: any): IStockResponse {
    return {
      id: stock.id,
      product_id: stock.product_id,
      sku_id: stock.sku_id,
      warehouse_id: stock.warehouse_id,
      stock_type: stock.stock_type,
      quantity: stock.quantity,
      warning_line: stock.warning_line,
      updated_at: stock.updated_at,
      created_at: stock.created_at,
      product: stock.product ? {
        id: stock.product.id,
        name: stock.product.name,
        main_image: stock.product.main_image
      } : undefined,
      sku: stock.sku ? {
        id: stock.sku.id,
        sku_code: stock.sku.sku_code,
        price: parseFloat(stock.sku.price.toString()),
        attributes: stock.sku.attributes
      } : undefined,
      is_low_stock: stock.quantity <= stock.warning_line && stock.warning_line > 0
    };
  }

  /**
   * 格式化库存日志数据
   */
  private formatStockLog(log: any): IStockLogResponse {
    return {
      id: log.id,
      stock_id: log.stock_id,
      change: log.change,
      type: log.type,
      order_id: log.order_id,
      remark: log.remark,
      created_at: log.created_at,
      stock: log.stock ? {
        id: log.stock.id,
        product_id: log.stock.product_id,
        sku_id: log.stock.sku_id,
        quantity: log.stock.quantity
      } : undefined,
      product: log.stock?.product ? {
        id: log.stock.product.id,
        name: log.stock.product.name
      } : undefined,
      sku: log.stock?.sku ? {
        id: log.stock.sku.id,
        sku_code: log.stock.sku.sku_code
      } : undefined
    };
  }

  /**
   * 验证商品和SKU是否存在
   */
  private async validateProductAndSku(productId: string, skuId: string): Promise<void> {
    const [product, sku] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.productSku.findUnique({ where: { id: skuId } })
    ]);
    
    if (!product) {
      throw new Error('商品不存在');
    }
    
    if (!sku) {
      throw new Error('SKU不存在');
    }
    
    if (sku.product_id !== productId) {
      throw new Error('SKU不属于该商品');
    }
  }

  /**
   * 验证库存是否存在
   */
  private async validateStock(stockId: string): Promise<any> {
    const stock = await prisma.productStock.findUnique({
      where: { id: stockId }
    });
    
    if (!stock) {
      throw new Error('库存记录不存在');
    }
    
    return stock;
  }

  /**
   * 创建库存记录
   */
  async create(data: ICreateStockRequest): Promise<IStockResponse> {
    // 验证商品和SKU
    await this.validateProductAndSku(data.product_id, data.sku_id);

    // 检查是否已存在相同的库存记录
    const existingStock = await prisma.productStock.findFirst({
      where: {
        product_id: data.product_id,
        sku_id: data.sku_id,
        warehouse_id: data.warehouse_id || null,
        stock_type: data.stock_type || 'sellable'
      }
    });

    if (existingStock) {
      throw new Error('该SKU的库存记录已存在');
    }

    const stock = await prisma.productStock.create({
      data: {
        product_id: data.product_id,
        sku_id: data.sku_id,
        warehouse_id: data.warehouse_id,
        stock_type: data.stock_type || 'sellable',
        quantity: data.quantity || 0,
        warning_line: data.warning_line || 0
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        },
        sku: {
          select: {
            id: true,
            sku_code: true,
            price: true,
            attributes: true
          }
        }
      }
    });

    return this.formatStock(stock);
  }

  /**
   * 根据ID查找库存
   */
  async findById(id: string): Promise<IStockResponse | null> {
    const stock = await prisma.productStock.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        },
        sku: {
          select: {
            id: true,
            sku_code: true,
            price: true,
            attributes: true
          }
        }
      }
    });

    return stock ? this.formatStock(stock) : null;
  }

  /**
   * 更新库存信息
   */
  async update(id: string, data: IUpdateStockRequest): Promise<IStockResponse> {
    // 验证库存是否存在
    await this.validateStock(id);

    const stock = await prisma.productStock.update({
      where: { id },
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        },
        sku: {
          select: {
            id: true,
            sku_code: true,
            price: true,
            attributes: true
          }
        }
      }
    });

    return this.formatStock(stock);
  }

  /**
   * 删除库存记录
   */
  async delete(id: string): Promise<void> {
    // 验证库存是否存在
    await this.validateStock(id);

    // 检查是否有库存变动记录
    const hasLogs = await prisma.productStockLog.findFirst({
      where: { stock_id: id }
    });

    if (hasLogs) {
      throw new Error('存在库存变动记录，无法删除');
    }

    await prisma.productStock.delete({
      where: { id }
    });
  }

  /**
   * 分页查询库存
   */
  async findWithPagination(query: IStockQuery): Promise<IStockPageResponse> {
    const {
      page = 1,
      size = 10,
      product_id,
      sku_id,
      warehouse_id,
      stock_type,
      low_stock,
      keyword,
      sort_by = 'updated_at',
      sort_order = 'desc'
    } = query;

    const skip = (page - 1) * size;
    
    // 构建查询条件
    const whereCondition: any = {};
    
    if (product_id) {
      whereCondition.product_id = product_id;
    }
    
    if (sku_id) {
      whereCondition.sku_id = sku_id;
    }
    
    if (warehouse_id) {
      whereCondition.warehouse_id = warehouse_id;
    }
    
    if (stock_type) {
      whereCondition.stock_type = stock_type;
    }
    
    if (low_stock) {
      whereCondition.AND = [
        { quantity: { lte: prisma.productStock.fields.warning_line } },
        { warning_line: { gt: 0 } }
      ];
    }
    
    if (keyword) {
      whereCondition.OR = [
        { product: { name: { contains: keyword } } },
        { sku: { sku_code: { contains: keyword } } }
      ];
    }

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // 查询数据
    const [stocks, total] = await Promise.all([
      prisma.productStock.findMany({
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
          },
          sku: {
            select: {
              id: true,
              sku_code: true,
              price: true,
              attributes: true
            }
          }
        }
      }),
      prisma.productStock.count({ where: whereCondition })
    ]);

    const pages = Math.ceil(total / size);

    return {
      list: stocks.map(stock => this.formatStock(stock)),
      total,
      page,
      size,
      pages
    };
  }

  /**
   * 根据SKU查找库存
   */
  async findBySku(skuId: string): Promise<IStockResponse | null> {
    const stock = await prisma.productStock.findFirst({
      where: { 
        sku_id: skuId,
        stock_type: 'sellable'
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        },
        sku: {
          select: {
            id: true,
            sku_code: true,
            price: true,
            attributes: true
          }
        }
      }
    });

    return stock ? this.formatStock(stock) : null;
  }

  /**
   * 根据商品查找所有库存
   */
  async findByProduct(productId: string): Promise<IStockResponse[]> {
    const stocks = await prisma.productStock.findMany({
      where: { product_id: productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            main_image: true
          }
        },
        sku: {
          select: {
            id: true,
            sku_code: true,
            price: true,
            attributes: true
          }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    return stocks.map(stock => this.formatStock(stock));
  }

  // 其他方法将在下一部分实现...
  async adjustStock(data: IStockAdjustRequest): Promise<IStockLogResponse> {
    throw new Error('Method not implemented.');
  }

  async batchAdjustStock(data: IBatchStockAdjustRequest): Promise<IStockLogResponse[]> {
    throw new Error('Method not implemented.');
  }

  async lockStock(stockId: string, quantity: number, orderId?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async unlockStock(stockId: string, quantity: number, orderId?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getStockAlerts(): Promise<IStockAlert[]> {
    throw new Error('Method not implemented.');
  }

  async getLowStocks(warningLine?: number): Promise<IStockResponse[]> {
    throw new Error('Method not implemented.');
  }

  async getStockLogs(query: IStockLogQuery): Promise<IStockLogPageResponse> {
    throw new Error('Method not implemented.');
  }

  async getStockHistory(stockId: string): Promise<IStockLogResponse[]> {
    throw new Error('Method not implemented.');
  }

  async getStats(): Promise<IStockStats> {
    throw new Error('Method not implemented.');
  }

  async checkStockAvailability(skuId: string, quantity: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async reserveStock(skuId: string, quantity: number, orderId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async releaseStock(skuId: string, quantity: number, orderId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
} 