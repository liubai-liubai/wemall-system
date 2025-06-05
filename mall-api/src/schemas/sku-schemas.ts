/**
 * SKU管理相关的Joi验证规则
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Joi from 'joi';

/**
 * SKU创建验证规则
 */
export const skuCreateSchema = Joi.object({
  productId: Joi.string().uuid().required()
    .messages({
      'string.guid': '商品ID格式错误',
      'any.required': '商品ID为必填项'
    }),
    
  skuCode: Joi.string().min(1).max(50).required()
    .messages({
      'string.empty': 'SKU编码不能为空',
      'string.min': 'SKU编码至少1个字符',
      'string.max': 'SKU编码不能超过50个字符',
      'any.required': 'SKU编码为必填项'
    }),
    
  price: Joi.number().positive().precision(2).required()
    .messages({
      'number.positive': 'SKU价格必须大于0',
      'any.required': 'SKU价格为必填项'
    }),
    
  stock: Joi.number().integer().min(0).default(0)
    .messages({
      'number.min': '库存数量不能小于0',
      'number.integer': '库存数量必须是整数'
    }),
    
  attributes: Joi.object().optional().default({}),
  
  status: Joi.number().valid(0, 1).default(1)
    .messages({
      'any.only': '状态只能是0（禁用）或1（启用）'
    })
});

/**
 * SKU更新验证规则
 */
export const skuUpdateSchema = Joi.object({
  skuCode: Joi.string().min(1).max(50).optional()
    .messages({
      'string.empty': 'SKU编码不能为空',
      'string.min': 'SKU编码至少1个字符',
      'string.max': 'SKU编码不能超过50个字符'
    }),
    
  price: Joi.number().positive().precision(2).optional()
    .messages({
      'number.positive': 'SKU价格必须大于0'
    }),
    
  stock: Joi.number().integer().min(0).optional()
    .messages({
      'number.min': '库存数量不能小于0',
      'number.integer': '库存数量必须是整数'
    }),
    
  attributes: Joi.object().optional(),
  
  status: Joi.number().valid(0, 1).optional()
    .messages({
      'any.only': '状态只能是0（禁用）或1（启用）'
    })
});

/**
 * SKU查询验证规则
 */
export const skuQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.min': '页码不能小于1'
    }),
    
  size: Joi.number().integer().min(1).max(100).default(10)
    .messages({
      'number.min': '每页数量不能小于1',
      'number.max': '每页数量不能超过100'
    }),
    
  productId: Joi.string().uuid().optional()
    .messages({
      'string.guid': '商品ID格式错误'
    }),
    
  skuCode: Joi.string().max(50).optional()
    .messages({
      'string.max': 'SKU编码不能超过50个字符'
    }),
    
  status: Joi.number().valid(0, 1).optional()
    .messages({
      'any.only': '状态只能是0（禁用）或1（启用）'
    }),
    
  minPrice: Joi.number().positive().precision(2).optional()
    .messages({
      'number.positive': '最低价格必须大于0'
    }),
    
  maxPrice: Joi.number().positive().precision(2).optional()
    .messages({
      'number.positive': '最高价格必须大于0'
    }),
    
  sort: Joi.string().valid('skuCode', 'price', 'stock', 'createdAt', 'updatedAt').default('createdAt')
    .messages({
      'any.only': '排序字段只能是skuCode、price、stock、createdAt或updatedAt'
    }),
    
  order: Joi.string().valid('asc', 'desc').default('desc')
    .messages({
      'any.only': '排序方向只能是asc或desc'
    })
});

/**
 * SKU批量操作验证规则
 */
export const skuBatchSchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required()
    .messages({
      'array.min': '至少选择一个SKU',
      'any.required': 'SKU ID列表为必填项'
    }),
    
  action: Joi.string().valid('delete', 'enable', 'disable', 'adjustStock').required()
    .messages({
      'any.only': '操作类型只能是delete、enable、disable或adjustStock',
      'any.required': '操作类型为必填项'
    }),
    
  stockAdjustment: Joi.number().integer().when('action', {
    is: 'adjustStock',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  })
    .messages({
      'any.required': '库存调整操作时必须提供调整数量',
      'any.forbidden': '非库存调整操作时不能提供调整数量',
      'number.integer': '库存调整数量必须是整数'
    })
});

/**
 * SKU库存调整验证规则
 */
export const skuStockAdjustSchema = Joi.object({
  adjustment: Joi.number().integer().required()
    .messages({
      'number.integer': '库存调整数量必须是整数',
      'any.required': '库存调整数量为必填项'
    }),
    
  reason: Joi.string().max(255).optional()
    .messages({
      'string.max': '调整原因不能超过255个字符'
    })
});

/**
 * 路径参数验证
 */
export const skuIdSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({
      'string.guid': 'SKU ID格式错误',
      'any.required': 'SKU ID为必填项'
    })
});

export const productIdSchema = Joi.object({
  productId: Joi.string().uuid().required()
    .messages({
      'string.guid': '商品ID格式错误',
      'any.required': '商品ID为必填项'
    })
}); 