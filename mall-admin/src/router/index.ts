/**
 * Vue Router 路由配置
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// 导入路由模块
import { basicRoutes } from './modules/basic';
import { systemRoutes } from './modules/system';
import { setupRouterGuards } from './guards';

// 所有静态路由
const routes: RouteRecordRaw[] = [
  ...basicRoutes,
  ...systemRoutes,
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 设置路由守卫
setupRouterGuards(router);

export default router; 