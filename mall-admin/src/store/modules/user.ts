/**
 * 用户状态管理
 * 处理用户登录、注销、用户信息等状态
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { defineStore } from 'pinia';
import { config } from '@/config';
import { login, logout, getCurrentUser } from '@/api';
import type { AdminUser, LoginRequest, LoginResponse } from '@/types';

interface UserState {
  // 用户信息
  userInfo: AdminUser | null;
  // 访问令牌
  token: string | null;
  // 刷新令牌
  refreshToken: string | null;
  // 用户权限
  permissions: string[];
  // 用户菜单
  menus: any[];
  // 登录状态
  isLoggedIn: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    token: localStorage.getItem(config.storage.token),
    refreshToken: localStorage.getItem(config.storage.refreshToken),
    permissions: JSON.parse(localStorage.getItem(config.storage.permissions) || '[]'),
    menus: JSON.parse(localStorage.getItem(config.storage.menus) || '[]'),
    isLoggedIn: !!localStorage.getItem(config.storage.token),
  }),

  getters: {
    /**
     * 获取用户名
     */
    username: (state) => state.userInfo?.username || '',

    /**
     * 获取用户真实姓名
     */
    realName: (state) => state.userInfo?.realName || '',

    /**
     * 获取用户头像
     */
    avatar: (state) => state.userInfo?.avatar || '',

    /**
     * 获取用户所属部门
     */
    department: (state) => state.userInfo?.department?.name || '',

    /**
     * 获取用户角色列表
     */
    roles: (state) => state.userInfo?.roles?.map(role => role.name) || [],

    /**
     * 检查是否有指定权限
     */
    hasPermission: (state) => {
      return (permission: string) => {
        return state.permissions.includes(permission);
      };
    },

    /**
     * 检查是否有任意一个权限
     */
    hasAnyPermission: (state) => {
      return (permissions: string[]) => {
        return permissions.some(permission => state.permissions.includes(permission));
      };
    },

    /**
     * 检查是否有所有权限
     */
    hasAllPermissions: (state) => {
      return (permissions: string[]) => {
        return permissions.every(permission => state.permissions.includes(permission));
      };
    },
  },

  actions: {
    /**
     * 用户登录
     */
    async login(loginData: LoginRequest): Promise<LoginResponse> {
      try {
        const response = await login(loginData);
        const { token, refreshToken, userInfo, permissions, menus } = response.data;

        // 更新状态
        this.token = token;
        this.refreshToken = refreshToken;
        this.userInfo = userInfo;
        this.permissions = permissions;
        this.menus = menus;
        this.isLoggedIn = true;

        // 保存到本地存储
        localStorage.setItem(config.storage.token, token);
        localStorage.setItem(config.storage.refreshToken, refreshToken);
        localStorage.setItem(config.storage.userInfo, JSON.stringify(userInfo));
        localStorage.setItem(config.storage.permissions, JSON.stringify(permissions));
        localStorage.setItem(config.storage.menus, JSON.stringify(menus));

        return response.data;
      } catch (error) {
        // 清除状态
        this.clearUserData();
        throw error;
      }
    },

    /**
     * 用户登出
     */
    async logout(): Promise<void> {
      try {
        if (this.token) {
          await logout();
        }
      } catch (error) {
        console.error('登出请求失败:', error);
      } finally {
        // 清除用户数据
        this.clearUserData();
      }
    },

    /**
     * 获取当前用户信息
     */
    async fetchUserInfo(): Promise<AdminUser> {
      try {
        const response = await getCurrentUser();
        const userInfo = response.data;
        
        this.userInfo = userInfo;
        localStorage.setItem(config.storage.userInfo, JSON.stringify(userInfo));
        
        return userInfo;
      } catch (error) {
        // 如果获取用户信息失败，清除登录状态
        this.clearUserData();
        throw error;
      }
    },

    /**
     * 更新用户信息
     */
    updateUserInfo(userInfo: Partial<AdminUser>): void {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...userInfo };
        localStorage.setItem(config.storage.userInfo, JSON.stringify(this.userInfo));
      }
    },

    /**
     * 更新权限
     */
    updatePermissions(permissions: string[]): void {
      this.permissions = permissions;
      localStorage.setItem(config.storage.permissions, JSON.stringify(permissions));
    },

    /**
     * 更新菜单
     */
    updateMenus(menus: any[]): void {
      this.menus = menus;
      localStorage.setItem(config.storage.menus, JSON.stringify(menus));
    },

    /**
     * 清除用户数据
     */
    clearUserData(): void {
      this.userInfo = null;
      this.token = null;
      this.refreshToken = null;
      this.permissions = [];
      this.menus = [];
      this.isLoggedIn = false;

      // 清除本地存储
      localStorage.removeItem(config.storage.token);
      localStorage.removeItem(config.storage.refreshToken);
      localStorage.removeItem(config.storage.userInfo);
      localStorage.removeItem(config.storage.permissions);
      localStorage.removeItem(config.storage.menus);
    },

    /**
     * 重置状态
     */
    resetState(): void {
      this.clearUserData();
    },

    /**
     * 从本地存储恢复状态
     */
    restoreFromStorage(): void {
      const token = localStorage.getItem(config.storage.token);
      const refreshToken = localStorage.getItem(config.storage.refreshToken);
      const userInfoStr = localStorage.getItem(config.storage.userInfo);
      const permissionsStr = localStorage.getItem(config.storage.permissions);
      const menusStr = localStorage.getItem(config.storage.menus);

      if (token) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.isLoggedIn = true;

        if (userInfoStr) {
          try {
            this.userInfo = JSON.parse(userInfoStr);
          } catch (error) {
            console.error('解析用户信息失败:', error);
          }
        }

        if (permissionsStr) {
          try {
            this.permissions = JSON.parse(permissionsStr);
          } catch (error) {
            console.error('解析权限信息失败:', error);
          }
        }

        if (menusStr) {
          try {
            this.menus = JSON.parse(menusStr);
          } catch (error) {
            console.error('解析菜单信息失败:', error);
          }
        }
      }
    },
  },
}); 