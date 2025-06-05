/**
 * 库存管理验证模式
 * @author 刘白 & AI Assistant
 */

import Joi from 'joi';

// 库存类型枚举
const STOCK_TYPES = ['sellable', 'locked', 'warning'];

// 库存变动类型枚举
const STOCK_LOG_TYPES = ['in', 'out', 'lock', 'unlock', 'adjust'];

// 创建库存验证
export const createStockSchema = Joi.object({
  product_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '商品ID不能为空',
      'string.guid': '商品ID格式不正确',
      'any.required': '商品ID为必填项'
    }),
  
  sku_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'SKU ID不能为空',
      'string.guid': 'SKU ID格式不正确',
      'any.required': 'SKU ID为必填项'
    }),
  
  warehouse_id: Joi.string()
    .uuid()
    .allow(null)
    .messages({
      'string.guid': '仓库ID格式不正确'
    }),
  
  stock_type: Joi.string()
    .valid(...STOCK_TYPES)
    .default('sellable')
    .messages({
      'any.only': `库存类型必须是以下值之一: ${STOCK_TYPES.join(', ')}`
    }),
  
  quantity: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .default(0)
    .messages({
      'number.base': '库存数量必须是数字',
      'number.integer': '库存数量必须是整数',
      'number.min': '库存数量不能小于0',
      'number.max': '库存数量不能大于999999'
    }),
  
  warning_line: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .default(0)
    .messages({
      'number.base': '预警线必须是数字',
      'number.integer': '预警线必须是整数',
      'number.min': '预警线不能小于0',
      'number.max': '预警线不能大于999999'
    })
});

// 更新库存验证
export const updateStockSchema = Joi.object({
  quantity: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .messages({
      'number.base': '库存数量必须是数字',
      'number.integer': '库存数量必须是整数',
      'number.min': '库存数量不能小于0',
      'number.max': '库存数量不能大于999999'
    }),
  
  warning_line: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .messages({
      'number.base': '预警线必须是数字',
      'number.integer': '预警线必须是整数',
      'number.min': '预警线不能小于0',
      'number.max': '预警线不能大于999999'
    }),
  
  stock_type: Joi.string()
    .valid(...STOCK_TYPES)
    .messages({
      'any.only': `库存类型必须是以下值之一: ${STOCK_TYPES.join(', ')}`
    })
}).min(1).messages({
  'object.min': '至少需要提供一个要更新的字段'
});

// 库存调整验证
export const stockAdjustSchema = Joi.object({
  stock_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '库存ID不能为空',
      'string.guid': '库存ID格式不正确',
      'any.required': '库存ID为必填项'
    }),
  
  change: Joi.number()
    .integer()
    .min(-999999)
    .max(999999)
    .required()
    .messages({
      'number.base': '变动数量必须是数字',
      'number.integer': '变动数量必须是整数',
      'number.min': '变动数量不能小于-999999',
      'number.max': '变动数量不能大于999999',
      'any.required': '变动数量为必填项'
    }),
  
  type: Joi.string()
    .valid(...STOCK_LOG_TYPES)
    .required()
    .messages({
      'any.only': `变动类型必须是以下值之一: ${STOCK_LOG_TYPES.join(', ')}`,
      'any.required': '变动类型为必填项'
    }),
  
  order_id: Joi.string()
    .uuid()
    .allow(null)
    .messages({
      'string.guid': '订单ID格式不正确'
    }),
  
  remark: Joi.string()
    .max(255)
    .allow('')
    .messages({
      'string.max': '备注长度不能超过255个字符'
    })
});

// 批量库存调整验证
export const batchStockAdjustSchema = Joi.object({
  adjustments: Joi.array()
    .items(stockAdjustSchema)
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': '至少需要一项调整',
      'array.max': '一次最多只能调整50项',
      'any.required': '调整列表为必填项'
    })
});

// 库存查询验证
export const stockQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码不能小于1'
    }),
  
  size: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量不能小于1',
      'number.max': '每页数量不能大于100'
    }),
  
  product_id: Joi.string()
    .uuid()
    .messages({
      'string.guid': '商品ID格式不正确'
    }),
  
  sku_id: Joi.string()
    .uuid()
    .messages({
      'string.guid': 'SKU ID格式不正确'
    }),
  
  warehouse_id: Joi.string()
    .uuid()
    .messages({
      'string.guid': '仓库ID格式不正确'
    }),
  
  stock_type: Joi.string()
    .valid(...STOCK_TYPES)
    .messages({
      'any.only': `库存类型必须是以下值之一: ${STOCK_TYPES.join(', ')}`
    }),
  
  low_stock: Joi.boolean()
    .messages({
      'boolean.base': '低库存筛选必须是布尔值'
    }),
  
  keyword: Joi.string()
    .max(50)
    .messages({
      'string.max': '关键词长度不能超过50个字符'
    }),
  
  sort_by: Joi.string()
    .valid('quantity', 'warning_line', 'updated_at', 'created_at')
    .default('updated_at')
    .messages({
      'any.only': '排序字段必须是: quantity, warning_line, updated_at, created_at'
    }),
  
  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': '排序方向必须是: asc, desc'
    })
});

// 库存日志查询验证
export const stockLogQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码不能小于1'
    }),
  
  size: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量不能小于1',
      'number.max': '每页数量不能大于100'
    }),
  
  stock_id: Joi.string()
    .uuid()
    .messages({
      'string.guid': '库存ID格式不正确'
    }),
  
  product_id: Joi.string()
    .uuid()
    .messages({
      'string.guid': '商品ID格式不正确'
    }),
  
  sku_id: Joi.string()
    .uuid()
    .messages({
      'string.guid': 'SKU ID格式不正确'
    }),
  
  type: Joi.string()
    .valid(...STOCK_LOG_TYPES)
    .messages({
      'any.only': `变动类型必须是以下值之一: ${STOCK_LOG_TYPES.join(', ')}`
    }),
  
  order_id: Joi.string()
    .uuid()
    .messages({
      'string.guid': '订单ID格式不正确'
    }),
  
  start_date: Joi.string()
    .isoDate()
    .messages({
      'string.isoDate': '开始日期格式不正确，请使用ISO 8601格式'
    }),
  
  end_date: Joi.string()
    .isoDate()
    .messages({
      'string.isoDate': '结束日期格式不正确，请使用ISO 8601格式'
    }),
  
  sort_by: Joi.string()
    .valid('created_at')
    .default('created_at')
    .messages({
      'any.only': '排序字段必须是: created_at'
    }),
  
  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': '排序方向必须是: asc, desc'
    })
});

// 库存锁定/解锁验证
export const stockLockSchema = Joi.object({
  stock_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '库存ID不能为空',
      'string.guid': '库存ID格式不正确',
      'any.required': '库存ID为必填项'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(999999)
    .required()
    .messages({
      'number.base': '数量必须是数字',
      'number.integer': '数量必须是整数',
      'number.min': '数量必须大于0',
      'number.max': '数量不能大于999999',
      'any.required': '数量为必填项'
    }),
  
  order_id: Joi.string()
    .uuid()
    .allow(null)
    .messages({
      'string.guid': '订单ID格式不正确'
    })
});

// 库存可用性检查验证
export const stockAvailabilitySchema = Joi.object({
  sku_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'SKU ID不能为空',
      'string.guid': 'SKU ID格式不正确',
      'any.required': 'SKU ID为必填项'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(999999)
    .required()
    .messages({
      'number.base': '数量必须是数字',
      'number.integer': '数量必须是整数',
      'number.min': '数量必须大于0',
      'number.max': '数量不能大于999999',
      'any.required': '数量为必填项'
    })
});

// 库存预留/释放验证
export const stockReserveSchema = Joi.object({
  sku_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'SKU ID不能为空',
      'string.guid': 'SKU ID格式不正确',
      'any.required': 'SKU ID为必填项'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(999999)
    .required()
    .messages({
      'number.base': '数量必须是数字',
      'number.integer': '数量必须是整数',
      'number.min': '数量必须大于0',
      'number.max': '数量不能大于999999',
      'any.required': '数量为必填项'
    }),
  
  order_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '订单ID不能为空',
      'string.guid': '订单ID格式不正确',
      'any.required': '订单ID为必填项'
    })
});

// ID参数验证
export const idSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.empty': 'ID不能为空',
    'string.guid': 'ID格式不正确',
    'any.required': 'ID为必填项'
  }); 