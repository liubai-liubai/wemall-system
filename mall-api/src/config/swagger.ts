/**
 * Swagger API文档配置
 * 使用OpenAPI 3.0规范自动生成API文档
 * 遵循项目开发规范：统一响应格式、错误处理、认证方式
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录 - ESM模块路径处理
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Swagger配置选项
 * 符合OpenAPI 3.0规范
 */
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '微信小程序商城系统 API',
      version: '1.0.0',
      description: `
        基于现代化技术栈的微信小程序商城系统后端API服务
        
        ## 技术栈
        - Node.js 18.x + TypeScript
        - Koa.js Web框架  
        - Prisma ORM + MySQL 8.0
        - JWT + 微信小程序授权
        - Redis缓存
        
        ## 认证方式
        - 微信小程序登录获取访问令牌
        - 请求头中携带: Authorization: Bearer {token}
        
        ## 响应格式
        所有API响应都遵循统一格式，符合项目规范：
        \`\`\`json
        {
          "code": 200,
          "message": "请求成功", 
          "data": {},
          "timestamp": 1640995200000
        }
        \`\`\`
      `,
      contact: {
        name: 'API支持',
        email: 'api-support@example.com'
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发环境'
      },
      {
        url: 'https://api-test.example.com', 
        description: '测试环境'
      },
      {
        url: 'https://api.example.com',
        description: '生产环境'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT访问令牌认证'
        }
      },
      schemas: {
        // 统一响应格式 - 符合项目规范
        ApiResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              description: '状态码',
              example: 200
            },
            message: {
              type: 'string', 
              description: '响应消息',
              example: '请求成功'
            },
            data: {
              description: '响应数据',
              oneOf: [
                { type: 'object' },
                { type: 'array' },
                { type: 'string' },
                { type: 'null' }
              ]
            },
            timestamp: {
              type: 'integer',
              description: '时间戳',
              example: 1640995200000
            }
          },
          required: ['code', 'message', 'timestamp']
        },

        // 分页响应格式 - 符合项目规范  
        PageResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              example: 200
            },
            message: {
              type: 'string',
              example: '请求成功'
            },
            data: {
              type: 'object',
              properties: {
                list: {
                  type: 'array',
                  description: '数据列表',
                  items: {}
                },
                total: {
                  type: 'integer',
                  description: '总数',
                  example: 100
                },
                page: {
                  type: 'integer', 
                  description: '当前页',
                  example: 1
                },
                size: {
                  type: 'integer',
                  description: '页大小', 
                  example: 10
                },
                pages: {
                  type: 'integer',
                  description: '总页数',
                  example: 10
                }
              },
              required: ['list', 'total', 'page', 'size', 'pages']
            },
            timestamp: {
              type: 'integer',
              example: 1640995200000
            }
          },
          required: ['code', 'message', 'data', 'timestamp']
        },

        // 错误响应格式
        ErrorResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              description: '错误码',
              example: 400
            },
            message: {
              type: 'string',
              description: '错误消息',
              example: '请求参数错误'
            },
            data: {
              type: 'null',
              description: '错误时data为null'
            },
            timestamp: {
              type: 'integer',
              example: 1640995200000
            }
          },
          required: ['code', 'message', 'timestamp']
        },

        // 用户信息模型 - 对应数据库User表
        UserInfo: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '用户ID UUID格式',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
            },
            openId: {
              type: 'string', 
              description: '微信openId',
              example: 'oGZUI0egBJY1zhBYw2KhdUfwVJJE'
            },
            nickname: {
              type: 'string',
              description: '用户昵称',
              example: '微信用户'
            },
            avatar: {
              type: 'string',
              description: '头像URL',
              example: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLL1byctY955FriedchieaQkdywMPqCtVMKjwNGpShWxnFJDPXwKp6eDaRxw0W1IcOTF5rgSKTlGZVOw/132'
            },
            phone: {
              type: 'string',
              description: '手机号',
              example: '13800138000'
            },
            gender: {
              type: 'integer',
              description: '性别 0:未知 1:男 2:女',
              example: 1
            },
            status: {
              type: 'integer',
              description: '状态 1:正常 0:禁用',
              example: 1
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2023-12-01T10:00:00.000Z'
            }
          },
          required: ['id', 'openId', 'status']
        },

        // 微信登录请求模型
        WechatLoginRequest: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: '微信登录凭证code',
              example: '0234A0z01Hx5nV1kCNy01Mzsz34A0z0K',
              minLength: 1,
              maxLength: 100
            },
            encryptedData: {
              type: 'string',
              description: '加密的用户数据（可选）',
              example: 'CiyLU1Aw2KjvrjMdj'
            },
            iv: {
              type: 'string',
              description: '初始向量（可选）',
              example: 'r7BXXKkLb8qrSNn05n0qiA=='
            }
          },
          required: ['code']
        },

        // 登录响应模型
        LoginResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/UserInfo',
              description: '用户信息'
            },
            token: {
              type: 'string',
              description: '访问令牌',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              description: '刷新令牌',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            expiresIn: {
              type: 'integer',
              description: '令牌有效期（秒）',
              example: 604800
            }
          },
          required: ['user', 'token', 'refreshToken', 'expiresIn']
        },

        // 刷新令牌请求模型
        RefreshTokenRequest: {
          type: 'object',
          properties: {
            refreshToken: {
              type: 'string',
              description: '刷新令牌',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          },
          required: ['refreshToken']
        }
      }
    },
    tags: [
      {
        name: '认证模块',
        description: '认证模块 - 用户登录、注册、令牌管理'
      },
      {
        name: '健康检查', 
        description: '健康检查 - 系统状态监控'
      },
      {
        name: '权限管理',
        description: '权限管理 - 权限CRUD操作和权限检查'
      },
      {
        name: '角色管理',
        description: '角色管理 - 角色CRUD操作和角色权限分配'
      },
      {
        name: '部门管理',
        description: '部门管理 - 部门CRUD操作和部门树形结构管理'
      },
      {
        name: '管理员用户',
        description: '管理员用户 - 管理员用户CRUD操作和用户角色分配'
      },
      {
        name: '用户管理',
        description: '用户管理 - 用户信息、地址管理'
      },
      {
        name: '商品管理',
        description: '商品管理 - 商品分类、商品信息、库存管理'
      },
      {
        name: '订单管理',
        description: '订单管理 - 购物车、订单创建、支付、物流'
      }
    ]
  },
  apis: [
    // 扫描控制器文件获取API文档注释
    path.join(__dirname, '../controllers/*.ts'),
    // 扫描路由文件获取路由信息
    path.join(__dirname, '../routes/*.ts'),
    // 扫描类型文件获取数据模型
    path.join(__dirname, '../types/*.ts')
  ]
};

/**
 * 生成Swagger规范文档
 */
export const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * 导出配置供其他模块使用
 */
export const swaggerConfig = {
  spec: swaggerSpec,
  options: swaggerOptions
};