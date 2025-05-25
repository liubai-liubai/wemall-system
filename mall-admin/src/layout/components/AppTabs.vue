<template>
  <div class="app-tabs">
    <div class="tabs-content">
      <el-scrollbar class="tabs-scrollbar">
        <div class="tabs-nav">
          <div
            v-for="tab in appStore.tabs"
            :key="tab.path"
            class="tab-item"
            :class="{
              'is-active': appStore.activeTab === tab.path,
              'is-affix': tab.closable === false
            }"
            @click="handleTabClick(tab)"
            @contextmenu.prevent="handleContextMenu(tab, $event)"
          >
            <span class="tab-title">{{ tab.title }}</span>
            <el-icon
              v-if="tab.closable !== false"
              class="tab-close"
              @click.stop="handleTabRemove(tab.path)"
            >
              <Close />
            </el-icon>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <div class="tabs-actions">
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button type="primary" text>
          <el-icon><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh">
              <el-icon><Refresh /></el-icon>
              刷新当前页
            </el-dropdown-item>
            <el-dropdown-item command="closeOthers" :disabled="appStore.tabs.length <= 1">
              <el-icon><Close /></el-icon>
              关闭其他
            </el-dropdown-item>
            <el-dropdown-item command="closeAll" :disabled="appStore.closableTabs.length === 0">
              <el-icon><FolderDelete /></el-icon>
              关闭所有
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 右键菜单 -->
    <div
      v-show="contextMenuVisible"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
      class="context-menu"
      @blur="hideContextMenu"
      tabindex="-1"
    >
      <div class="context-menu-item" @click="refreshTab">
        <el-icon><Refresh /></el-icon>
        刷新
      </div>
      <div
        v-if="selectedTab?.closable !== false"
        class="context-menu-item"
        @click="closeTab"
      >
        <el-icon><Close /></el-icon>
        关闭
      </div>
      <div class="context-menu-item" @click="closeOtherTabs">
        <el-icon><Close /></el-icon>
        关闭其他
      </div>
      <div class="context-menu-item" @click="closeAllTabs">
        <el-icon><FolderDelete /></el-icon>
        关闭所有
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 标签页组件
 * 支持多标签页切换和关闭功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Refresh, Close, FolderDelete, ArrowDown } from '@element-plus/icons-vue';
import { useAppStore } from '@/store/modules/app';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

// 右键菜单相关
const contextMenuVisible = ref(false);
const contextMenuLeft = ref(0);
const contextMenuTop = ref(0);
const selectedTab = ref<any>(null);

// 标签页点击
const handleTabClick = (tab: any) => {
  if (tab.path !== route.path) {
    router.push(tab.path);
  }
};

// 标签页移除
const handleTabRemove = (path: string) => {
  if (appStore.tabs.length <= 1) {
    ElMessage.warning('至少保留一个标签页');
    return;
  }
  appStore.removeTab(path);
};

// 右键菜单
const handleContextMenu = (tab: any, event: MouseEvent) => {
  selectedTab.value = tab;
  contextMenuVisible.value = true;
  contextMenuLeft.value = event.clientX;
  contextMenuTop.value = event.clientY;

  nextTick(() => {
    const contextMenu = document.querySelector('.context-menu') as HTMLElement;
    if (contextMenu) {
      contextMenu.focus();
    }
  });
};

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenuVisible.value = false;
  selectedTab.value = null;
};

// 刷新标签页
const refreshTab = () => {
  if (selectedTab.value) {
    router.replace({
      path: '/redirect' + selectedTab.value.path,
    });
  }
  hideContextMenu();
};

// 关闭标签页
const closeTab = () => {
  if (selectedTab.value && selectedTab.value.closable !== false) {
    appStore.removeTab(selectedTab.value.path);
  }
  hideContextMenu();
};

// 关闭其他标签页
const closeOtherTabs = () => {
  appStore.closeOtherTabs();
  hideContextMenu();
};

// 关闭所有标签页
const closeAllTabs = () => {
  appStore.closeAllTabs();
  hideContextMenu();
};

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  switch (command) {
    case 'refresh':
      router.replace({
        path: '/redirect' + route.path,
      });
      break;
    case 'closeOthers':
      appStore.closeOtherTabs();
      break;
    case 'closeAll':
      appStore.closeAllTabs();
      break;
  }
};

// 点击其他地方隐藏右键菜单
document.addEventListener('click', () => {
  hideContextMenu();
});
</script>

<style lang="scss" scoped>
.app-tabs {
  height: 40px;
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.tabs-content {
  flex: 1;
  height: 100%;
}

.tabs-scrollbar {
  height: 100%;

  :deep(.el-scrollbar__bar) {
    display: none;
  }
}

.tabs-nav {
  display: flex;
  height: 40px;
  align-items: center;
  padding: 0 4px;
}

.tab-item {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  margin-right: 4px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: #e6f7ff;
    border-color: #91d5ff;
  }

  &.is-active {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;

    .tab-close {
      color: #fff;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  &.is-affix {
    background: #f0f2f5;
    border-color: #d9d9d9;

    &.is-active {
      background: #1890ff;
      border-color: #1890ff;
      color: #fff;
    }
  }
}

.tab-title {
  font-size: 12px;
  line-height: 1;
}

.tab-close {
  margin-left: 8px;
  padding: 2px;
  border-radius: 2px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.tabs-actions {
  padding: 0 8px;
  border-left: 1px solid #e8e8e8;
}

.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 120px;
  outline: none;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f5f7fa;
    color: #409eff;
  }

  .el-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}
</style> 