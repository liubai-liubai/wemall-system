/**
 * 库存管理服务层
 * @author 刘白 & AI Assistant
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
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
  IStockAlert,
  StockLogType
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
                      type: log.type as StockLogType,
        order_id: log.order_id || undefined,
        remark: log.remark || undefined,
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

  /**
   * 库存调整
   */
  async adjustStock(data: IStockAdjustRequest): Promise<IStockLogResponse> {
    // 开启事务
    return await prisma.$transaction(async (tx) => {
      // 检查库存是否存在
      const stock = await tx.productStock.findUnique({
        where: { id: data.stock_id },
        include: {
          product: {
            select: { id: true, name: true }
          },
          sku: {
            select: { id: true, sku_code: true }
          }
        }
      });

      if (!stock) {
        throw new Error('库存记录不存在');
      }

      // 计算新的库存数量
      const newQuantity = stock.quantity + data.change;
      
      // 检查库存不能为负数
      if (newQuantity < 0) {
        throw new Error(`库存不足，当前库存: ${stock.quantity}，调整数量: ${data.change}`);
      }

      // 更新库存数量
      await tx.productStock.update({
        where: { id: data.stock_id },
        data: { 
          quantity: newQuantity,
          updated_at: new Date()
        }
      });

      // 创建库存日志
      const log = await tx.productStockLog.create({
        data: {
          id: crypto.randomUUID(),
          stock_id: data.stock_id,
          change: data.change,
          type: data.type,
          order_id: data.order_id,
          remark: data.remark,
          created_at: new Date()
        }
      });

      // 格式化响应
      return {
        id: log.id,
        stock_id: log.stock_id,
        change: log.change,
        type: log.type as StockLogType,
        order_id: log.order_id || undefined,
        remark: log.remark || undefined,
        created_at: log.created_at,
        stock: {
          id: stock.id,
          product_id: stock.product_id,
          sku_id: stock.sku_id,
          quantity: newQuantity
        },
        product: stock.product ? {
          id: stock.product.id,
          name: stock.product.name
        } : undefined,
        sku: stock.sku ? {
          id: stock.sku.id,
          sku_code: stock.sku.sku_code
        } : undefined
      };
    });
  }

  /**
   * 批量库存调整
   */
  async batchAdjustStock(data: IBatchStockAdjustRequest): Promise<IStockLogResponse[]> {
    // 验证批量调整数据
    const stockIds = data.adjustments.map(adj => adj.stock_id);
    const uniqueStockIds = [...new Set(stockIds)];
    
    if (stockIds.length !== uniqueStockIds.length) {
      throw new Error('批量调整中存在重复的库存ID');
    }

    // 开启事务
    return await prisma.$transaction(async (tx) => {
      const logs: IStockLogResponse[] = [];
      
      for (const adjustment of data.adjustments) {
        // 检查库存是否存在
        const stock = await tx.productStock.findUnique({
          where: { id: adjustment.stock_id },
          include: {
            product: {
              select: { id: true, name: true }
            },
            sku: {
              select: { id: true, sku_code: true }
            }
          }
        });

        if (!stock) {
          throw new Error(`库存记录不存在: ${adjustment.stock_id}`);
        }

        // 计算新的库存数量
        const newQuantity = stock.quantity + adjustment.change;
        
        // 检查库存不能为负数
        if (newQuantity < 0) {
          throw new Error(`库存不足 (${stock.sku?.sku_code || adjustment.stock_id})，当前库存: ${stock.quantity}，调整数量: ${adjustment.change}`);
        }

        // 更新库存数量
        await tx.productStock.update({
          where: { id: adjustment.stock_id },
          data: { 
            quantity: newQuantity,
            updated_at: new Date()
          }
        });

        // 创建库存日志
        const log = await tx.productStockLog.create({
          data: {
            id: crypto.randomUUID(),
            stock_id: adjustment.stock_id,
            change: adjustment.change,
            type: adjustment.type,
            order_id: adjustment.order_id,
            remark: adjustment.remark,
            created_at: new Date()
          }
        });

        // 添加到结果列表
        logs.push({
          id: log.id,
          stock_id: log.stock_id,
          change: log.change,
          type: log.type as StockLogType,
          order_id: log.order_id || undefined,
          remark: log.remark || undefined,
          created_at: log.created_at,
          stock: {
            id: stock.id,
            product_id: stock.product_id,
            sku_id: stock.sku_id,
            quantity: newQuantity
          },
          product: stock.product ? {
            id: stock.product.id,
            name: stock.product.name
          } : undefined,
          sku: stock.sku ? {
            id: stock.sku.id,
            sku_code: stock.sku.sku_code
          } : undefined
        });
      }

      return logs;
    });
  }

  /**
   * 库存锁定
   */
  async lockStock(stockId: string, quantity: number, orderId?: string): Promise<void> {
    if (quantity <= 0) {
      throw new Error('锁定数量必须大于0');
    }

    // 开启事务
    return await prisma.$transaction(async (tx) => {
      // 查找可销售库存
      const sellableStock = await tx.productStock.findFirst({
        where: { 
          id: stockId,
          stock_type: 'sellable'
        }
      });

      if (!sellableStock) {
        throw new Error('可销售库存记录不存在');
      }

      // 检查库存是否足够
      if (sellableStock.quantity < quantity) {
        throw new Error(`可销售库存不足，当前库存: ${sellableStock.quantity}，需要锁定: ${quantity}`);
      }

      // 查找或创建对应的锁定库存记录
      let lockedStock = await tx.productStock.findFirst({
        where: {
          product_id: sellableStock.product_id,
          sku_id: sellableStock.sku_id,
          warehouse_id: sellableStock.warehouse_id,
          stock_type: 'locked'
        }
      });

      if (!lockedStock) {
        // 创建锁定库存记录
        lockedStock = await tx.productStock.create({
          data: {
            id: crypto.randomUUID(),
            product_id: sellableStock.product_id,
            sku_id: sellableStock.sku_id,
            warehouse_id: sellableStock.warehouse_id,
            stock_type: 'locked',
            quantity: 0,
            warning_line: 0,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // 减少可销售库存
      await tx.productStock.update({
        where: { id: sellableStock.id },
        data: { 
          quantity: sellableStock.quantity - quantity,
          updated_at: new Date()
        }
      });

      // 增加锁定库存
      await tx.productStock.update({
        where: { id: lockedStock.id },
        data: { 
          quantity: lockedStock.quantity + quantity,
          updated_at: new Date()
        }
      });

      // 记录库存变动日志 - 可销售库存减少
      await tx.productStockLog.create({
        data: {
          id: crypto.randomUUID(),
          stock_id: sellableStock.id,
          change: -quantity,
          type: 'lock',
          order_id: orderId,
          remark: `库存锁定${quantity}件${orderId ? ` (订单: ${orderId})` : ''}`,
          created_at: new Date()
        }
      });

      // 记录库存变动日志 - 锁定库存增加
      await tx.productStockLog.create({
        data: {
          id: crypto.randomUUID(),
          stock_id: lockedStock.id,
          change: quantity,
          type: 'lock',
          order_id: orderId,
          remark: `库存锁定${quantity}件${orderId ? ` (订单: ${orderId})` : ''}`,
          created_at: new Date()
        }
      });
    });
  }

  /**
   * 库存解锁
   */
  async unlockStock(stockId: string, quantity: number, orderId?: string): Promise<void> {
    if (quantity <= 0) {
      throw new Error('解锁数量必须大于0');
    }

    // 开启事务
    return await prisma.$transaction(async (tx) => {
      // 查找锁定库存记录
      const lockedStock = await tx.productStock.findFirst({
        where: { 
          id: stockId,
          stock_type: 'locked'
        }
      });

      if (!lockedStock) {
        throw new Error('锁定库存记录不存在');
      }

      // 检查锁定库存是否足够
      if (lockedStock.quantity < quantity) {
        throw new Error(`锁定库存不足，当前锁定库存: ${lockedStock.quantity}，需要解锁: ${quantity}`);
      }

      // 查找对应的可销售库存记录
      let sellableStock = await tx.productStock.findFirst({
        where: {
          product_id: lockedStock.product_id,
          sku_id: lockedStock.sku_id,
          warehouse_id: lockedStock.warehouse_id,
          stock_type: 'sellable'
        }
      });

      if (!sellableStock) {
        // 创建可销售库存记录
        sellableStock = await tx.productStock.create({
          data: {
            id: crypto.randomUUID(),
            product_id: lockedStock.product_id,
            sku_id: lockedStock.sku_id,
            warehouse_id: lockedStock.warehouse_id,
            stock_type: 'sellable',
            quantity: 0,
            warning_line: 0,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // 减少锁定库存
      await tx.productStock.update({
        where: { id: lockedStock.id },
        data: { 
          quantity: lockedStock.quantity - quantity,
          updated_at: new Date()
        }
      });

      // 增加可销售库存
      await tx.productStock.update({
        where: { id: sellableStock.id },
        data: { 
          quantity: sellableStock.quantity + quantity,
          updated_at: new Date()
        }
      });

      // 记录库存变动日志 - 锁定库存减少
      await tx.productStockLog.create({
        data: {
          id: crypto.randomUUID(),
          stock_id: lockedStock.id,
          change: -quantity,
          type: 'unlock',
          order_id: orderId,
          remark: `库存解锁${quantity}件${orderId ? ` (订单: ${orderId})` : ''}`,
          created_at: new Date()
        }
      });

      // 记录库存变动日志 - 可销售库存增加
      await tx.productStockLog.create({
        data: {
          id: crypto.randomUUID(),
          stock_id: sellableStock.id,
          change: quantity,
          type: 'unlock',
          order_id: orderId,
          remark: `库存解锁${quantity}件${orderId ? ` (订单: ${orderId})` : ''}`,
          created_at: new Date()
        }
      });
    });
  }

  /**
   * 获取库存预警信息
   */
  async getStockAlerts(): Promise<IStockAlert[]> {
    const lowStocks = await prisma.productStock.findMany({
      where: {
        stock_type: 'sellable',
        AND: [
          { quantity: { lte: prisma.productStock.fields.warning_line } },
          { warning_line: { gt: 0 } }
        ]
      },
      include: {
        product: {
          select: { id: true, name: true }
        },
        sku: {
          select: { id: true, sku_code: true }
        }
      },
      orderBy: [
        { quantity: 'asc' },
        { warning_line: 'desc' }
      ]
    });

    return lowStocks.map(stock => ({
      id: stock.id,
      product_id: stock.product_id,
      product_name: stock.product?.name || '未知商品',
      sku_id: stock.sku_id,
      sku_name: stock.sku?.sku_code || '未知SKU',
      current_quantity: stock.quantity,
      warning_line: stock.warning_line,
      shortage: Math.max(0, stock.warning_line - stock.quantity),
      alert_level: stock.quantity === 0 ? 'critical' : 'warning'
    }));
  }

  /**
   * 获取低库存列表
   */
  async getLowStocks(warningLine?: number): Promise<IStockResponse[]> {
    const whereCondition: any = {
      stock_type: 'sellable'
    };

    if (warningLine !== undefined) {
      // 使用指定的预警线
      whereCondition.quantity = { lte: warningLine };
    } else {
      // 使用各自设置的预警线
      whereCondition.AND = [
        { quantity: { lte: prisma.productStock.fields.warning_line } },
        { warning_line: { gt: 0 } }
      ];
    }

    const stocks = await prisma.productStock.findMany({
      where: whereCondition,
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
      orderBy: [
        { quantity: 'asc' },
        { updated_at: 'desc' }
      ]
    });

    return stocks.map(stock => this.formatStock(stock));
  }

  /**
   * 分页查询库存日志
   */
  async getStockLogs(query: IStockLogQuery): Promise<IStockLogPageResponse> {
    const {
      page = 1,
      size = 10,
      stock_id,
      product_id,
      sku_id,
      type,
      order_id,
      start_date,
      end_date,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = query;

    const skip = (page - 1) * size;
    
    // 构建查询条件
    const whereCondition: any = {};
    
    if (stock_id) {
      whereCondition.stock_id = stock_id;
    }
    
    if (type) {
      whereCondition.type = type;
    }
    
    if (order_id) {
      whereCondition.order_id = order_id;
    }

    // 日期范围查询
    if (start_date || end_date) {
      whereCondition.created_at = {};
      if (start_date) {
        whereCondition.created_at.gte = new Date(start_date);
      }
      if (end_date) {
        whereCondition.created_at.lte = new Date(end_date);
      }
    }

    // 通过关联表筛选商品或SKU
    if (product_id || sku_id) {
      whereCondition.stock = {};
      if (product_id) {
        whereCondition.stock.product_id = product_id;
      }
      if (sku_id) {
        whereCondition.stock.sku_id = sku_id;
      }
    }

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // 查询数据
    const [logs, total] = await Promise.all([
      prisma.productStockLog.findMany({
        where: whereCondition,
        skip,
        take: size,
        orderBy,
        include: {
          stock: {
            select: {
              id: true,
              product_id: true,
              sku_id: true,
              quantity: true,
              product: {
                select: { id: true, name: true }
              },
              sku: {
                select: { id: true, sku_code: true }
              }
            }
          }
        }
      }),
      prisma.productStockLog.count({ where: whereCondition })
    ]);

    const pages = Math.ceil(total / size);

    return {
      list: logs.map(log => this.formatStockLog(log)),
      total,
      page,
      size,
      pages
    };
  }

  /**
   * 获取指定库存的历史记录
   */
  async getStockHistory(stockId: string): Promise<IStockLogResponse[]> {
    const logs = await prisma.productStockLog.findMany({
      where: { stock_id: stockId },
      include: {
        stock: {
          select: {
            id: true,
            product_id: true,
            sku_id: true,
            quantity: true,
            product: {
              select: { id: true, name: true }
            },
            sku: {
              select: { id: true, sku_code: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return logs.map(log => this.formatStockLog(log));
  }

  /**
   * 获取库存统计信息
   */
  async getStats(): Promise<IStockStats> {
    // 并行查询各种统计数据
    const [
      totalStocks,
      stocksByType,
      lowStockCount,
      outOfStockCount,
      recentAdjustments,
      topProducts
    ] = await Promise.all([
      // 总库存记录数
      prisma.productStock.count(),
      
      // 按类型统计库存数量
      prisma.productStock.groupBy({
        by: ['stock_type'],
        _sum: { quantity: true },
        _count: true
      }),
      
      // 低库存数量（使用预警线）
      prisma.productStock.count({
        where: {
          stock_type: 'sellable',
          AND: [
            { quantity: { lte: prisma.productStock.fields.warning_line } },
            { warning_line: { gt: 0 } }
          ]
        }
      }),
      
      // 缺货数量
      prisma.productStock.count({
        where: {
          stock_type: 'sellable',
          quantity: 0
        }
      }),
      
      // 最近7天库存调整次数
      prisma.productStockLog.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // 库存最多的前5个商品
      prisma.productStock.findMany({
        where: { stock_type: 'sellable' },
        include: {
          product: {
            select: { id: true, name: true }
          }
        },
        orderBy: { quantity: 'desc' },
        take: 5
      })
    ]);

    // 计算总库存数量
    const totalQuantity = stocksByType.reduce((sum, type) => 
      sum + (type._sum.quantity || 0), 0);

    // 按库存类型统计
    const byStockType = {
      sellable: 0,
      locked: 0,
      warning: 0
    };

    stocksByType.forEach(type => {
      if (type.stock_type && type._sum.quantity) {
        byStockType[type.stock_type as keyof typeof byStockType] = type._sum.quantity;
      }
    });

    // 预警数量（低库存 + 缺货）
    const warningCount = lowStockCount + outOfStockCount;

    return {
      total_stocks: totalStocks,
      total_quantity: totalQuantity,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      warning_count: warningCount,
      by_stock_type: byStockType,
      recent_adjustments: recentAdjustments,
      top_products: topProducts.map(stock => ({
        product_id: stock.product_id,
        product_name: stock.product?.name || '未知商品',
        total_quantity: stock.quantity
      }))
    };
  }

  /**
   * 检查库存可用性
   */
  async checkStockAvailability(skuId: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      throw new Error('检查数量必须大于0');
    }

    // 查找该SKU的可销售库存
    const sellableStock = await prisma.productStock.findFirst({
      where: {
        sku_id: skuId,
        stock_type: 'sellable'
      }
    });

    // 如果没有库存记录或库存不足，返回false
    if (!sellableStock || sellableStock.quantity < quantity) {
      return false;
    }

    return true;
  }

  /**
   * 库存预留（下单时使用）
   */
  async reserveStock(skuId: string, quantity: number, orderId: string): Promise<void> {
    if (quantity <= 0) {
      throw new Error('预留数量必须大于0');
    }

    // 开启事务
    return await prisma.$transaction(async (tx) => {
      // 查找可销售库存
      const sellableStock = await tx.productStock.findFirst({
        where: {
          sku_id: skuId,
          stock_type: 'sellable'
        },
        include: {
          product: { select: { id: true, name: true } },
          sku: { select: { id: true, sku_code: true } }
        }
      });

      if (!sellableStock) {
        throw new Error('该SKU暂无可销售库存');
      }

      // 检查库存是否足够
      if (sellableStock.quantity < quantity) {
        throw new Error(`库存不足，当前可用库存: ${sellableStock.quantity}，需要预留: ${quantity}`);
      }

      // 检查订单是否已经预留过库存
      const existingLog = await tx.productStockLog.findFirst({
        where: {
          order_id: orderId,
          type: 'lock',
          stock_id: sellableStock.id
        }
      });

      if (existingLog) {
        throw new Error(`订单 ${orderId} 已经预留过库存`);
      }

      // 查找或创建锁定库存记录
      let lockedStock = await tx.productStock.findFirst({
        where: {
          product_id: sellableStock.product_id,
          sku_id: sellableStock.sku_id,
          warehouse_id: sellableStock.warehouse_id,
          stock_type: 'locked'
        }
      });

      if (!lockedStock) {
        // 创建锁定库存记录
        lockedStock = await tx.productStock.create({
          data: {
            id: crypto.randomUUID(),
            product_id: sellableStock.product_id,
            sku_id: sellableStock.sku_id,
            warehouse_id: sellableStock.warehouse_id,
            stock_type: 'locked',
            quantity: 0,
            warning_line: 0,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // 减少可销售库存
      await tx.productStock.update({
        where: { id: sellableStock.id },
        data: { 
          quantity: sellableStock.quantity - quantity,
          updated_at: new Date()
        }
      });

      // 增加锁定库存
      await tx.productStock.update({
        where: { id: lockedStock.id },
        data: { 
          quantity: lockedStock.quantity + quantity,
          updated_at: new Date()
        }
      });

      // 记录库存日志 - 可销售库存减少
      await tx.productStockLog.create({
        data: {
          id: crypto.randomUUID(),
          stock_id: sellableStock.id,
          change: -quantity,
          type: 'lock',
          order_id: orderId,
          remark: `订单预留库存${quantity}件 (${sellableStock.sku?.sku_code})`,
          created_at: new Date()
        }
      });

      // 记录库存日志 - 锁定库存增加
      await tx.productStockLog.create({
        data: {
          id: crypto.randomUUID(),
          stock_id: lockedStock.id,
          change: quantity,
          type: 'lock',
          order_id: orderId,
          remark: `订单预留库存${quantity}件 (${sellableStock.sku?.sku_code})`,
          created_at: new Date()
        }
      });
    });
  }

  /**
   * 库存释放（取消订单时使用）
   */
  async releaseStock(skuId: string, quantity: number, orderId: string): Promise<void> {
    if (quantity <= 0) {
      throw new Error('释放数量必须大于0');
    }

    // 开启事务
    return await prisma.$transaction(async (tx) => {
      // 查找锁定库存记录
      const lockedStock = await tx.productStock.findFirst({
        where: {
          sku_id: skuId,
          stock_type: 'locked'
        },
        include: {
          product: { select: { id: true, name: true } },
          sku: { select: { id: true, sku_code: true } }
        }
      });

      if (!lockedStock) {
        throw new Error('该SKU暂无锁定库存记录');
      }

      // 验证订单是否确实预留过库存
      const lockLog = await tx.productStockLog.findFirst({
        where: {
          order_id: orderId,
          type: 'lock',
          change: quantity,
          stock_id: lockedStock.id
        }
      });

      if (!lockLog) {
        throw new Error(`订单 ${orderId} 未找到对应的库存预留记录`);
      }

      // 检查锁定库存是否足够
      if (lockedStock.quantity < quantity) {
        throw new Error(`锁定库存不足，当前锁定库存: ${lockedStock.quantity}，需要释放: ${quantity}`);
      }

      // 查找或创建对应的可销售库存记录
      let sellableStock = await tx.productStock.findFirst({
        where: {
          product_id: lockedStock.product_id,
          sku_id: lockedStock.sku_id,
          warehouse_id: lockedStock.warehouse_id,
          stock_type: 'sellable'
        }
      });

      if (!sellableStock) {
        // 创建可销售库存记录
        sellableStock = await tx.productStock.create({
          data: {
            id: crypto.randomUUID(),
            product_id: lockedStock.product_id,
            sku_id: lockedStock.sku_id,
            warehouse_id: lockedStock.warehouse_id,
            stock_type: 'sellable',
            quantity: 0,
            warning_line: 0,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // 减少锁定库存
      await tx.productStock.update({
        where: { id: lockedStock.id },
        data: { 
          quantity: lockedStock.quantity - quantity,
          updated_at: new Date()
        }
      });

      // 增加可销售库存
      await tx.productStock.update({
        where: { id: sellableStock.id },
        data: { 
          quantity: sellableStock.quantity + quantity,
          updated_at: new Date()
        }
      });

      // 记录库存日志 - 锁定库存减少
      await tx.productStockLog.create({
        data: {
          id: crypto.randomUUID(),
          stock_id: lockedStock.id,
          change: -quantity,
          type: 'unlock',
          order_id: orderId,
          remark: `订单释放库存${quantity}件 (${lockedStock.sku?.sku_code})`,
          created_at: new Date()
        }
      });

      // 记录库存日志 - 可销售库存增加
      await tx.productStockLog.create({
        data: {
          id: crypto.randomUUID(),
          stock_id: sellableStock.id,
          change: quantity,
          type: 'unlock',
          order_id: orderId,
          remark: `订单释放库存${quantity}件 (${lockedStock.sku?.sku_code})`,
          created_at: new Date()
        }
      });
    });
  }
} 