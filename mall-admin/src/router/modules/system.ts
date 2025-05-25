/**
 * 系统管理路由配置
 * 包含用户、角色、权限、部门管理等页面路由
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';

// 系统管理路由配置
export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      permissions: ['system:view'],
    },
    children: [
      // 管理员用户管理
      {
        path: '/system/user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '管理员用户',
          icon: 'User',
          permissions: ['system:user:view'],
        },
      },

      // 部门管理
      {
        path: '/system/department',
        name: 'SystemDepartment',
        component: () => import('@/views/system/department/index.vue'),
        meta: {
          title: '部门管理',
          icon: 'OfficeBuilding',
          permissions: ['system:department:view'],
        },
      },

      // 角色管理
      {
        path: '/system/role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'UserFilled',
          permissions: ['system:role:view'],
        },
      },

      // 权限管理
      {
        path: '/system/permission',
        name: 'SystemPermission',
        component: () => import('@/views/system/permission/index.vue'),
        meta: {
          title: '权限管理',
          icon: 'Lock',
          permissions: ['system:permission:view'],
        },
      },
    ],
  },
]; 