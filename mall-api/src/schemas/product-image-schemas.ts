/**
 * 商品图片验证模式
 * @author 刘白 & AI Assistant
 */

import Joi from 'joi';

// 图片类型枚举
const IMAGE_TYPES = ['main', 'detail', 'sku'];

// 创建商品图片验证
export const createProductImageSchema = Joi.object({
  product_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '商品ID不能为空',
      'string.guid': '商品ID格式不正确',
      'any.required': '商品ID为必填项'
    }),
  
  url: Joi.string()
    .uri()
    .max(255)
    .required()
    .messages({
      'string.empty': '图片URL不能为空',
      'string.uri': '图片URL格式不正确',
      'string.max': '图片URL长度不能超过255个字符',
      'any.required': '图片URL为必填项'
    }),
  
  type: Joi.string()
    .valid(...IMAGE_TYPES)
    .default('main')
    .messages({
      'any.only': `图片类型必须是以下值之一: ${IMAGE_TYPES.join(', ')}`
    }),
  
  sort: Joi.number()
    .integer()
    .min(0)
    .max(999)
    .default(0)
    .messages({
      'number.base': '排序必须是数字',
      'number.integer': '排序必须是整数',
      'number.min': '排序不能小于0',
      'number.max': '排序不能大于999'
    })
});

// 更新商品图片验证
export const updateProductImageSchema = Joi.object({
  url: Joi.string()
    .uri()
    .max(255)
    .messages({
      'string.uri': '图片URL格式不正确',
      'string.max': '图片URL长度不能超过255个字符'
    }),
  
  type: Joi.string()
    .valid(...IMAGE_TYPES)
    .messages({
      'any.only': `图片类型必须是以下值之一: ${IMAGE_TYPES.join(', ')}`
    }),
  
  sort: Joi.number()
    .integer()
    .min(0)
    .max(999)
    .messages({
      'number.base': '排序必须是数字',
      'number.integer': '排序必须是整数',
      'number.min': '排序不能小于0',
      'number.max': '排序不能大于999'
    })
}).min(1).messages({
  'object.min': '至少需要提供一个要更新的字段'
});

// 批量创建商品图片验证
export const batchCreateProductImageSchema = Joi.object({
  product_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '商品ID不能为空',
      'string.guid': '商品ID格式不正确',
      'any.required': '商品ID为必填项'
    }),
  
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string()
          .uri()
          .max(255)
          .required()
          .messages({
            'string.empty': '图片URL不能为空',
            'string.uri': '图片URL格式不正确',
            'string.max': '图片URL长度不能超过255个字符',
            'any.required': '图片URL为必填项'
          }),
        
        type: Joi.string()
          .valid(...IMAGE_TYPES)
          .default('main')
          .messages({
            'any.only': `图片类型必须是以下值之一: ${IMAGE_TYPES.join(', ')}`
          }),
        
        sort: Joi.number()
          .integer()
          .min(0)
          .max(999)
          .default(0)
          .messages({
            'number.base': '排序必须是数字',
            'number.integer': '排序必须是整数',
            'number.min': '排序不能小于0',
            'number.max': '排序不能大于999'
          })
      })
    )
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': '至少需要添加一张图片',
      'array.max': '一次最多只能添加20张图片',
      'any.required': '图片列表为必填项'
    })
});

// 批量更新排序验证
export const batchUpdateSortSchema = Joi.object({
  product_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '商品ID不能为空',
      'string.guid': '商品ID格式不正确',
      'any.required': '商品ID为必填项'
    }),
  
  sorts: Joi.array()
    .items(
      Joi.object({
        id: Joi.string()
          .uuid()
          .required()
          .messages({
            'string.empty': '图片ID不能为空',
            'string.guid': '图片ID格式不正确',
            'any.required': '图片ID为必填项'
          }),
        
        sort: Joi.number()
          .integer()
          .min(0)
          .max(999)
          .required()
          .messages({
            'number.base': '排序必须是数字',
            'number.integer': '排序必须是整数',
            'number.min': '排序不能小于0',
            'number.max': '排序不能大于999',
            'any.required': '排序为必填项'
          })
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': '至少需要一项排序数据',
      'array.max': '一次最多只能更新50项排序',
      'any.required': '排序列表为必填项'
    })
});

// 查询参数验证
export const queryProductImageSchema = Joi.object({
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
  
  type: Joi.string()
    .valid(...IMAGE_TYPES)
    .messages({
      'any.only': `图片类型必须是以下值之一: ${IMAGE_TYPES.join(', ')}`
    }),
  
  keyword: Joi.string()
    .max(50)
    .messages({
      'string.max': '关键词长度不能超过50个字符'
    }),
  
  sort_by: Joi.string()
    .valid('sort', 'created_at')
    .default('sort')
    .messages({
      'any.only': '排序字段必须是: sort, created_at'
    }),
  
  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('asc')
    .messages({
      'any.only': '排序方向必须是: asc, desc'
    })
});

// 批量删除验证
export const batchDeleteSchema = Joi.object({
  ids: Joi.array()
    .items(
      Joi.string().uuid().messages({
        'string.guid': '图片ID格式不正确'
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': '至少需要选择一张图片',
      'array.max': '一次最多只能删除50张图片',
      'any.required': 'ID列表为必填项'
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

// 设置主图验证
export const setMainImageSchema = Joi.object({
  product_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '商品ID不能为空',
      'string.guid': '商品ID格式不正确',
      'any.required': '商品ID为必填项'
    }),
  
  image_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '图片ID不能为空',
      'string.guid': '图片ID格式不正确',
      'any.required': '图片ID为必填项'
    })
});

// 重新排序验证
export const reorderImagesSchema = Joi.object({
  product_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': '商品ID不能为空',
      'string.guid': '商品ID格式不正确',
      'any.required': '商品ID为必填项'
    }),
  
  image_ids: Joi.array()
    .items(
      Joi.string().uuid().messages({
        'string.guid': '图片ID格式不正确'
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': '至少需要一张图片',
      'array.max': '一次最多只能排序50张图片',
      'any.required': '图片ID列表为必填项'
    })
}); 