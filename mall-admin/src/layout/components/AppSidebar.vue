<template>
  <div class="sidebar-container">
    <!-- Logo区域 -->
    <div class="sidebar-logo-container" :class="{ 'collapse': !appStore.sidebarOpened }">
      <div class="sidebar-logo-link">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          class="sidebar-logo"
          @error="handleLogoError"
        />
        <h1 v-show="appStore.sidebarOpened" class="sidebar-title">
          {{ config.app.title }}
        </h1>
      </div>
    </div>

    <!-- 导航菜单 -->
    <el-scrollbar class="sidebar-menu-container">
      <el-menu
        :default-active="activeMenu"
        :collapse="!appStore.sidebarOpened"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
        @select="handleMenuSelect"
      >
        <SidebarMenuItem
          v-for="route in menuRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
/**
 * 侧边栏组件
 * 包含Logo和导航菜单
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/store/modules/app';
import { config } from '@/config';
import SidebarMenuItem from './SidebarMenuItem.vue';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = route;
  return path;
});

// 菜单路由（过滤掉隐藏的路由）
const menuRoutes = computed(() => {
  return router.getRoutes().filter(route => {
    // 如果路由被隐藏，不显示
    if (route.meta?.hidden) {
      return false;
    }
    
    // 如果没有meta信息，不显示
    if (!route.meta) {
      return false;
    }
    
    // 如果标记为alwaysShow或者有子菜单，显示
    return route.meta.alwaysShow || (route.children && route.children.length > 0);
  });
});

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  if (index !== route.path) {
    router.push(index);
  }
  
  // 移动端选择菜单后关闭侧边栏
  if (appStore.isMobile) {
    appStore.closeSidebar();
  }
};

// Logo加载错误处理
const handleLogoError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
};
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo-container {
  height: 64px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &.collapse {
    padding: 12px 16px;
    justify-content: center;
  }
}

.sidebar-logo-link {
  display: flex;
  align-items: center;
  width: 100%;
  text-decoration: none;
  color: #fff;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-menu-container {
  flex: 1;
  
  :deep(.el-scrollbar__view) {
    height: 100%;
  }
}

:deep(.el-menu) {
  border-right: none;
  height: 100%;
  overflow: visible;

  // 菜单项样式
  .el-menu-item {
    position: relative;
    margin: 4px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(24, 144, 255, 0.1) !important;
      color: #1890ff !important;
    }

    &.is-active {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
      color: #fff !important;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);

      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 20px;
        background: #1890ff;
        border-radius: 2px;
      }
    }

    .el-icon {
      margin-right: 8px;
      font-size: 18px;
    }
  }

  // 子菜单样式
  .el-submenu {
    margin: 4px 12px;
    border-radius: 8px;
    overflow: hidden;

    .el-submenu__title {
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(24, 144, 255, 0.1) !important;
        color: #1890ff !important;
      }

      .el-icon {
        margin-right: 8px;
        font-size: 18px;
      }
    }

    .el-menu {
      background: rgba(0, 0, 0, 0.2);

      .el-menu-item {
        margin: 2px 8px;
        
        &::before {
          display: none;
        }
      }
    }
  }

  // 折叠状态样式
  &.el-menu--collapse {
    .el-menu-item,
    .el-submenu {
      margin: 4px 8px;
    }

    .el-menu-item {
      &.is-active::before {
        left: -8px;
      }
    }
  }
}
</style> 