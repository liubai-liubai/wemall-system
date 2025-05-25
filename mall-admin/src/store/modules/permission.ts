/**
 * 权限状态管理
 * 处理菜单权限、按钮权限、路由权限等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { defineStore } from 'pinia';
import type { Permission, MenuItem } from '@/types';

interface PermissionState {
  // 所有权限列表
  permissions: Permission[];
  // 菜单权限
  menuPermissions: Permission[];
  // 按钮权限
  buttonPermissions: Permission[];
  // API权限
  apiPermissions: Permission[];
  // 动态路由
  dynamicRoutes: any[];
  // 菜单列表
  menuList: MenuItem[];
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    permissions: [],
    menuPermissions: [],
    buttonPermissions: [],
    apiPermissions: [],
    dynamicRoutes: [],
    menuList: [],
  }),

  getters: {
    /**
     * 获取菜单树
     */
    menuTree: (state) => {
      return buildMenuTree(state.menuPermissions);
    },

    /**
     * 获取扁平化的菜单列表
     */
    flatMenuList: (state) => {
      return flattenMenu(state.menuList);
    },

    /**
     * 检查按钮权限
     */
    hasButtonPermission: (state) => {
      return (code: string) => {
        return state.buttonPermissions.some(permission => permission.code === code);
      };
    },

    /**
     * 检查API权限
     */
    hasApiPermission: (state) => {
      return (code: string) => {
        return state.apiPermissions.some(permission => permission.code === code);
      };
    },

    /**
     * 获取所有权限代码
     */
    allPermissionCodes: (state) => {
      return state.permissions.map(permission => permission.code);
    },
  },

  actions: {
    /**
     * 设置权限列表
     */
    setPermissions(permissions: Permission[]): void {
      this.permissions = permissions;
      
      // 按类型分类权限
      this.menuPermissions = permissions.filter(p => p.type === 'menu');
      this.buttonPermissions = permissions.filter(p => p.type === 'button');
      this.apiPermissions = permissions.filter(p => p.type === 'api');
    },

    /**
     * 设置菜单列表
     */
    setMenuList(menuList: MenuItem[]): void {
      this.menuList = menuList;
    },

    /**
     * 设置动态路由
     */
    setDynamicRoutes(routes: any[]): void {
      this.dynamicRoutes = routes;
    },

    /**
     * 生成路由
     */
    generateRoutes(userPermissions: string[]): any[] {
      // 过滤用户有权限的菜单
      const accessibleMenus = this.menuPermissions.filter(menu => 
        userPermissions.includes(menu.code)
      );

      // 转换为路由格式
      const routes = accessibleMenus.map(menu => ({
        path: menu.path,
        name: menu.code,
        component: menu.component,
        meta: {
          title: menu.name,
          icon: menu.icon,
          permissions: [menu.code],
        },
      }));

      this.setDynamicRoutes(routes);
      return routes;
    },

    /**
     * 重置权限状态
     */
    resetPermissions(): void {
      this.permissions = [];
      this.menuPermissions = [];
      this.buttonPermissions = [];
      this.apiPermissions = [];
      this.dynamicRoutes = [];
      this.menuList = [];
    },
  },
});

/**
 * 构建菜单树
 */
function buildMenuTree(permissions: Permission[]): MenuItem[] {
  const menuMap = new Map<string, MenuItem>();
  const tree: MenuItem[] = [];

  // 创建菜单映射
  permissions.forEach(permission => {
    const menuItem: MenuItem = {
      id: permission.id,
      title: permission.name,
      path: permission.path || '',
      icon: permission.icon,
      component: permission.component,
      children: [],
    };
    menuMap.set(permission.id, menuItem);
  });

  // 构建树形结构
  permissions.forEach(permission => {
    const menuItem = menuMap.get(permission.id)!;
    if (permission.parentId) {
      const parent = menuMap.get(permission.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(menuItem);
      }
    } else {
      tree.push(menuItem);
    }
  });

  // 移除空的children数组
  function removeEmptyChildren(items: MenuItem[]) {
    items.forEach(item => {
      if (item.children && item.children.length === 0) {
        delete item.children;
      } else if (item.children) {
        removeEmptyChildren(item.children);
      }
    });
  }

  removeEmptyChildren(tree);
  return tree;
}

/**
 * 扁平化菜单
 */
function flattenMenu(menuList: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];

  function traverse(items: MenuItem[]) {
    items.forEach(item => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    });
  }

  traverse(menuList);
  return result;
} 