# 微信小程序商城系统

基于现代化技术栈的全功能微信小程序商城系统，支持多端运行，包含完整的商城功能、会员体系、营销活动和管理后台。

## 🚀 项目特性

- 🏢 **多端支持**: 微信小程序 + H5 + 管理后台
- ⚡ **现代技术栈**: Vue3、TypeScript、uni-app、云函数
- 🛒 **完整商城功能**: 商品管理、订单系统、支付集成、会员体系
- 🎯 **营销工具**: 优惠券、秒杀、拼团、砍价、限时折扣
- 📱 **移动优先**: 专为移动端优化的UI/UX设计
- 🔒 **安全可靠**: JWT认证、API鉴权、数据加密
- 📊 **数据分析**: 完整的运营数据统计和分析
- 🚀 **高性能**: 缓存优化、CDN加速、云函数扩容

## 📁 项目结构

```
微信小程序商城系统/
├── mall-api/              # 后端API服务 (腾讯云函数)
├── mall-admin/            # 后台管理前端 (Vue3 + TypeScript)
├── mall-miniprogram/      # 微信小程序前端 (uni-app)
├── docs/                  # 项目文档
├── database/              # 数据库相关
└── deploy/                # 部署配置
```

## 🛠️ 技术栈

### 后端服务
- **云平台**: 腾讯云
- **计算**: 云函数SCF (Node.js 18.x + TypeScript)
- **数据库**: MySQL 8.0 + Redis
- **存储**: COS对象存储
- **CDN**: 腾讯云CDN
- **框架**: Koa.js + Prisma ORM

### 管理后台
- **框架**: Vue 3.x + TypeScript
- **构建**: Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **图表**: ECharts

### 小程序前端
- **框架**: uni-app (支持微信小程序、H5、App)
- **UI组件**: uView UI 2.0
- **状态管理**: Pinia
- **支付**: 微信支付

## 🎯 核心功能

### 商城功能
- ✅ 商品管理 (SPU/SKU)
- ✅ 商品分类、品牌管理
- ✅ 库存管理、价格管理
- ✅ 商品评价系统
- ✅ 搜索与筛选

### 订单系统
- ✅ 购物车功能
- ✅ 订单创建与管理
- ✅ 支付集成 (微信支付)
- ✅ 物流配送
- ✅ 售后服务

### 营销活动
- ✅ 优惠券系统
- ✅ 秒杀活动
- ✅ 拼团功能
- ✅ 砍价活动
- ✅ 限时折扣
- ✅ 满减优惠

### 会员体系
- ✅ 会员等级管理
- ✅ 积分系统
- ✅ 签到奖励
- ✅ 会员权益
- ✅ 分销推广

### 管理后台
- ✅ 系统管理 (用户、角色、权限)
- ✅ 商品管理
- ✅ 订单管理
- ✅ 营销管理
- ✅ 会员管理
- ✅ 数据统计
- ✅ 系统配置

## 🚀 快速开始

### 环境要求
- Node.js 18.x+
- MySQL 8.0+
- Redis 6.x+
- 微信开发者工具

### 安装部署

1. **克隆项目**
```bash
git clone https://github.com/your-username/wechat-mall.git
cd wechat-mall
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd mall-api
npm install

# 安装管理后台依赖
cd ../mall-admin
npm install

# 安装小程序依赖
cd ../mall-miniprogram
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp mall-api/.env.example mall-api/.env
# 编辑配置文件，填入数据库连接等信息
```

4. **初始化数据库**
```bash
cd mall-api
npx prisma migrate dev
npx prisma db seed
```

5. **启动开发服务**
```bash
# 启动后端API
cd mall-api
npm run dev

# 启动管理后台
cd mall-admin
npm run dev

# 启动小程序开发
cd mall-miniprogram
npm run dev:mp-weixin
```

### 部署到生产环境

#### 1. 后端API部署
```bash
cd mall-api
npm run deploy:prod
```

#### 2. 管理后台部署
```bash
cd mall-admin
npm run build
# 将dist目录上传到CDN或静态服务器
```

#### 3. 小程序发布
```bash
cd mall-miniprogram
npm run build:mp-weixin
# 使用微信开发者工具上传代码
```

## 📖 文档

- [系统设计方案](./系统设计方案.md)
- [项目结构说明](./项目结构说明.md)
- [数据库设计](./数据库设计.md)
- [API接口文档](./docs/API接口文档.md)
- [部署文档](./docs/部署文档.md)

## 🎨 界面预览

### 小程序端
- 首页商品展示
- 商品详情页面
- 购物车与结算
- 个人中心
- 订单管理

### 管理后台
- 数据统计面板
- 商品管理界面
- 订单处理界面
- 营销活动配置
- 系统设置

## 📊 系统架构

```
用户端 (小程序/H5) → API网关 → 云函数 → 数据库/缓存
                                ↓
管理端 (Vue3) → API网关 → 云函数 → 数据库/缓存
```

## 🔧 开发指南

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 Conventional Commits 提交规范
- 使用 TypeScript 进行类型检查

### 测试
```bash
# 运行单元测试
npm run test

# 运行端到端测试
npm run test:e2e
```

### 构建
```bash
# 构建生产版本
npm run build

# 构建并部署
npm run deploy
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 更新日志

### v1.0.0 (2024-01-01)
- 🎉 初始版本发布
- ✨ 完整的商城功能
- ✨ 会员体系
- ✨ 营销活动
- ✨ 管理后台

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)

## 💬 联系我们

- 邮箱: your-email@example.com
- 微信: your-wechat
- QQ群: 123456789

## ⭐ 支持项目

如果这个项目对你有帮助，请给它一个 Star ⭐

---

**微信小程序商城系统** - 让电商开发更简单 🚀 