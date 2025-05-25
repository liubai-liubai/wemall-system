/**
 * 应用状态管理
 * 处理应用设置、侧边栏、主题等状态
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { defineStore } from 'pinia';
import { config } from '@/config';

interface AppState {
  // 侧边栏状态
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
  };
  // 设备类型
  device: 'desktop' | 'mobile';
  // 应用大小
  size: 'large' | 'default' | 'small';
  // 语言
  language: string;
  // 主题
  theme: 'light' | 'dark';
  // 页面加载状态
  loading: boolean;
  // 面包屑
  breadcrumbs: Array<{
    title: string;
    path?: string;
  }>;
  // 标签页
  tabs: Array<{
    title: string;
    path: string;
    name: string;
    closable?: boolean;
  }>;
  // 当前激活的标签页
  activeTab: string;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebar: {
      opened: localStorage.getItem('sidebar-status') !== 'closed',
      withoutAnimation: false,
    },
    device: 'desktop',
    size: 'default',
    language: 'zh-cn',
    theme: 'light',
    loading: false,
    breadcrumbs: [],
    tabs: [
      {
        title: '首页',
        path: '/dashboard',
        name: 'Dashboard',
        closable: false,
      },
    ],
    activeTab: '/dashboard',
  }),

  getters: {
    /**
     * 侧边栏是否打开
     */
    sidebarOpened: (state) => state.sidebar.opened,

    /**
     * 是否为移动设备
     */
    isMobile: (state) => state.device === 'mobile',

    /**
     * 当前标签页
     */
    currentTab: (state) => {
      return state.tabs.find(tab => tab.path === state.activeTab);
    },

    /**
     * 可关闭的标签页
     */
    closableTabs: (state) => {
      return state.tabs.filter(tab => tab.closable !== false);
    },
  },

  actions: {
    /**
     * 切换侧边栏
     */
    toggleSidebar(): void {
      this.sidebar.opened = !this.sidebar.opened;
      this.sidebar.withoutAnimation = false;
      
      localStorage.setItem(
        'sidebar-status',
        this.sidebar.opened ? 'opened' : 'closed'
      );
    },

    /**
     * 关闭侧边栏
     */
    closeSidebar(withoutAnimation = false): void {
      this.sidebar.opened = false;
      this.sidebar.withoutAnimation = withoutAnimation;
      
      localStorage.setItem('sidebar-status', 'closed');
    },

    /**
     * 打开侧边栏
     */
    openSidebar(withoutAnimation = false): void {
      this.sidebar.opened = true;
      this.sidebar.withoutAnimation = withoutAnimation;
      
      localStorage.setItem('sidebar-status', 'opened');
    },

    /**
     * 设置设备类型
     */
    setDevice(device: 'desktop' | 'mobile'): void {
      this.device = device;
    },

    /**
     * 设置应用大小
     */
    setSize(size: 'large' | 'default' | 'small'): void {
      this.size = size;
      localStorage.setItem('app-size', size);
    },

    /**
     * 设置语言
     */
    setLanguage(language: string): void {
      this.language = language;
      localStorage.setItem('app-language', language);
    },

    /**
     * 设置主题
     */
    setTheme(theme: 'light' | 'dark'): void {
      this.theme = theme;
      localStorage.setItem('app-theme', theme);
      
      // 更新HTML根元素的class
      document.documentElement.className = theme;
    },

    /**
     * 设置加载状态
     */
    setLoading(loading: boolean): void {
      this.loading = loading;
    },

    /**
     * 设置面包屑
     */
    setBreadcrumbs(breadcrumbs: Array<{ title: string; path?: string }>): void {
      this.breadcrumbs = breadcrumbs;
    },

    /**
     * 添加标签页
     */
    addTab(tab: { title: string; path: string; name: string; closable?: boolean }): void {
      // 检查是否已存在
      const existingTab = this.tabs.find(t => t.path === tab.path);
      if (!existingTab) {
        this.tabs.push({
          closable: true,
          ...tab,
        });
      }
      this.activeTab = tab.path;
    },

    /**
     * 移除标签页
     */
    removeTab(path: string): void {
      const index = this.tabs.findIndex(tab => tab.path === path);
      if (index !== -1) {
        const tab = this.tabs[index];
        
        // 不能关闭不可关闭的标签页
        if (tab.closable === false) {
          return;
        }
        
        this.tabs.splice(index, 1);
        
        // 如果关闭的是当前激活的标签页，需要切换到其他标签页
        if (this.activeTab === path) {
          if (this.tabs.length > 0) {
            // 优先选择右侧的标签页，如果没有则选择左侧的
            const nextTab = this.tabs[index] || this.tabs[index - 1];
            this.activeTab = nextTab.path;
          }
        }
      }
    },

    /**
     * 设置激活的标签页
     */
    setActiveTab(path: string): void {
      this.activeTab = path;
    },

    /**
     * 关闭其他标签页
     */
    closeOtherTabs(): void {
      const currentTab = this.tabs.find(tab => tab.path === this.activeTab);
      this.tabs = this.tabs.filter(tab => 
        tab.closable === false || tab.path === this.activeTab
      );
    },

    /**
     * 关闭所有标签页
     */
    closeAllTabs(): void {
      this.tabs = this.tabs.filter(tab => tab.closable === false);
      if (this.tabs.length > 0) {
        this.activeTab = this.tabs[0].path;
      }
    },

    /**
     * 从本地存储恢复设置
     */
    restoreSettings(): void {
      // 恢复侧边栏状态
      const sidebarStatus = localStorage.getItem('sidebar-status');
      if (sidebarStatus) {
        this.sidebar.opened = sidebarStatus !== 'closed';
      }

      // 恢复应用大小
      const appSize = localStorage.getItem('app-size') as 'large' | 'default' | 'small';
      if (appSize) {
        this.size = appSize;
      }

      // 恢复语言设置
      const language = localStorage.getItem('app-language');
      if (language) {
        this.language = language;
      }

      // 恢复主题设置
      const theme = localStorage.getItem('app-theme') as 'light' | 'dark';
      if (theme) {
        this.setTheme(theme);
      }
    },

    /**
     * 重置应用状态
     */
    resetAppState(): void {
      this.sidebar = {
        opened: true,
        withoutAnimation: false,
      };
      this.device = 'desktop';
      this.size = 'default';
      this.language = 'zh-cn';
      this.theme = 'light';
      this.loading = false;
      this.breadcrumbs = [];
      this.tabs = [
        {
          title: '首页',
          path: '/dashboard',
          name: 'Dashboard',
          closable: false,
        },
      ];
      this.activeTab = '/dashboard';

      // 清除本地存储
      localStorage.removeItem('sidebar-status');
      localStorage.removeItem('app-size');
      localStorage.removeItem('app-language');
      localStorage.removeItem('app-theme');
    },
  },
}); 