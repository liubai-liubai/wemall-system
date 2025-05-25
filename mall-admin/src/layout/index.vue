<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <div
      class="app-sidebar-container"
      :class="{
        'sidebar-hide': !appStore.sidebarOpened,
        'sidebar-mobile': appStore.isMobile
      }"
    >
      <AppSidebar />
    </div>

    <!-- 主内容区域 -->
    <div class="app-main-container" :class="{ 'main-hide-sidebar': !appStore.sidebarOpened }">
      <!-- 头部 -->
      <div class="app-header-container">
        <AppHeader />
      </div>

      <!-- 标签页 -->
      <div class="app-tabs-container">
        <AppTabs />
      </div>

      <!-- 内容区域 -->
      <div class="app-content-container">
        <router-view v-slot="{ Component, route }">
          <transition name="page-fade" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>

      <!-- 返回顶部 -->
      <el-backtop :right="100" :bottom="50" />
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="appStore.isMobile && appStore.sidebarOpened"
      class="mobile-mask"
      @click="appStore.closeSidebar()"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 主布局组件
 * 包含侧边栏、头部、内容区域等
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/store/modules/app';
import AppSidebar from './components/AppSidebar.vue';
import AppHeader from './components/AppHeader.vue';
import AppTabs from './components/AppTabs.vue';

const appStore = useAppStore();

// 缓存的视图
const cachedViews = computed(() => {
  return appStore.tabs.map(tab => tab.name);
});

// 响应式处理
const handleResize = () => {
  const rect = document.body.getBoundingClientRect();
  const isMobile = rect.width < 768;
  
  appStore.setDevice(isMobile ? 'mobile' : 'desktop');
  
  if (isMobile && appStore.sidebarOpened) {
    appStore.closeSidebar(true);
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
}

.app-sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  z-index: 1001;
  background: #001529;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &.sidebar-hide {
    width: 80px;
  }

  &.sidebar-mobile {
    width: 260px;
    transform: translateX(-100%);

    &:not(.sidebar-hide) {
      transform: translateX(0);
    }
  }
}

.app-main-container {
  margin-left: 260px;
  min-height: 100vh;
  background: #f0f2f5;
  transition: all 0.3s ease;

  &.main-hide-sidebar {
    margin-left: 80px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
  }
}

.app-header-container {
  height: 64px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: sticky;
  top: 0;
  z-index: 9;
}

.app-tabs-container {
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 64px;
  z-index: 8;
}

.app-content-container {
  padding: 20px;
  min-height: calc(100vh - 124px);
  overflow-x: hidden;
}

.mobile-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

// 页面切换动画
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style> 