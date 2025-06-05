/**
 * 商品管理相关的Joi验证规则
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Joi from 'joi';

/**
 * 商品创建验证规则
 */
export const productCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required()
    .messages({
      'string.empty': '商品名称不能为空',
      'string.min': '商品名称至少1个字符',
      'string.max': '商品名称不能超过100个字符',
      'any.required': '商品名称为必填项'
    }),
  
  categoryId: Joi.string().uuid().required()
    .messages({
      'string.guid': '商品分类ID格式错误',
      'any.required': '商品分类为必填项'
    }),
    
  brand: Joi.string().max(50).optional().allow(''),
  
  description: Joi.string().optional().allow(''),
  
  mainImage: Joi.string().uri().max(255).optional().allow(''),
  
  price: Joi.number().positive().precision(2).required()
    .messages({
      'number.positive': '商品价格必须大于0',
      'any.required': '商品价格为必填项'
    }),
    
  marketPrice: Joi.number().positive().precision(2).required()
    .messages({
      'number.positive': '市场价格必须大于0',
      'any.required': '市场价格为必填项'
    }),
    
  status: Joi.number().valid(0, 1).default(1),
  
  stock: Joi.number().integer().min(0).default(0),
  
  sort: Joi.number().integer().min(0).default(0)
});

/**
 * 商品更新验证规则
 */
export const productUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional()
    .messages({
      'string.empty': '商品名称不能为空',
      'string.min': '商品名称至少1个字符',
      'string.max': '商品名称不能超过100个字符'
    }),
  
  categoryId: Joi.string().uuid().optional()
    .messages({
      'string.guid': '商品分类ID格式错误'
    }),
    
  brand: Joi.string().max(50).optional().allow(''),
  
  description: Joi.string().optional().allow(''),
  
  mainImage: Joi.string().uri().max(255).optional().allow(''),
  
  price: Joi.number().positive().precision(2).optional()
    .messages({
      'number.positive': '商品价格必须大于0'
    }),
    
  marketPrice: Joi.number().positive().precision(2).optional()
    .messages({
      'number.positive': '市场价格必须大于0'
    }),
    
  status: Joi.number().valid(0, 1).optional(),
  
  stock: Joi.number().integer().min(0).optional(),
  
  sort: Joi.number().integer().min(0).optional()
});

/**
 * 商品查询验证规则
 */
export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).max(100).default(10),
  name: Joi.string().max(100).optional(),
  categoryId: Joi.string().uuid().optional(),
  brand: Joi.string().max(50).optional(),
  status: Joi.number().valid(0, 1).optional(),
  minPrice: Joi.number().positive().precision(2).optional(),
  maxPrice: Joi.number().positive().precision(2).optional(),
  sort: Joi.string().valid('name', 'price', 'sales', 'createdAt', 'updatedAt').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

/**
 * 商品批量操作验证规则
 */
export const productBatchSchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required()
    .messages({
      'array.min': '至少选择一个商品',
      'any.required': '商品ID列表为必填项'
    }),
  action: Joi.string().valid('delete', 'online', 'offline').required()
    .messages({
      'any.only': '操作类型只能是delete、online或offline',
      'any.required': '操作类型为必填项'
    })
});

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
      'string.max': 'SKU编码不能超过50个字符',
      'any.required': 'SKU编码为必填项'
    }),
    
  price: Joi.number().positive().precision(2).required()
    .messages({
      'number.positive': 'SKU价格必须大于0',
      'any.required': 'SKU价格为必填项'
    }),
    
  stock: Joi.number().integer().min(0).default(0),
  
  attributes: Joi.object().optional(),
  
  status: Joi.number().valid(0, 1).default(1)
});

/**
 * SKU更新验证规则
 */
export const skuUpdateSchema = Joi.object({
  skuCode: Joi.string().min(1).max(50).optional()
    .messages({
      'string.empty': 'SKU编码不能为空',
      'string.max': 'SKU编码不能超过50个字符'
    }),
    
  price: Joi.number().positive().precision(2).optional()
    .messages({
      'number.positive': 'SKU价格必须大于0'
    }),
    
  stock: Joi.number().integer().min(0).optional(),
  
  attributes: Joi.object().optional(),
  
  status: Joi.number().valid(0, 1).optional()
});

/**
 * 商品属性验证规则
 */
export const attributeSchema = Joi.object({
  productId: Joi.string().uuid().required()
    .messages({
      'string.guid': '商品ID格式错误',
      'any.required': '商品ID为必填项'
    }),
    
  name: Joi.string().min(1).max(50).required()
    .messages({
      'string.empty': '属性名称不能为空',
      'string.max': '属性名称不能超过50个字符',
      'any.required': '属性名称为必填项'
    }),
    
  value: Joi.string().min(1).max(100).required()
    .messages({
      'string.empty': '属性值不能为空',
      'string.max': '属性值不能超过100个字符',
      'any.required': '属性值为必填项'
    })
});

/**
 * 商品图片验证规则
 */
export const imageSchema = Joi.object({
  productId: Joi.string().uuid().required()
    .messages({
      'string.guid': '商品ID格式错误',
      'any.required': '商品ID为必填项'
    }),
    
  url: Joi.string().uri().max(255).required()
    .messages({
      'string.uri': '图片URL格式错误',
      'string.max': '图片URL不能超过255个字符',
      'any.required': '图片URL为必填项'
    }),
    
  type: Joi.string().valid('main', 'detail', 'sku').default('main'),
  
  sort: Joi.number().integer().min(0).default(0)
});

/**
 * 库存管理验证规则
 */
export const stockSchema = Joi.object({
  productId: Joi.string().uuid().required()
    .messages({
      'string.guid': '商品ID格式错误',
      'any.required': '商品ID为必填项'
    }),
    
  skuId: Joi.string().uuid().required()
    .messages({
      'string.guid': 'SKU ID格式错误',
      'any.required': 'SKU ID为必填项'
    }),
    
  warehouseId: Joi.string().uuid().optional(),
  
  stockType: Joi.string().valid('sellable', 'locked', 'warning').default('sellable'),
  
  quantity: Joi.number().integer().min(0).required()
    .messages({
      'number.min': '库存数量不能小于0',
      'any.required': '库存数量为必填项'
    }),
    
  warningLine: Joi.number().integer().min(0).default(0)
});

/**
 * 库存调整验证规则
 */
export const stockAdjustSchema = Joi.object({
  change: Joi.number().integer().required()
    .messages({
      'any.required': '变动数量为必填项'
    }),
    
  type: Joi.string().valid('in', 'out', 'lock', 'unlock', 'adjust').required()
    .messages({
      'any.only': '变动类型只能是in、out、lock、unlock或adjust',
      'any.required': '变动类型为必填项'
    }),
    
  orderId: Joi.string().uuid().optional(),
  
  remark: Joi.string().max(255).optional()
});

/**
 * UUID参数验证规则
 */
export const uuidSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({
      'string.guid': 'ID格式错误',
      'any.required': 'ID为必填项'
    })
}); 