/**
 * 验证中间件
 * 提供通用的请求参数验证中间件
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import Joi from 'joi';
import { Context, Next } from 'koa';
import { ApiResponse } from '../types/common';

/**
 * Koa中间件：验证请求体
 * @param schema Joi验证模式
 * @returns Koa中间件函数
 */
export function validateBody(schema: Joi.Schema) {
  return async (ctx: Context, next: Next) => {
    const { error, value } = schema.validate(ctx.request.body, {
      abortEarly: false, // 显示所有错误
      allowUnknown: false, // 不允许未知字段
      stripUnknown: true, // 移除未知字段
      convert: true // 自动类型转换
    });
    
    if (error) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: error.details[0].message,
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
      return;
    }
    
    ctx.request.body = value;
    await next();
  };
}

/**
 * Koa中间件：验证查询参数
 * @param schema Joi验证模式
 * @returns Koa中间件函数
 */
export function validateQuery(schema: Joi.Schema) {
  return async (ctx: Context, next: Next) => {
    const { error, value } = schema.validate(ctx.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: error.details[0].message,
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
      return;
    }
    
    ctx.query = value;
    await next();
  };
}

/**
 * Koa中间件：验证路径参数
 * @param schema Joi验证模式
 * @returns Koa中间件函数
 */
export function validateParams(schema: Joi.Schema) {
  return async (ctx: Context, next: Next) => {
    const { error, value } = schema.validate(ctx.params, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: error.details[0].message,
        data: null,
        timestamp: Date.now()
      } as ApiResponse;
      return;
    }
    
    ctx.params = value;
    await next();
  };
} 