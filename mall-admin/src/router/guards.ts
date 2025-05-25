/**
 * 路由守卫配置
 * 处理权限验证、登录状态检查、页面加载等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import type { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { useAppStore } from '@/store/modules/app';
import { config } from '@/config';

// 免登录白名单
const whiteList = ['/login', '/404', '/403', '/500'];

/**
 * 设置路由守卫
 */
export function setupRouterGuards(router: Router) {
  // 全局前置守卫
  router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore();
    const appStore = useAppStore();

    // 开始加载
    appStore.setLoading(true);

    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - ${config.app.title}`;
    } else {
      document.title = config.app.title;
    }

    // 检查是否有token，如果没有则创建一个临时token用于开发
    let hasToken = !!userStore.token;
    
    // 开发环境：如果没有token且不是登录页，创建一个临时token
    if (!hasToken && to.path !== '/login' && import.meta.env.DEV) {
      // 设置临时token用于开发调试
      userStore.token = 'dev-temp-token';
      localStorage.setItem(config.storage.token, 'dev-temp-token');
      hasToken = true; // 更新hasToken状态
    }

    if (hasToken) {
      // 已登录
      if (to.path === '/login') {
        // 如果已登录，访问登录页则重定向到首页
        next({ path: '/dashboard' });
      } else {
        // 暂时跳过复杂的权限验证，直接允许访问
        // TODO: 后续连接真实API后再启用完整的权限验证
        next();
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path) || to.meta.noAuth) {
        // 在免登录白名单中或页面标记为无需认证，直接访问
        next();
      } else {
        // 需要登录，重定向到登录页
        next({ path: '/login', query: { redirect: to.fullPath } });
      }
    }
  });

  // 全局后置守卫
  router.afterEach((to, _from) => {
    const appStore = useAppStore();

    // 结束加载
    appStore.setLoading(false);

    // 添加标签页
    if (to.meta.title && !to.meta.hidden) {
      appStore.addTab({
        title: to.meta.title as string,
        path: to.path,
        name: to.name as string,
      });
    }

    // 更新面包屑
    updateBreadcrumbs(to, appStore);
  });

  // 全局错误处理
  router.onError((error) => {
    console.error('路由错误:', error);
    ElMessage.error('页面加载失败，请稍后重试');
  });
}

// TODO: 权限检查函数 - 后续连接真实API时启用
// function hasPermission(route: any, userStore: any): boolean {
//   if (!route.meta?.permissions || route.meta.permissions.length === 0) {
//     return true;
//   }
//   if (!userStore.permissions || userStore.permissions.length === 0) {
//     return false;
//   }
//   const routePermissions = route.meta.permissions as string[];
//   return routePermissions.some((permission: string) => 
//     userStore.permissions.includes(permission)
//   );
// }

/**
 * 更新面包屑
 */
function updateBreadcrumbs(route: any, appStore: any) {
  const matched = route.matched.filter((item: any) => item.meta && item.meta.title);
  
  const breadcrumbs = matched.map((item: any) => ({
    title: item.meta.title,
    path: item.path === route.path ? undefined : item.path,
  }));

  appStore.setBreadcrumbs(breadcrumbs);
} 