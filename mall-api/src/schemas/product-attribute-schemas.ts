/**
 * 商品属性管理验证模式
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Joi from 'joi';

// ================================
// 基础验证模式
// ================================

/**
 * UUID验证模式
 */
export const uuidSchema = Joi.string()
  .guid({ version: 'uuidv4' })
  .required()
  .messages({
    'string.guid': '必须是有效的UUID格式',
    'any.required': 'ID不能为空'
  });

/**
 * ID参数验证模式
 */
export const attributeIdSchema = Joi.object({
  id: uuidSchema.messages({
    'string.guid': '商品属性ID格式错误',
    'any.required': '商品属性ID不能为空'
  })
});

/**
 * 商品ID参数验证模式
 */
export const productIdSchema = Joi.object({
  productId: uuidSchema.messages({
    'string.guid': '商品ID格式错误',
    'any.required': '商品ID不能为空'
  })
});

// ================================
// 创建和更新验证模式
// ================================

/**
 * 创建商品属性验证模式
 */
export const createAttributeSchema = Joi.object({
  productId: uuidSchema.messages({
    'string.guid': '商品ID格式错误',
    'any.required': '商品ID不能为空'
  }),
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.base': '属性名称必须是字符串',
      'string.empty': '属性名称不能为空',
      'string.min': '属性名称至少需要1个字符',
      'string.max': '属性名称不能超过50个字符',
      'any.required': '属性名称不能为空'
    }),
  value: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': '属性值必须是字符串',
      'string.empty': '属性值不能为空',
      'string.min': '属性值至少需要1个字符',
      'string.max': '属性值不能超过100个字符',
      'any.required': '属性值不能为空'
    })
});

/**
 * 更新商品属性验证模式
 */
export const updateAttributeSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.base': '属性名称必须是字符串',
      'string.empty': '属性名称不能为空',
      'string.min': '属性名称至少需要1个字符',
      'string.max': '属性名称不能超过50个字符'
    }),
  value: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.base': '属性值必须是字符串',
      'string.empty': '属性值不能为空',
      'string.min': '属性值至少需要1个字符',
      'string.max': '属性值不能超过100个字符'
    })
}).min(1).messages({
  'object.min': '至少需要提供一个更新字段'
});

// ================================
// 批量操作验证模式
// ================================

/**
 * 批量创建商品属性验证模式
 */
export const batchCreateAttributesSchema = Joi.object({
  productId: uuidSchema.messages({
    'string.guid': '商品ID格式错误',
    'any.required': '商品ID不能为空'
  }),
  attributes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .trim()
          .min(1)
          .max(50)
          .required()
          .messages({
            'string.base': '属性名称必须是字符串',
            'string.empty': '属性名称不能为空',
            'string.min': '属性名称至少需要1个字符',
            'string.max': '属性名称不能超过50个字符',
            'any.required': '属性名称不能为空'
          }),
        value: Joi.string()
          .trim()
          .min(1)
          .max(100)
          .required()
          .messages({
            'string.base': '属性值必须是字符串',
            'string.empty': '属性值不能为空',
            'string.min': '属性值至少需要1个字符',
            'string.max': '属性值不能超过100个字符',
            'any.required': '属性值不能为空'
          })
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.base': '属性列表必须是数组',
      'array.min': '至少需要提供一个属性',
      'array.max': '一次最多只能创建50个属性',
      'any.required': '属性列表不能为空'
    })
});

/**
 * 批量操作验证模式
 */
export const batchAttributeOperationSchema = Joi.object({
  ids: Joi.array()
    .items(uuidSchema)
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.base': 'ID列表必须是数组',
      'array.min': '至少需要选择一个属性',
      'array.max': '一次最多只能操作100个属性',
      'any.required': 'ID列表不能为空'
    }),
  operation: Joi.string()
    .valid('delete', 'update')
    .required()
    .messages({
      'any.only': '操作类型只能是delete或update',
      'any.required': '操作类型不能为空'
    }),
  updateData: Joi.when('operation', {
    is: 'update',
    then: Joi.object({
      name: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .optional()
        .messages({
          'string.base': '属性名称必须是字符串',
          'string.empty': '属性名称不能为空',
          'string.min': '属性名称至少需要1个字符',
          'string.max': '属性名称不能超过50个字符'
        }),
      value: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .optional()
        .messages({
          'string.base': '属性值必须是字符串',
          'string.empty': '属性值不能为空',
          'string.min': '属性值至少需要1个字符',
          'string.max': '属性值不能超过100个字符'
        })
    }).min(1).required().messages({
      'object.min': '更新操作至少需要提供一个更新字段',
      'any.required': '更新操作需要提供更新数据'
    }),
    otherwise: Joi.forbidden()
  })
});

// ================================
// 查询验证模式
// ================================

/**
 * 商品属性查询验证模式
 */
export const attributeQuerySchema = Joi.object({
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
    .default(20)
    .messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量不能小于1',
      'number.max': '每页数量不能超过100'
    }),
  productId: Joi.string()
    .guid({ version: 'uuidv4' })
    .optional()
    .messages({
      'string.guid': '商品ID格式错误'
    }),
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.base': '属性名称必须是字符串',
      'string.empty': '属性名称不能为空',
      'string.min': '属性名称至少需要1个字符',
      'string.max': '属性名称不能超过50个字符'
    }),
  value: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.base': '属性值必须是字符串',
      'string.empty': '属性值不能为空',
      'string.min': '属性值至少需要1个字符',
      'string.max': '属性值不能超过100个字符'
    }),
  keyword: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.base': '关键词必须是字符串',
      'string.empty': '关键词不能为空',
      'string.min': '关键词至少需要1个字符',
      'string.max': '关键词不能超过50个字符'
    })
}); 