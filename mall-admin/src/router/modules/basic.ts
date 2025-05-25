/**
 * 基础路由配置
 * 包含登录、404、首页等基础页面路由
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';

// 基础路由配置
export const basicRoutes: RouteRecordRaw[] = [
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: {
      title: '登录',
      hidden: true,
      noAuth: true,
    },
  },

  // 主布局
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      // 仪表盘
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'Dashboard',
          affix: true,
        },
      },
    ],
  },

  // 404页面
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      hidden: true,
    },
  },

  // 403页面
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '访问被拒绝',
      hidden: true,
    },
  },

  // 500页面
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: '服务器错误',
      hidden: true,
    },
  },

  // 捕获所有未匹配的路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]; 