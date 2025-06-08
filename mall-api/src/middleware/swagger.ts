/**
 * Swagger文档中间件 - 优化版本
 * 支持左侧菜单折叠，右侧界面更加干净清爽
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { Context, Next } from 'koa';
import { swaggerSpec } from '../config/swagger';
import { logger } from '../utils/logger';

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
    
    <!-- 自定义样式 -->
    <style>
        /* ===== 基础重置 ===== */
        * {
            box-sizing: border-box;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #f8fafc;
            height: 100%;
        }

        /* ===== 隐藏Swagger原始元素 ===== */
        .swagger-ui .topbar,
        .swagger-ui .info {
            display: none;
        }

        .swagger-ui {
            max-width: none;
            padding: 0;
            margin: 0;
        }

        /* ===== 自定义顶部导航 ===== */
        .custom-header {
            background: linear-gradient(135deg, #89bf04 0%, #7ba103 100%);
            color: white;
            padding: 16px 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1000;
        }

        .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1200px;
            margin: 0 auto;
        }

        .custom-header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }

        .custom-header .version {
            background: rgba(255,255,255,0.2);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 12px;
            font-weight: 500;
        }

        .menu-toggle {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .menu-toggle:hover {
            background: rgba(255,255,255,0.1);
        }

        /* ===== 主内容布局 ===== */
        .main-wrapper {
            display: flex;
            min-height: calc(100vh - 60px);
            background: #f8fafc;
        }

        /* ===== 左侧导航 ===== */
        .sidebar {
            width: 320px;
            background: white;
            border-right: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            overflow: hidden;
            box-shadow: 2px 0 4px rgba(0,0,0,0.05);
        }

        .sidebar.collapsed {
            width: 0;
        }

        .sidebar-content {
            height: 100%;
            overflow-y: auto;
            width: 320px;
        }

        /* ===== 搜索区域 ===== */
        .search-section {
            padding: 16px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
        }

        .search-input {
            width: 100%;
            padding: 10px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            background: white;
        }

        .search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* ===== 导航分组 ===== */
        .nav-group {
            border-bottom: 1px solid #f1f5f9;
        }

        .nav-group-header {
            background: #f8fafc;
            padding: 12px 16px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            cursor: pointer;
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background-color 0.2s;
        }

        .nav-group-header:hover {
            background: #f1f5f9;
        }

        .nav-group-header .icon {
            transition: transform 0.2s;
            font-size: 12px;
            color: #6b7280;
        }

        .nav-group.collapsed .icon {
            transform: rotate(-90deg);
        }

        .nav-group-items {
            overflow: hidden;
            transition: all 0.3s ease;
            max-height: 1000px; /* 给一个足够大的初始高度 */
        }

        .nav-group.collapsed .nav-group-items {
            max-height: 0;
        }

        /* ===== 导航项目 ===== */
        .nav-item {
            display: flex;
            align-items: center;
            padding: 10px 16px;
            cursor: pointer;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }

        .nav-item:hover {
            background: #f8fafc;
        }

        .nav-item.active {
            background: #eff6ff;
            border-left-color: #3b82f6;
        }

        .nav-method {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 24px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            margin-right: 12px;
            color: white;
            flex-shrink: 0;
        }

        .nav-method.get { background: #10b981; }
        .nav-method.post { background: #3b82f6; }
        .nav-method.put { background: #f59e0b; }
        .nav-method.delete { background: #ef4444; }
        .nav-method.patch { background: #06b6d4; }

        .nav-summary {
            font-size: 13px;
            color: #374151;
            flex: 1;
            margin-right: 8px;
            font-weight: 500;
        }

        .nav-path {
            font-size: 11px;
            color: #6b7280;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 120px;
        }

        /* ===== 右侧内容区域 ===== */
        .content-area {
            flex: 1;
            background: white;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .content-wrapper {
            flex: 1;
            overflow-y: auto;
            padding: 0;
        }

        .welcome-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            color: #6b7280;
            padding: 40px;
        }

        .welcome-screen h2 {
            color: #374151;
            margin-bottom: 16px;
            font-size: 24px;
            font-weight: 600;
        }

        .welcome-screen p {
            font-size: 16px;
            margin-bottom: 24px;
            max-width: 500px;
            line-height: 1.6;
        }

        .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
        }

        .feature-list li {
            padding: 8px 0;
            display: flex;
            align-items: center;
        }

        .feature-list li::before {
            content: "✨";
            margin-right: 12px;
        }

        /* ===== 优化Swagger UI右侧显示 ===== */
        .swagger-ui .wrapper {
            padding: 0;
        }

        .swagger-ui .operation-tag-content {
            margin: 0;
        }

        .swagger-ui .opblock-tag {
            display: none;
        }

        .swagger-ui .opblock {
            margin: 0;
            border: none;
            box-shadow: none;
            border-radius: 0;
        }

        .swagger-ui .opblock .opblock-summary {
            padding: 20px 30px;
            border-bottom: 1px solid #e2e8f0;
        }

        .swagger-ui .opblock .opblock-body {
            padding: 20px 30px;
        }

        .swagger-ui .scheme-container {
            background: #f8fafc;
            padding: 20px 30px;
            border-bottom: 1px solid #e2e8f0;
        }

        /* ===== 响应式设计 ===== */
        @media (max-width: 768px) {
            .sidebar {
                position: fixed;
                left: 0;
                top: 60px;
                height: calc(100vh - 60px);
                z-index: 999;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }

            .sidebar.show {
                transform: translateX(0);
            }

            .sidebar.collapsed {
                transform: translateX(-100%);
            }

            .content-area {
                width: 100%;
            }

            .menu-toggle {
                display: block;
            }
        }

        @media (min-width: 769px) {
            .menu-toggle {
                display: none;
            }
        }

        /* ===== 滚动条美化 ===== */
        .sidebar-content::-webkit-scrollbar,
        .content-wrapper::-webkit-scrollbar {
            width: 6px;
        }

        .sidebar-content::-webkit-scrollbar-track,
        .content-wrapper::-webkit-scrollbar-track {
            background: #f1f5f9;
        }

        .sidebar-content::-webkit-scrollbar-thumb,
        .content-wrapper::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }

        .sidebar-content::-webkit-scrollbar-thumb:hover,
        .content-wrapper::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        /* ===== API详情页面样式 ===== */
        .api-details-page {
            padding: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .api-header {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid #e2e8f0;
        }

        .api-title-row {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }

        .api-method {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 32px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            margin-right: 16px;
            color: white;
        }

        .api-method.get { background: #10b981; }
        .api-method.post { background: #3b82f6; }
        .api-method.put { background: #f59e0b; }
        .api-method.delete { background: #ef4444; }
        .api-method.patch { background: #06b6d4; }

        .api-title {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
        }

        .api-path {
            background: #374151;
            color: #f9fafb;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
        }

        .api-content {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .api-section {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .api-section h3 {
            background: #f9fafb;
            margin: 0;
            padding: 16px 24px;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
        }

        /* ===== 表格样式 ===== */
        .info-table,
        .params-table,
        .response-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .info-table tr:nth-child(even),
        .params-table tbody tr:nth-child(even),
        .response-table tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        .info-table td,
        .params-table td,
        .params-table th,
        .response-table td,
        .response-table th {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }

        .params-table th,
        .response-table th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
        }

        .info-table .label {
            font-weight: 600;
            color: #6b7280;
            width: 120px;
        }

        .method-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 24px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: white;
        }

        .method-badge.get { background: #10b981; }
        .method-badge.post { background: #3b82f6; }
        .method-badge.put { background: #f59e0b; }
        .method-badge.delete { background: #ef4444; }
        .method-badge.patch { background: #06b6d4; }

        .path-code {
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            color: #374151;
        }

        .param-type {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .param-type.query { background: #dbeafe; color: #1e40af; }
        .param-type.path { background: #fef3c7; color: #d97706; }
        .param-type.header { background: #f3e8ff; color: #7c3aed; }
        .param-type.body { background: #dcfce7; color: #16a34a; }

        .required-true { color: #dc2626; font-weight: 600; }
        .required-false { color: #6b7280; }

        .data-type {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            color: #7c3aed;
            font-weight: 500;
        }

        .param-desc {
            color: #6b7280;
        }

        .no-params {
            text-align: center;
            color: #9ca3af;
            font-style: italic;
            padding: 24px;
        }

        .status-code {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 12px;
            min-width: 40px;
            text-align: center;
        }

        .status-code.success { background: #dcfce7; color: #166534; }
        .status-code.error { background: #fee2e2; color: #dc2626; }

        .response-example {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
        }

        .response-example pre {
            margin: 0;
            padding: 16px;
            font-size: 13px;
            line-height: 1.5;
            overflow-x: auto;
        }

        .response-example code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            color: #374151;
        }

        /* ===== 测试面板样式 ===== */
        .test-panel {
            padding: 24px;
        }

        .test-url,
        .test-params {
            margin-bottom: 16px;
        }

        .test-panel label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }

        .url-input,
        .params-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background: #f9fafb;
        }

        .params-input {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            resize: vertical;
            min-height: 100px;
            background: white;
        }

        .test-actions {
            margin: 16px 0;
            display: flex;
            gap: 12px;
        }

        .test-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .test-btn:hover {
            background: #2563eb;
        }

        .clear-btn {
            background: #6b7280;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .clear-btn:hover {
            background: #4b5563;
        }

        .test-result {
            margin-top: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: #f8fafc;
        }

        .test-result label {
            display: block;
            padding: 12px 16px;
            background: #f3f4f6;
            border-bottom: 1px solid #e5e7eb;
            margin: 0;
        }

        .result-content {
            margin: 0;
            padding: 16px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            line-height: 1.5;
            white-space: pre-wrap;
            color: #374151;
        }

        /* ===== 使用指南页面样式 ===== */
        .usage-guide-page {
            padding: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .guide-header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px;
        }

        .guide-header h1 {
            margin: 0 0 16px 0;
            font-size: 32px;
            font-weight: 700;
        }

        .guide-header p {
            margin: 0;
            font-size: 18px;
            opacity: 0.9;
        }

        .guide-content {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }

        .guide-section {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .guide-section h2 {
            background: #f8fafc;
            margin: 0;
            padding: 20px 24px;
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
        }

        .guide-card {
            padding: 24px;
            border-bottom: 1px solid #f1f5f9;
        }

        .guide-card:last-child {
            border-bottom: none;
        }

        .guide-card h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
        }

        .guide-card p {
            margin: 0 0 12px 0;
            color: #6b7280;
            line-height: 1.6;
        }

        .guide-card ul {
            margin: 12px 0;
            padding-left: 20px;
            color: #6b7280;
        }

        .guide-card li {
            margin: 8px 0;
            line-height: 1.5;
        }

        .api-categories {
            padding: 24px;
        }

        .category-item {
            display: flex;
            align-items: center;
            padding: 16px;
            margin-bottom: 12px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }

        .category-icon {
            font-size: 24px;
            margin-right: 16px;
            width: 40px;
            text-align: center;
        }

        .category-info h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
        }

        .category-info p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }

        .tips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            padding: 24px;
        }

        .tip-item {
            display: flex;
            align-items: flex-start;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }

        .tip-icon {
            font-size: 20px;
            margin-right: 12px;
            margin-top: 2px;
        }

        .tip-item h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
        }

        .tip-item p {
            margin: 0;
            color: #6b7280;
            font-size: 13px;
            line-height: 1.5;
        }

        .config-info {
            padding: 24px;
        }

        .config-info h3 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
        }

        .server-list {
            margin-bottom: 24px;
        }

        .server-item {
            padding: 12px 16px;
            margin-bottom: 8px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            font-size: 14px;
        }

        .server-item code {
            background: #e5e7eb;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
        }

        .auth-example {
            background: #374151;
            color: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            margin: 12px 0;
            font-size: 13px;
            overflow-x: auto;
        }

        .auth-example code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
    </style>
</head>
<body>
    <!-- 自定义顶部 -->
    <div class="custom-header">
        <div class="header-content">
            <h1>
                swagger 接口文档
                <span class="version">OAS 3.0</span>
            </h1>
            <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
        </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-wrapper">
        <!-- 左侧导航 -->
        <div class="sidebar" id="sidebar">
            <div class="sidebar-content">
                <!-- 搜索区域 -->
                <div class="search-section">
                    <input type="text" class="search-input" placeholder="搜索API接口..." id="searchInput">
                </div>
                
                <!-- 导航内容 -->
                <div id="navigation"></div>
            </div>
        </div>

        <!-- 右侧内容 -->
        <div class="content-area">
            <div class="content-wrapper">
                <div class="welcome-screen" id="welcomeScreen">
                    <h2>微信小程序商城系统 API 接口文档</h2>
                    <p>请从左侧选择要查看的接口</p>
                    
                    <div style="margin-top: 30px;">
                        <h3 style="color: #374151; margin-bottom: 16px;">🚀 主要功能模块:</h3>
                        <ul class="feature-list">
                            <li>🔐 认证模块 - 微信登录、令牌管理</li>
                            <li>🏥 健康检查 - 系统状态监控</li>
                            <li>👤 用户管理 - 用户信息、地址管理</li>
                            <li>🏢 部门管理 - 组织架构管理</li>
                            <li>👨‍💼 角色管理 - 权限角色分配</li>
                            <li>🔑 权限管理 - 系统权限控制</li>
                            <li>📦 商品管理 - 商品分类、库存管理</li>
                            <li>🛒 订单管理 - 购物车、订单流程</li>
                        </ul>
                        
                        <div style="margin-top: 40px; text-align: center;">
                            <button onclick="showUsageGuide()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
                                📚 查看使用指南
                            </button>
                        </div>
                    </div>
                </div>
                <div id="swagger-ui"></div>
            </div>
        </div>
    </div>

    <!-- Swagger UI JS -->
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
    
    <script>
        // Swagger UI 配置
        const ui = SwaggerUIBundle({
            url: '${specUrl}',
            dom_id: '#swagger-ui',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            layout: "BaseLayout",
            deepLinking: true,
            showExtensions: true,
            showCommonExtensions: true,
            defaultModelsExpandDepth: 0,
            defaultModelExpandDepth: 0,
            docExpansion: "none",
            filter: true,
            onComplete: function() {
                buildNavigation();
                initializeUI();
            }
        });

        // 全局变量
        let currentActiveItem = null;
        let isNavigationBuilt = false;
        let navigationData = [];

        // 构建导航
        function buildNavigation() {
            if (isNavigationBuilt) return;
            
            // 延迟获取规范数据，确保Swagger UI完全加载
            setTimeout(() => {
                try {
                    // 多种方式尝试获取规范数据
                    let spec = null;
                    
                    // 方式1: 从SwaggerUI实例获取
                    const state = ui.getState();
                    if (state && state.getIn) {
                        spec = state.getIn(['spec', 'resolved']);
                    }
                    
                    // 方式2: 如果方式1失败，尝试其他方式
                    if (!spec && window.ui) {
                        const specSelectors = window.ui.getState().spec;
                        if (specSelectors) {
                            spec = specSelectors.resolved || specSelectors.json;
                        }
                    }
                    
                    // 方式3: 直接fetch规范
                    if (!spec) {
                        fetch('${specUrl}')
                            .then(response => response.json())
                            .then(specData => {
                                buildNavigationFromSpec(specData);
                            })
                            .catch(err => {
                                console.error('获取API规范失败:', err);
                                // 使用备用数据
                                buildNavigationFromBackup();
                            });
                        return;
                    }
                    
                    buildNavigationFromSpec(spec);
                } catch (err) {
                    console.error('构建导航失败:', err);
                    // 使用备用数据
                    buildNavigationFromBackup();
                }
            }, 500);
        }

        // 从规范数据构建导航
        function buildNavigationFromSpec(spec) {
            if (!spec || !spec.paths) {
                console.warn('规范数据无效:', spec);
                buildNavigationFromBackup();
                return;
            }
            
            // 按标签分组
            const tagGroups = {};
            
            // 遍历所有路径
            Object.keys(spec.paths).forEach(path => {
                const pathItem = spec.paths[path];
                Object.keys(pathItem).forEach(method => {
                    const operation = pathItem[method];
                    if (!operation) return;
                    
                    // 获取标签，如果没有标签则使用默认分组
                    let tag = 'Default';
                    if (operation.tags && operation.tags.length > 0) {
                        tag = operation.tags[0];
                    }
                    
                    if (!tagGroups[tag]) {
                        tagGroups[tag] = [];
                    }
                    
                    tagGroups[tag].push({
                        method: method.toUpperCase(),
                        path: path,
                        summary: operation.summary || \`\${method.toUpperCase()} \${path}\`,
                        operationId: operation.operationId || \`\${method}\${path.replace(/[^a-zA-Z0-9]/g, '')}\`
                    });
                });
            });

            navigationData = tagGroups;
            renderNavigation(tagGroups);
            isNavigationBuilt = true;
        }

        // 备用导航数据（当无法获取规范时使用）
        function buildNavigationFromBackup() {
            const backupData = {
                '健康检查': [
                    { method: 'GET', path: '/api/v1/health', summary: '基础健康检查', operationId: 'healthBasic' },
                    { method: 'GET', path: '/api/v1/health/detailed', summary: '详细健康检查', operationId: 'healthDetailed' }
                ],
                'Auth': [
                    { method: 'POST', path: '/api/v1/auth/wechat/login', summary: '微信小程序登录', operationId: 'wechatLogin' },
                    { method: 'POST', path: '/api/v1/auth/refresh', summary: '刷新访问令牌', operationId: 'refreshToken' },
                    { method: 'POST', path: '/api/v1/auth/logout', summary: '用户登出', operationId: 'logout' }
                ],
                '管理员用户': [
                    { method: 'GET', path: '/api/v1/admin-users', summary: '获取管理员用户分页列表', operationId: 'getAdminUsers' },
                    { method: 'POST', path: '/api/v1/admin-users', summary: '创建管理员用户', operationId: 'createAdminUser' },
                    { method: 'GET', path: '/api/v1/admin-users/{id}', summary: '获取管理员用户详情', operationId: 'getAdminUser' },
                    { method: 'PUT', path: '/api/v1/admin-users/{id}', summary: '更新管理员用户', operationId: 'updateAdminUser' },
                    { method: 'DELETE', path: '/api/v1/admin-users/{id}', summary: '删除管理员用户', operationId: 'deleteAdminUser' }
                ],
                '权限管理': [
                    { method: 'GET', path: '/api/v1/permissions', summary: '获取权限树形结构', operationId: 'getPermissions' },
                    { method: 'POST', path: '/api/v1/permissions', summary: '创建权限', operationId: 'createPermission' },
                    { method: 'GET', path: '/api/v1/permissions/{id}', summary: '获取权限详情', operationId: 'getPermission' },
                    { method: 'PUT', path: '/api/v1/permissions/{id}', summary: '更新权限', operationId: 'updatePermission' },
                    { method: 'DELETE', path: '/api/v1/permissions/{id}', summary: '删除权限', operationId: 'deletePermission' }
                ],
                '角色管理': [
                    { method: 'GET', path: '/api/v1/roles', summary: '获取角色列表', operationId: 'getRoles' },
                    { method: 'GET', path: '/api/v1/roles/all', summary: '获取所有角色', operationId: 'getAllRoles' },
                    { method: 'POST', path: '/api/v1/roles', summary: '创建角色', operationId: 'createRole' },
                    { method: 'GET', path: '/api/v1/roles/{id}', summary: '获取角色详情', operationId: 'getRole' },
                    { method: 'PUT', path: '/api/v1/roles/{id}', summary: '更新角色', operationId: 'updateRole' },
                    { method: 'DELETE', path: '/api/v1/roles/{id}', summary: '删除角色', operationId: 'deleteRole' }
                ],
                '部门管理': [
                    { method: 'GET', path: '/api/v1/departments', summary: '获取部门树形结构', operationId: 'getDepartments' },
                    { method: 'POST', path: '/api/v1/departments', summary: '创建部门', operationId: 'createDepartment' },
                    { method: 'GET', path: '/api/v1/departments/{id}', summary: '获取部门详情', operationId: 'getDepartment' },
                    { method: 'PUT', path: '/api/v1/departments/{id}', summary: '更新部门', operationId: 'updateDepartment' },
                    { method: 'DELETE', path: '/api/v1/departments/{id}', summary: '删除部门', operationId: 'deleteDepartment' }
                ]
            };

            navigationData = backupData;
            renderNavigation(backupData);
            isNavigationBuilt = true;
        }

        // 渲染导航
        function renderNavigation(tagGroups) {
            const navigation = document.getElementById('navigation');
            let html = '';
            
            Object.keys(tagGroups).forEach((tag, index) => {
                const isCollapsed = index > 0; // 第一个分组默认展开
                html += \`
                    <div class="nav-group \${isCollapsed ? 'collapsed' : ''}" data-tag="\${tag}">
                        <div class="nav-group-header" onclick="toggleGroup('\${tag}')">
                            <span>\${tag}</span>
                            <span class="icon">▼</span>
                        </div>
                        <div class="nav-group-items">
                \`;
                
                tagGroups[tag].forEach(item => {
                    html += \`
                        <div class="nav-item" onclick="showOperation('\${item.method}', '\${item.path}', '\${item.operationId}')" data-operation-id="\${item.operationId}">
                            <span class="nav-method \${item.method.toLowerCase()}">\${item.method}</span>
                            <div style="flex: 1; min-width: 0;">
                                <div class="nav-summary">\${item.summary}</div>
                                <div class="nav-path">\${item.path}</div>
                            </div>
                        </div>
                    \`;
                });
                
                html += \`
                        </div>
                    </div>
                \`;
            });
            
            navigation.innerHTML = html;
        }

        // 切换分组折叠状态
        function toggleGroup(tag) {
            const group = document.querySelector(\`[data-tag="\${tag}"]\`);
            group.classList.toggle('collapsed');
        }

        // 切换侧边栏
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
        }

        // 显示操作详情
        function showOperation(method, path, operationId) {
            console.log('显示操作:', method, path, operationId);
            
            // 更新活动项（先更新，避免状态问题）
            if (currentActiveItem) {
                currentActiveItem.classList.remove('active');
            }
            
            const newActiveItem = document.querySelector(\`[data-operation-id="\${operationId}"]\`);
            if (newActiveItem) {
                newActiveItem.classList.add('active');
                currentActiveItem = newActiveItem;
            }
            
            // 隐藏欢迎屏幕和swagger-ui
            const welcomeScreen = document.getElementById('welcomeScreen');
            const swaggerUI = document.getElementById('swagger-ui');
            
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
            }
            if (swaggerUI) {
                swaggerUI.style.display = 'none';
            }
            
            // 强制显示自定义的API详情页面
            showCustomAPIDetails(method, path, operationId);
        }

        // 显示自定义API详情页面
        function showCustomAPIDetails(method, path, operationId) {
            const contentWrapper = document.querySelector('.content-wrapper');
            
            if (!contentWrapper) {
                console.error('内容容器未找到');
                return;
            }
            
            // 从导航数据中查找API详情
            let apiDetails = null;
            Object.keys(navigationData).forEach(tag => {
                navigationData[tag].forEach(item => {
                    if (item.operationId === operationId) {
                        apiDetails = item;
                    }
                });
            });
            
            if (!apiDetails) {
                console.warn('未找到API详情:', operationId);
                // 使用基本信息作为后备
                apiDetails = {
                    summary: \`\${method.toUpperCase()} \${path}\`,
                    operationId: operationId
                };
            }
            
            // 清空现有内容，确保重新渲染
            contentWrapper.innerHTML = '';
            
            // 延迟一下确保DOM更新
            setTimeout(() => {
                const detailsHTML = \`
                <div class="api-details-page">
                    <div class="api-header">
                        <div class="api-title-row">
                            <span class="api-method \${method.toLowerCase()}">\${method}</span>
                            <h1 class="api-title">\${apiDetails.summary}</h1>
                        </div>
                        <div class="api-path">
                            <code>\${path}</code>
                        </div>
                    </div>
                    
                    <div class="api-content">
                        <div class="api-section">
                            <h3>📋 基本信息</h3>
                            <table class="info-table">
                                <tr>
                                    <td class="label">请求方法</td>
                                    <td><span class="method-badge \${method.toLowerCase()}">\${method}</span></td>
                                </tr>
                                <tr>
                                    <td class="label">接口地址</td>
                                    <td><code class="path-code">\${path}</code></td>
                                </tr>
                                <tr>
                                    <td class="label">接口描述</td>
                                    <td>\${apiDetails.summary}</td>
                                </tr>
                                <tr>
                                    <td class="label">内容类型</td>
                                    <td><code>application/json</code></td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="api-section">
                            <h3>📥 请求参数</h3>
                            <table class="params-table">
                                <thead>
                                    <tr>
                                        <th>参数名称</th>
                                        <th>参数类型</th>
                                        <th>必填</th>
                                        <th>数据类型</th>
                                        <th>说明</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${generateParametersRows(method, path)}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="api-section">
                            <h3>📤 响应格式</h3>
                            <table class="response-table">
                                <thead>
                                    <tr>
                                        <th>状态码</th>
                                        <th>说明</th>
                                        <th>数据格式</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span class="status-code success">200</span></td>
                                        <td>请求成功</td>
                                        <td>
                                            <div class="response-example">
                                                <pre><code>{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1640995200000
}</code></pre>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><span class="status-code error">400</span></td>
                                        <td>请求参数错误</td>
                                        <td>
                                            <div class="response-example">
                                                <pre><code>{
  "code": 400,
  "message": "参数验证失败",
  "data": null,
  "timestamp": 1640995200000
}</code></pre>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><span class="status-code error">401</span></td>
                                        <td>未授权访问</td>
                                        <td>
                                            <div class="response-example">
                                                <pre><code>{
  "code": 401,
  "message": "未授权访问",
  "data": null,
  "timestamp": 1640995200000
}</code></pre>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="api-section">
                            <h3>🧪 在线测试</h3>
                            <div class="test-panel">
                                <div class="test-url">
                                    <label>请求地址:</label>
                                    <input type="text" value="http://localhost:3000\${path}" readonly class="url-input">
                                </div>
                                <div class="test-params">
                                    <label>请求参数:</label>
                                    <textarea class="params-input" placeholder="请输入JSON格式的请求参数..." rows="4"></textarea>
                                </div>
                                <div class="test-actions">
                                    <button class="test-btn" onclick="executeTest('\${method}', '\${path}')">发送请求</button>
                                    <button class="clear-btn" onclick="clearTest()">清空</button>
                                </div>
                                <div class="test-result" id="testResult" style="display: none;">
                                    <label>响应结果:</label>
                                    <pre class="result-content"></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
            
            contentWrapper.innerHTML = detailsHTML;
            }, 10); // 延迟10ms确保DOM更新
        }

        // 生成参数表格行
        function generateParametersRows(method, path) {
            const commonParams = {
                'GET': [
                    { name: 'page', type: 'query', required: false, dataType: 'integer', desc: '页码，默认1' },
                    { name: 'size', type: 'query', required: false, dataType: 'integer', desc: '每页数量，默认10' },
                    { name: 'keyword', type: 'query', required: false, dataType: 'string', desc: '搜索关键词' }
                ],
                'POST': [
                    { name: 'Content-Type', type: 'header', required: true, dataType: 'string', desc: 'application/json' },
                    { name: 'body', type: 'body', required: true, dataType: 'object', desc: '请求体数据' }
                ],
                'PUT': [
                    { name: 'Content-Type', type: 'header', required: true, dataType: 'string', desc: 'application/json' },
                    { name: 'id', type: 'path', required: true, dataType: 'string', desc: '资源ID' },
                    { name: 'body', type: 'body', required: true, dataType: 'object', desc: '更新数据' }
                ],
                'DELETE': [
                    { name: 'id', type: 'path', required: true, dataType: 'string', desc: '要删除的资源ID' }
                ]
            };

            // 检查路径参数
            const pathParams = path.match(/{([^}]+)}/g) || [];
            let params = [...(commonParams[method] || [])];
            
            pathParams.forEach(param => {
                const paramName = param.replace(/{|}/g, '');
                if (!params.find(p => p.name === paramName)) {
                    params.unshift({
                        name: paramName,
                        type: 'path',
                        required: true,
                        dataType: 'string',
                        desc: \`路径参数: \${paramName}\`
                    });
                }
            });

            if (params.length === 0) {
                return '<tr><td colspan="5" class="no-params">此接口无需参数</td></tr>';
            }

            return params.map(param => \`
                <tr>
                    <td class="param-name">\${param.name}</td>
                    <td><span class="param-type \${param.type}">\${param.type}</span></td>
                    <td><span class="required-\${param.required}">\${param.required ? '是' : '否'}</span></td>
                    <td class="data-type">\${param.dataType}</td>
                    <td class="param-desc">\${param.desc}</td>
                </tr>
            \`).join('');
        }

        // 搜索功能
        function initializeSearch() {
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const navItems = document.querySelectorAll('.nav-item');
                
                navItems.forEach(item => {
                    const summary = item.querySelector('.nav-summary').textContent.toLowerCase();
                    const path = item.querySelector('.nav-path').textContent.toLowerCase();
                    
                    if (summary.includes(searchTerm) || path.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = searchTerm ? 'none' : 'flex';
                    }
                });
                
                // 如果有搜索词，展开所有分组
                if (searchTerm) {
                    document.querySelectorAll('.nav-group').forEach(group => {
                        group.classList.remove('collapsed');
                    });
                }
            });
        }

        // 初始化UI
        function initializeUI() {
            initializeSearch();
            
            // 默认显示欢迎屏幕
            document.getElementById('welcomeScreen').style.display = 'flex';
            document.getElementById('swagger-ui').style.display = 'none';
            
            // 如果导航没有构建，尝试再次构建
            if (!isNavigationBuilt) {
                console.log('导航未构建，尝试使用备用数据...');
                buildNavigationFromBackup();
            }
        }

        // 移动端适配
        function handleMobileView() {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.add('show');
                
                // 点击内容区域时隐藏侧边栏
                document.querySelector('.content-area').addEventListener('click', function() {
                    sidebar.classList.remove('show');
                });
            }
        }

        // 窗口大小改变时的处理
        window.addEventListener('resize', handleMobileView);
        
        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            handleMobileView();
        });

        // 执行API测试
        function executeTest(method, path) {
            const urlInput = document.querySelector('.url-input');
            const paramsInput = document.querySelector('.params-input');
            const testResult = document.getElementById('testResult');
            const resultContent = testResult.querySelector('.result-content');
            
            const url = urlInput.value;
            let requestBody = null;
            
            // 解析请求参数
            if (paramsInput.value.trim()) {
                try {
                    requestBody = JSON.parse(paramsInput.value);
                } catch (e) {
                    resultContent.textContent = 'JSON格式错误: ' + e.message;
                    testResult.style.display = 'block';
                    return;
                }
            }
            
            // 显示加载状态
            resultContent.textContent = '正在发送请求...';
            testResult.style.display = 'block';
            
            // 构建请求选项
            const requestOptions = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            if (requestBody && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                requestOptions.body = JSON.stringify(requestBody);
            }
            
            // 发送请求
            fetch(url, requestOptions)
                .then(response => {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json().then(data => ({
                            status: response.status,
                            statusText: response.statusText,
                            data: data
                        }));
                    } else {
                        return response.text().then(text => ({
                            status: response.status,
                            statusText: response.statusText,
                            data: text
                        }));
                    }
                })
                .then(result => {
                    const responseText = \`状态码: \${result.status} \${result.statusText}

响应数据:
\${typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : result.data}\`;
                    
                    resultContent.textContent = responseText;
                })
                .catch(error => {
                    resultContent.textContent = '请求失败: ' + error.message;
                });
        }
        
        // 清空测试
        function clearTest() {
            const paramsInput = document.querySelector('.params-input');
            const testResult = document.getElementById('testResult');
            
            paramsInput.value = '';
            testResult.style.display = 'none';
        }

        // 显示使用指南
        function showUsageGuide() {
            const contentWrapper = document.querySelector('.content-wrapper');
            const guideHTML = \`
                <div class="usage-guide-page">
                    <div class="guide-header">
                        <h1>📚 API接口文档使用指南</h1>
                        <p>欢迎使用微信小程序商城系统API接口文档！这里是您的完整使用指南。</p>
                    </div>
                    
                    <div class="guide-content">
                        <div class="guide-section">
                            <h2>🚀 快速开始</h2>
                            <div class="guide-card">
                                <h3>1. 浏览API接口</h3>
                                <p>点击左侧菜单中的任意接口，右侧会显示详细的接口信息，包括请求参数、响应格式等。</p>
                            </div>
                            <div class="guide-card">
                                <h3>2. 在线测试</h3>
                                <p>每个接口页面都提供了在线测试功能，您可以直接在文档中测试API接口。</p>
                            </div>
                            <div class="guide-card">
                                <h3>3. 查看响应</h3>
                                <p>测试完成后，会显示完整的响应结果，包括状态码和返回数据。</p>
                            </div>
                        </div>

                        <div class="guide-section">
                            <h2>🔗 接口分类说明</h2>
                            <div class="api-categories">
                                <div class="category-item">
                                    <span class="category-icon">🏥</span>
                                    <div class="category-info">
                                        <h4>健康检查</h4>
                                        <p>系统状态监控接口，用于检查服务是否正常运行</p>
                                    </div>
                                </div>
                                <div class="category-item">
                                    <span class="category-icon">🔐</span>
                                    <div class="category-info">
                                        <h4>Auth 认证模块</h4>
                                        <p>微信小程序登录、令牌管理、用户认证相关接口</p>
                                    </div>
                                </div>
                                <div class="category-item">
                                    <span class="category-icon">👤</span>
                                    <div class="category-info">
                                        <h4>管理员用户</h4>
                                        <p>后台管理员用户的增删改查操作</p>
                                    </div>
                                </div>
                                <div class="category-item">
                                    <span class="category-icon">🔑</span>
                                    <div class="category-info">
                                        <h4>权限管理</h4>
                                        <p>系统权限控制，权限树管理</p>
                                    </div>
                                </div>
                                <div class="category-item">
                                    <span class="category-icon">👨‍💼</span>
                                    <div class="category-info">
                                        <h4>角色管理</h4>
                                        <p>用户角色管理，角色权限分配</p>
                                    </div>
                                </div>
                                <div class="category-item">
                                    <span class="category-icon">🏢</span>
                                    <div class="category-info">
                                        <h4>部门管理</h4>
                                        <p>组织架构管理，部门树形结构</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="guide-section">
                            <h2>📖 如何阅读接口文档</h2>
                            <div class="guide-card">
                                <h3>📋 基本信息</h3>
                                <p>显示接口的请求方法、地址、描述等基础信息。</p>
                            </div>
                            <div class="guide-card">
                                <h3>📥 请求参数</h3>
                                <p>详细列出所有请求参数，包括参数类型、是否必填、数据类型和说明。</p>
                                <ul>
                                    <li><strong>query</strong>: URL查询参数</li>
                                    <li><strong>path</strong>: 路径参数</li>
                                    <li><strong>header</strong>: 请求头参数</li>
                                    <li><strong>body</strong>: 请求体参数</li>
                                </ul>
                            </div>
                            <div class="guide-card">
                                <h3>📤 响应格式</h3>
                                <p>展示不同状态码对应的响应格式和示例数据。</p>
                            </div>
                            <div class="guide-card">
                                <h3>🧪 在线测试</h3>
                                <p>提供实时测试功能，输入参数后点击"发送请求"即可测试接口。</p>
                            </div>
                        </div>

                        <div class="guide-section">
                            <h2>⚡ 使用技巧</h2>
                            <div class="tips-grid">
                                <div class="tip-item">
                                    <span class="tip-icon">🔍</span>
                                    <h4>搜索功能</h4>
                                    <p>使用左侧搜索框可以快速找到需要的接口</p>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">📱</span>
                                    <h4>响应式设计</h4>
                                    <p>支持移动端查看，随时随地查阅文档</p>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">🎨</span>
                                    <h4>颜色标识</h4>
                                    <p>不同颜色代表不同的HTTP方法和参数类型</p>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">📋</span>
                                    <h4>复制粘贴</h4>
                                    <p>可以直接复制接口地址和示例数据</p>
                                </div>
                            </div>
                        </div>

                        <div class="guide-section">
                            <h2>🔧 开发环境配置</h2>
                            <div class="config-info">
                                <h3>服务器地址</h3>
                                <div class="server-list">
                                    <div class="server-item">
                                        <strong>开发环境:</strong> <code>http://localhost:3000</code>
                                    </div>
                                    <div class="server-item">
                                        <strong>测试环境:</strong> <code>https://api-test.example.com</code>
                                    </div>
                                    <div class="server-item">
                                        <strong>生产环境:</strong> <code>https://api.example.com</code>
                                    </div>
                                </div>
                                
                                <h3>认证方式</h3>
                                <p>API使用JWT Bearer Token认证，请在请求头中添加：</p>
                                <pre class="auth-example"><code>Authorization: Bearer YOUR_ACCESS_TOKEN</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
            
            contentWrapper.innerHTML = guideHTML;
        }
    </script>
</body>
</html>
`;

/**
 * Swagger UI中间件
 */
export const swaggerUI = () => {
  return async (ctx: Context, next: Next) => {
    if (ctx.path === '/api-docs' || ctx.path === '/api-docs/') {
      try {
        const specUrl = '/api-docs/swagger.json';
        ctx.type = 'text/html';
        ctx.body = getSwaggerHTML(specUrl);
      } catch (err) {
        logger.error('生成Swagger UI失败:', err);
        ctx.status = 500;
        ctx.body = { error: '文档生成失败' };
      }
    } else if (ctx.path === '/api-docs/swagger.json') {
      try {
        ctx.type = 'application/json';
        ctx.body = swaggerSpec;
      } catch (err) {
        logger.error('生成Swagger JSON失败:', err);
        ctx.status = 500;
        ctx.body = { error: 'API规范生成失败' };
      }
    } else {
      await next();
    }
  };
};

/**
 * 文档重定向中间件
 */
export const docsRedirect = () => {
  return async (ctx: Context, next: Next) => {
    if (ctx.path === '/docs' || ctx.path === '/api' || ctx.path === '/swagger') {
      ctx.redirect('/api-docs');
    } else {
      await next();
    }
  };
};