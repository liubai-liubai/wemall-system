/**
 * Swagger文档中间件 - 修复右侧显示问题
 * @author AI Assistant
 * @since 1.0.0
 */

import { Context, Next } from 'koa';
import { swaggerSpec } from '../config/swagger.js';
import { logger } from '../utils/logger.js';

/**
 * 获取优化后的Swagger UI HTML页面
 */
const getSwaggerHTML = (specUrl: string): string => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微信小程序商城系统 API 接口文档</title>
    
    <!-- Swagger UI CSS -->
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.css" />
    
    <!-- 优化样式 -->
    <style>
        /* 基础重置 */
        * {
            box-sizing: border-box;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #fafafa;
            height: 100%;
        }

        /* 隐藏原始元素 */
        .swagger-ui .topbar {
            display: none;
        }

        /* 主容器 */
        .swagger-ui {
            max-width: none;
            padding: 0;
        }

        /* 自定义顶部 */
        .custom-header {
            background: #89bf04;
            color: white;
            padding: 15px 30px;
            border-bottom: 1px solid #7ba103;
        }

        .custom-header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            display: inline-block;
        }

        .custom-header .version {
            background: rgba(255,255,255,0.2);
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            margin-left: 10px;
        }

        /* 主内容区域 */
        .main-content {
            display: flex;
            min-height: calc(100vh - 60px);
        }

        /* 左侧导航 */
        .api-navigation {
            width: 300px;
            background: white;
            border-right: 1px solid #e3e3e3;
            overflow-y: auto;
            flex-shrink: 0;
        }

        /* 右侧内容 */
        .api-details {
            flex: 1;
            background: white;
            overflow-y: auto;
        }

        /* 导航样式 */
        .nav-section {
            border-bottom: 1px solid #e3e3e3;
        }

        .nav-section-header {
            background: #f7f7f7;
            padding: 12px 20px;
            font-weight: 600;
            color: #3b4151;
            font-size: 14px;
            border-bottom: 1px solid #e3e3e3;
            cursor: pointer;
            user-select: none;
        }

        .nav-section-header:hover {
            background: #f0f0f0;
        }

        .nav-item {
            display: flex;
            align-items: center;
            padding: 8px 20px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .nav-item:hover {
            background: #f8f8f8;
        }

        .nav-item.active {
            background: #e8f4fd;
            border-right: 3px solid #3b82f6;
        }

        .nav-method {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 20px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            margin-right: 12px;
            color: white;
        }

        .nav-method.get { background: #49cc90; }
        .nav-method.post { background: #3b82f6; }
        .nav-method.put { background: #fca130; }
        .nav-method.delete { background: #f93e3e; }
        .nav-method.patch { background: #50e3c2; }

        .nav-path {
            font-size: 13px;
            color: #3b4151;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* 右侧详情区域 */
        .detail-content {
            padding: 20px 30px;
        }

        .detail-empty {
            text-align: center;
            color: #8e8e8e;
            padding: 60px 30px;
        }

        .detail-empty h3 {
            color: #3b4151;
            margin-bottom: 10px;
        }

        /* 搜索框 */
        .search-container {
            padding: 15px 20px;
            border-bottom: 1px solid #e3e3e3;
            background: white;
        }

        .search-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
            outline: none;
        }

        .search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
        }

        /* 重要：优化Swagger UI右侧显示 */
        .swagger-ui .information-container {
            display: none !important;
        }

        .swagger-ui .scheme-container {
            display: none !important;
        }

        .swagger-ui .global-server-container {
            display: none !important;
        }

        /* 优化操作块样式 */
        .swagger-ui .opblock-tag-section {
            margin: 0;
            padding: 0;
        }

        .swagger-ui .opblock-tag {
            display: none !important;
        }

        .swagger-ui .opblock {
            border: 1px solid #e3e3e3;
            border-radius: 6px;
            margin: 0 0 20px 0;
            background: white;
            overflow: hidden;
        }

        .swagger-ui .opblock-summary {
            padding: 20px;
            border-bottom: 1px solid #e3e3e3;
            background: #fafbfc;
        }

        .swagger-ui .opblock-summary-method {
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            margin-right: 15px;
            min-width: 60px;
            text-align: center;
        }

        .swagger-ui .opblock-summary-path {
            font-family: Monaco, Consolas, "Courier New", monospace;
            font-size: 16px;
            font-weight: 600;
            color: #3b4151;
        }

        .swagger-ui .opblock-summary-description {
            margin-top: 10px;
            font-size: 14px;
            color: #666;
        }

        /* 操作内容区域 */
        .swagger-ui .opblock-body {
            padding: 0;
        }

        .swagger-ui .opblock-section {
            padding: 20px;
        }

        .swagger-ui .opblock-section-header {
            background: #f7f8f9;
            padding: 15px 20px;
            border-top: 1px solid #e3e3e3;
            border-bottom: 1px solid #e3e3e3;
            margin: 0 0 20px 0;
            font-size: 16px;
            font-weight: 600;
            color: #3b4151;
        }

        /* 参数表格优化 */
        .swagger-ui .table-container {
            padding: 0;
            margin: 20px 0;
        }

        .swagger-ui table {
            border-collapse: collapse;
            width: 100%;
            font-size: 14px;
        }

        .swagger-ui table thead tr th {
            background: #f7f8f9;
            border: 1px solid #e3e3e3;
            padding: 12px 10px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            color: #3b4151;
        }

        .swagger-ui table tbody tr td {
            border: 1px solid #e3e3e3;
            padding: 12px 10px;
            font-size: 13px;
            vertical-align: top;
            line-height: 1.4;
        }

        .swagger-ui .parameter__name {
            font-weight: 600;
            color: #3b4151;
        }

        .swagger-ui .parameter__type {
            font-family: Monaco, Consolas, monospace;
            color: #3b82f6;
            font-size: 12px;
        }

        .swagger-ui .parameter__deprecated {
            color: #999;
            text-decoration: line-through;
        }

        /* 响应区域 */
        .swagger-ui .responses-wrapper {
            margin-top: 30px;
        }

        .swagger-ui .responses-table {
            margin: 20px 0;
        }

        .swagger-ui .response-col_status {
            width: 100px;
        }

        .swagger-ui .response-col_description {
            width: auto;
        }

        /* 按钮优化 */
        .swagger-ui .try-out {
            margin: 20px 0;
            padding: 15px 0;
            border-top: 1px solid #e3e3e3;
        }

        .swagger-ui .btn {
            border-radius: 4px;
            border: 2px solid;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .swagger-ui .btn.try-out__btn {
            background: white;
            border-color: #3b82f6;
            color: #3b82f6;
        }

        .swagger-ui .btn.try-out__btn:hover {
            background: #3b82f6;
            color: white;
        }

        .swagger-ui .btn.execute {
            background: #3b82f6;
            border-color: #3b82f6;
            color: white;
        }

        .swagger-ui .btn.execute:hover {
            background: #2563eb;
            border-color: #2563eb;
        }

        /* 代码块优化 */
        .swagger-ui .highlight-code {
            border-radius: 6px;
            margin: 10px 0;
        }

        .swagger-ui pre {
            font-family: Monaco, Consolas, "Courier New", monospace;
            font-size: 13px;
            line-height: 1.4;
        }

        /* 模型展示 */
        .swagger-ui .model-box {
            background: #f7f8f9;
            border: 1px solid #e3e3e3;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
        }

        .swagger-ui .model-title {
            font-weight: 600;
            margin-bottom: 10px;
        }

        /* 隐藏不需要的元素 */
        .swagger-ui .schemes {
            display: none !important;
        }

        .swagger-ui .download-url-wrapper {
            display: none !important;
        }

        /* 滚动条 */
        .api-navigation::-webkit-scrollbar,
        .api-details::-webkit-scrollbar {
            width: 6px;
        }

        .api-navigation::-webkit-scrollbar-track,
        .api-details::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        .api-navigation::-webkit-scrollbar-thumb,
        .api-details::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }

        /* 响应式 */
        @media (max-width: 768px) {
            .main-content {
                flex-direction: column;
            }
            
            .api-navigation {
                width: 100%;
                height: 40vh;
                border-right: none;
                border-bottom: 1px solid #e3e3e3;
            }
            
            .detail-content {
                padding: 15px 20px;
            }
        }
    </style>
</head>
<body>
    <!-- 自定义头部 -->
    <div class="custom-header">
        <h1>swagger 接口文档</h1>
        <span class="version">OAS 3.0</span>
    </div>

    <!-- 主内容 -->
    <div class="main-content">
        <!-- 左侧导航 -->
        <div class="api-navigation">
            <!-- 搜索框 -->
            <div class="search-container">
                <input type="text" class="search-input" placeholder="请输入接口内容......" id="searchInput">
            </div>
            
            <!-- API列表 -->
            <div id="apiNavigation">
                <div class="detail-empty">
                    <p>正在加载接口列表...</p>
                </div>
            </div>
        </div>

        <!-- 右侧详情 -->
        <div class="api-details">
            <div class="detail-content">
                <div class="detail-empty" id="emptyState">
                    <h3>微信小程序商城系统 API 接口文档</h3>
                    <p>请从左侧选择要查看的接口</p>
                    <div style="margin-top: 30px; text-align: left; max-width: 400px;">
                        <h4 style="color: #3b4151; margin-bottom: 15px;">🚀 主要功能模块：</h4>
                        <ul style="list-style: none; padding: 0;">
                            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <strong>🔐 认证模块</strong> - 微信登录、令牌管理
                            </li>
                            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <strong>🏥 健康检查</strong> - 系统状态监控
                            </li>
                            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <strong>👤 用户管理</strong> - 用户信息、地址管理
                            </li>
                            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <strong>🛍️ 商品管理</strong> - 商品分类、库存管理
                            </li>
                            <li style="padding: 8px 0;">
                                <strong>📦 订单管理</strong> - 购物车、订单流程
                            </li>
                        </ul>
                    </div>
                </div>
                
                <!-- Swagger UI 容器 -->
                <div id="swagger-ui" style="display: none;"></div>
            </div>
        </div>
    </div>

    <!-- Swagger UI JavaScript -->
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
    
    <script>
        let currentSpec = null;
        let swaggerUIInstance = null;
        
        // 页面加载完成后初始化
        window.onload = function() {
            loadAPISpec();
            setupSearch();
        };
        
        // 加载API规范
        async function loadAPISpec() {
            try {
                const response = await fetch('${specUrl}');
                currentSpec = await response.json();
                buildNavigation(currentSpec);
            } catch (error) {
                console.error('加载API规范失败:', error);
                document.getElementById('apiNavigation').innerHTML = \`
                    <div class="detail-empty">
                        <p style="color: #f93e3e;">加载失败，请刷新重试</p>
                    </div>
                \`;
            }
        }
        
        // 构建导航菜单
        function buildNavigation(spec) {
            const navigation = document.getElementById('apiNavigation');
            const groupedAPIs = groupAPIsByTag(spec);
            
            let html = '';
            
            Object.keys(groupedAPIs).forEach(tag => {
                const apis = groupedAPIs[tag];
                const tagInfo = spec.tags?.find(t => t.name === tag) || { name: tag, description: tag };
                
                html += \`
                    <div class="nav-section">
                        <div class="nav-section-header">\${tagInfo.description || tag}</div>
                \`;
                
                apis.forEach(api => {
                    html += \`
                        <div class="nav-item" onclick="showAPIDetail('\${api.path}', '\${api.method}', '\${escapeHtml(api.summary)}')">
                            <span class="nav-method \${api.method.toLowerCase()}">\${api.method}</span>
                            <span class="nav-path">\${api.summary || api.path}</span>
                        </div>
                    \`;
                });
                
                html += '</div>';
            });
            
            navigation.innerHTML = html;
        }
        
        // 按标签分组API
        function groupAPIsByTag(spec) {
            const grouped = {};
            
            Object.keys(spec.paths).forEach(path => {
                Object.keys(spec.paths[path]).forEach(method => {
                    if (method === 'parameters') return;
                    
                    const operation = spec.paths[path][method];
                    const tags = operation.tags || ['Default'];
                    
                    tags.forEach(tag => {
                        if (!grouped[tag]) {
                            grouped[tag] = [];
                        }
                        
                        grouped[tag].push({
                            path: path,
                            method: method.toUpperCase(),
                            summary: operation.summary,
                            operationId: operation.operationId,
                            operation: operation
                        });
                    });
                });
            });
            
            return grouped;
        }
        
        // 显示API详情
        function showAPIDetail(path, method, title) {
            // 更新选中状态
            document.querySelectorAll('.nav-item.active').forEach(item => {
                item.classList.remove('active');
            });
            event.currentTarget.classList.add('active');
            
            // 隐藏空状态
            document.getElementById('emptyState').style.display = 'none';
            
            // 显示Swagger UI
            const swaggerContainer = document.getElementById('swagger-ui');
            swaggerContainer.style.display = 'block';
            
            // 清空之前的内容
            swaggerContainer.innerHTML = '';
            
            // 创建单个操作的规范
            const singleSpec = createSingleOperationSpec(currentSpec, path, method.toLowerCase());
            
            // 初始化Swagger UI
            swaggerUIInstance = SwaggerUIBundle({
                spec: singleSpec,
                dom_id: '#swagger-ui',
                deepLinking: false,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout",
                tryItOutEnabled: true,
                displayOperationId: false,
                displayRequestDuration: true,
                defaultModelsExpandDepth: 3,
                defaultModelExpandDepth: 3,
                defaultModelRendering: 'model',
                docExpansion: 'full',
                filter: false,
                showExtensions: false,
                showCommonExtensions: false,
                supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'],
                onComplete: function() {
                    // 确保样式正确应用
                    setTimeout(() => {
                        const infoContainer = document.querySelector('#swagger-ui .information-container');
                        if (infoContainer) {
                            infoContainer.style.display = 'none';
                        }
                        
                        const schemeContainer = document.querySelector('#swagger-ui .scheme-container');
                        if (schemeContainer) {
                            schemeContainer.style.display = 'none';
                        }
                    }, 100);
                }
            });
        }
        
        // 创建单个操作的规范
        function createSingleOperationSpec(fullSpec, path, method) {
            const operation = fullSpec.paths[path][method];
            
            return {
                openapi: fullSpec.openapi,
                info: {
                    title: operation.summary || 'API接口',
                    version: fullSpec.info.version,
                    description: operation.description || ''
                },
                servers: fullSpec.servers,
                components: fullSpec.components,
                paths: {
                    [path]: {
                        [method]: operation
                    }
                }
            };
        }
        
        // HTML转义
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // 设置搜索功能
        function setupSearch() {
            const searchInput = document.getElementById('searchInput');
            
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const navItems = document.querySelectorAll('.nav-item');
                
                navItems.forEach(item => {
                    const pathText = item.querySelector('.nav-path').textContent.toLowerCase();
                    const methodText = item.querySelector('.nav-method').textContent.toLowerCase();
                    
                    if (pathText.includes(searchTerm) || methodText.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    </script>
</body>
</html>
`;

/**
 * Swagger UI 中间件
 */
export const swaggerUI = () => {
  return async (ctx: Context, next: Next): Promise<void> => {
    try {
      if (ctx.path === '/api-docs' || ctx.path === '/api-docs/') {
        logger.debug('访问API文档页面', { 
          ip: ctx.ip, 
          userAgent: ctx.headers['user-agent'] 
        });
        
        ctx.type = 'text/html; charset=utf-8';
        ctx.body = getSwaggerHTML('/api-docs/swagger.json');
        return;
      }
      
      if (ctx.path === '/api-docs/swagger.json') {
        logger.debug('获取API规范JSON', { ip: ctx.ip });
        
        ctx.type = 'application/json; charset=utf-8';
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.body = swaggerSpec;
        return;
      }
      
      await next();
    } catch (error) {
      logger.error('Swagger中间件处理失败', error);
      ctx.status = 500;
      ctx.type = 'application/json';
      ctx.body = {
        code: 500,
        message: '文档服务暂时不可用',
        data: null,
        timestamp: Date.now()
      };
    }
  };
};

/**
 * API文档重定向中间件
 */
export const docsRedirect = () => {
  return async (ctx: Context, next: Next): Promise<void> => {
    if (ctx.path === '/docs' || ctx.path === '/docs/' || 
        ctx.path === '/documentation' || ctx.path === '/documentation/') {
      logger.debug('重定向到API文档', { 
        originalPath: ctx.path,
        targetPath: '/api-docs'
      });
      
      ctx.redirect('/api-docs');
      return;
    }
    
    await next();
  };
};