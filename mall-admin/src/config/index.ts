/**
 * 应用配置
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

// 应用基础配置
export const config = {
  // 应用信息
  app: {
    title: '微信小程序商城管理系统',
    version: '1.0.0',
    description: '基于Vue3 + TypeScript + Element Plus的后台管理系统',
  },
  
  // API 配置
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  
  // 开发配置
  dev: {
    port: Number(import.meta.env.VITE_DEV_PORT) || 5173,
    open: import.meta.env.VITE_DEV_OPEN === 'true',
  },
  
  // 存储key
  storage: {
    token: 'admin_token',
    refreshToken: 'admin_refresh_token',
    userInfo: 'admin_user_info',
    permissions: 'admin_permissions',
    menus: 'admin_menus',
    settings: 'admin_settings',
  },
  
  // 分页配置
  pagination: {
    defaultPageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  
  // 表格配置
  table: {
    defaultSize: 'default' as 'large' | 'default' | 'small',
    stripe: true,
    border: true,
    highlightCurrentRow: true,
  },
  
  // 上传配置
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    action: '/api/v1/upload',
  },
} as const;

// 系统状态配置
export const statusConfig = {
  user: {
    0: { label: '禁用', type: 'danger' },
    1: { label: '启用', type: 'success' },
  },
  department: {
    0: { label: '禁用', type: 'danger' },
    1: { label: '启用', type: 'success' },
  },
  role: {
    0: { label: '禁用', type: 'danger' },
    1: { label: '启用', type: 'success' },
  },
  permission: {
    0: { label: '禁用', type: 'danger' },
    1: { label: '启用', type: 'success' },
  },
} as const;

// 权限类型配置
export const permissionTypeConfig = {
  menu: { label: '菜单', type: 'primary' },
  button: { label: '按钮', type: 'success' },
  api: { label: '接口', type: 'warning' },
} as const; 