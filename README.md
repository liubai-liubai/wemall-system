# 🛒 微信小程序商城系统

> 基于现代化技术栈的全功能微信小程序商城系统，支持多端运行，包含完整的商城功能、会员体系、营销活动和管理后台。

## ✨ 项目特性

- 🏢 **多端支持**: 微信小程序 + H5 + 管理后台
- ⚡ **现代技术栈**: Vue3、TypeScript、uni-app、云函数
- 🛒 **完整商城功能**: 商品管理、订单系统、支付集成、会员体系
- 🎯 **营销工具**: 优惠券、秒杀、拼团、砍价、限时折扣
- 🔒 **安全可靠**: JWT认证、API鉴权、数据加密
- 🚀 **高性能**: 缓存优化、CDN加速、云函数扩容

## 🏗️ 项目架构

```
wemall-system/
├── 📁 mall-api/              # 后端API服务 (Koa.js + Prisma + MySQL)
├── 📁 mall-admin/            # 管理后台 (Vue3 + Element Plus)
├── 📁 mall-miniprogram/      # 小程序前端 (uni-app + uView UI)
└── 📁 docs/                  # 项目文档
    ├── 01-项目规划/           # 开发计划、项目结构
    ├── 02-系统设计/           # 系统方案、数据库设计
    ├── 03-开发指南/           # 开发规范、环境搭建
    ├── 04-部署运维/           # 部署文档、运维指南
    └── 05-用户手册/           # 使用说明、操作手册
```

## 🛠️ 技术栈

| 模块         | 技术栈                                                    |
| ------------ | --------------------------------------------------------- |
| **后端API**  | Node.js 18 + TypeScript + Koa.js + Prisma + MySQL + Redis |
| **管理后台** | Vue 3 + TypeScript + Vite + Element Plus + Pinia          |
| **小程序**   | uni-app + TypeScript + uView UI 2.0 + Pinia               |
| **部署**     | 腾讯云函数SCF + COS + CDN                                 |

## 🚀 快速开始

### 📋 环境要求

- Node.js 18.x+
- MySQL 8.0+
- Redis 6.x+ (可选)
- 微信开发者工具

### ⚡ 安装和启动

```bash
# 1. 克隆项目
git clone https://github.com/your-username/wemall-system.git
cd wemall-system

# 2. 安装所有项目依赖
npm run install:all

# 3. 配置后端环境变量
cp mall-api/.env.example mall-api/.env
# 编辑 mall-api/.env 填入数据库配置

# 4. 初始化数据库
npm run db:generate
npm run db:migrate

# 5. 启动所有服务
npm run dev
```

### 🔧 单独操作

```bash
# 只启动后端API
npm run dev:api

# 只启动管理后台
npm run dev:admin  

# 只启动小程序
npm run dev:miniprogram

# 单独安装依赖
npm run install:api
npm run install:admin
npm run install:miniprogram

# 单独构建
npm run build:api
npm run build:admin
npm run build:miniprogram

# 清理项目
npm run clean              # 清理所有项目
npm run clean:api          # 清理后端API
npm run clean:admin        # 清理管理后台
npm run clean:miniprogram  # 清理小程序
```

### 🌐 访问地址

- **后端API**: http://localhost:3000
- **管理后台**: http://localhost:5173
- **小程序**: 微信开发者工具打开 mall-miniprogram 目录

## 📚 文档导航

| 文档类型        | 链接                                           | 说明               |
| --------------- | ---------------------------------------------- | ------------------ |
| 📋 **项目规划** | [项目结构](./docs/01-项目规划/项目结构说明.md) | 目录结构、模块说明 |
| 🏗️ **系统设计** | [系统方案](./docs/02-系统设计/系统设计方案.md) | 架构设计、技术选型 |
| 🏗️ **系统设计** | [数据库设计](./docs/02-系统设计/数据库设计.md) | 表结构、关系设计   |
| 👨‍💻 **开发指南** | [代码规范](./docs/03-开发指南/代码规范配置.md) | 编码标准、工具配置 |

## 🎯 核心功能

<details>
<summary>🛒 商城功能</summary>

- ✅ 商品管理 (SPU/SKU)
- ✅ 商品分类、品牌管理
- ✅ 库存管理、价格管理
- ✅ 商品评价系统
- ✅ 搜索与筛选

</details>

<details>
<summary>📦 订单系统</summary>

- ✅ 购物车功能
- ✅ 订单创建与管理
- ✅ 支付集成 (微信支付)
- ✅ 物流配送
- ✅ 售后服务

</details>

<details>
<summary>🎁 营销活动</summary>

- ✅ 优惠券系统
- ✅ 秒杀活动
- ✅ 拼团功能
- ✅ 砍价活动
- ✅ 限时折扣

</details>

<details>
<summary>👥 会员体系</summary>

- ✅ 会员等级管理
- ✅ 积分系统
- ✅ 签到奖励
- ✅ 分销推广

</details>

## 📊 开发进度

- [x] 项目初始化
- [x] 环境配置
- [ ] 后端API开发 (进行中)
- [ ] 管理后台开发
- [ ] 小程序开发
- [ ] 测试与部署

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 Apache License 2.0 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 项目地址: [GitHub](https://github.com/your-username/wemall-system)
- 问题反馈: [Issues](https://github.com/your-username/wemall-system/issues)
- 邮箱: your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给一个Star支持一下！
