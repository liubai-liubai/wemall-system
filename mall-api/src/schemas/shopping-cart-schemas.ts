/**
 * 购物车相关验证规则
 * 使用Joi进行请求参数验证，确保数据的完整性和安全性
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Joi from 'joi';

/**
 * UUID验证规则
 */
export const uuidSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({
      'string.guid': 'ID格式错误',
      'any.required': 'ID为必填项'
    })
});

/**
 * 添加到购物车验证规则
 */
export const addToCartSchema = Joi.object({
  skuId: Joi.string().uuid().required()
    .messages({
      'string.guid': 'SKU ID格式错误',
      'any.required': 'SKU ID为必填项'
    }),
    
  quantity: Joi.number().integer().min(1).max(999).required()
    .messages({
      'number.min': '商品数量至少为1',
      'number.max': '商品数量不能超过999',
      'any.required': '商品数量为必填项'
    })
});

/**
 * 更新购物车验证规则
 */
export const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(999).optional()
    .messages({
      'number.min': '商品数量至少为1',
      'number.max': '商品数量不能超过999'
    }),
    
  checked: Joi.boolean().optional()
    .messages({
      'boolean.base': '选中状态必须是布尔值'
    })
}).min(1)
  .messages({
    'object.min': '至少需要提供一个更新字段'
  });

/**
 * 购物车查询验证规则
 */
export const cartQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).max(100).default(20),
  
  checked: Joi.number().valid(0, 1).optional()
    .messages({
      'any.only': '选中状态只能是0或1'
    }),
    
  skuId: Joi.string().uuid().optional()
    .messages({
      'string.guid': 'SKU ID格式错误'
    })
});

/**
 * 批量操作购物车验证规则
 */
export const batchCartSchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).max(100).required()
    .messages({
      'array.min': '至少选择一个购物车项',
      'array.max': '一次最多操作100个购物车项',
      'any.required': '购物车项ID列表为必填项'
    }),
    
  action: Joi.string().valid('delete', 'check', 'uncheck').required()
    .messages({
      'any.only': '操作类型只能是delete、check或uncheck',
      'any.required': '操作类型为必填项'
    })
});

/**
 * 用户ID验证规则（用于路径参数）
 */
export const userIdSchema = Joi.object({
  userId: Joi.string().uuid().required()
    .messages({
      'string.guid': '用户ID格式错误',
      'any.required': '用户ID为必填项'
    })
});

/**
 * 购物车ID验证规则（用于路径参数）
 */
export const cartIdSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({
      'string.guid': '购物车ID格式错误',
      'any.required': '购物车ID为必填项'
    })
});

/**
 * 用户购物车查询验证规则（合并路径参数和查询参数）
 */
export const userCartQuerySchema = Joi.object({
  // 路径参数
  userId: Joi.string().uuid().required()
    .messages({
      'string.guid': '用户ID格式错误',
      'any.required': '用户ID为必填项'
    }),
    
  // 查询参数
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).max(100).default(20),
  
  checked: Joi.number().valid(0, 1).optional()
    .messages({
      'any.only': '选中状态只能是0或1'
    }),
    
  skuId: Joi.string().uuid().optional()
    .messages({
      'string.guid': 'SKU ID格式错误'
    })
});

/**
 * 购物车验证规则（用于验证购物车可用性）
 */
export const validateCartSchema = Joi.object({
  userId: Joi.string().uuid().required()
    .messages({
      'string.guid': '用户ID格式错误',
      'any.required': '用户ID为必填项'
    }),
    
  cartIds: Joi.array().items(Joi.string().uuid()).optional()
    .messages({
      'string.guid': '购物车ID格式错误'
    })
});

/**
 * 清空购物车验证规则
 */
export const clearCartSchema = Joi.object({
  userId: Joi.string().uuid().required()
    .messages({
      'string.guid': '用户ID格式错误',
      'any.required': '用户ID为必填项'
    }),
    
  checked: Joi.boolean().optional()
    .messages({
      'boolean.base': '选中状态必须是布尔值'
    })
}); 