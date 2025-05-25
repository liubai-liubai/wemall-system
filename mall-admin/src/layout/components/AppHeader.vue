<template>
  <div class="app-header">
    <div class="header-left">
      <!-- 折叠按钮 -->
      <div class="hamburger-container" @click="toggleSidebar">
        <el-icon class="hamburger" :class="{ 'is-active': appStore.sidebarOpened }">
          <Fold v-if="appStore.sidebarOpened" />
          <Expand v-else />
        </el-icon>
      </div>

      <!-- 面包屑 -->
      <el-breadcrumb class="app-breadcrumb" separator="/">
        <el-breadcrumb-item
          v-for="(item, index) in appStore.breadcrumbs"
          :key="index"
          :to="item.path ? { path: item.path } : undefined"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <!-- 搜索 -->
      <div class="header-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索菜单..."
          prefix-icon="Search"
          size="small"
          clearable
          @input="handleSearch"
        />
      </div>

      <!-- 通知 -->
      <el-dropdown class="header-notification" trigger="click">
        <div class="notification-trigger">
          <el-badge :value="12" :max="99">
            <el-icon><Bell /></el-icon>
          </el-badge>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <div class="notification-header">
              <span>通知中心</span>
              <el-button type="primary" link size="small">查看全部</el-button>
            </div>
            <el-scrollbar max-height="300px">
              <div class="notification-list">
                <div class="notification-item" v-for="i in 5" :key="i">
                  <div class="notification-avatar">
                    <el-avatar :size="32" icon="User" />
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">系统通知 {{ i }}</div>
                    <div class="notification-desc">这是一条系统通知信息...</div>
                    <div class="notification-time">2分钟前</div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 全屏 -->
      <div class="header-fullscreen" @click="toggleFullscreen">
        <el-tooltip content="全屏" placement="bottom">
          <el-icon>
            <FullScreen v-if="!isFullscreen" />
            <Aim v-else />
          </el-icon>
        </el-tooltip>
      </div>

      <!-- 设置 -->
      <div class="header-setting">
        <el-tooltip content="系统设置" placement="bottom">
          <el-icon @click="showSettings = true">
            <Setting />
          </el-icon>
        </el-tooltip>
      </div>

      <!-- 用户信息 -->
      <el-dropdown class="header-user" trigger="click">
        <div class="user-trigger">
          <el-avatar :size="32" :src="userStore.avatar" icon="User" />
          <span class="user-name">{{ userStore.realName || userStore.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToProfile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item @click="changePassword">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 设置面板 -->
    <el-drawer
      v-model="showSettings"
      title="系统设置"
      direction="rtl"
      size="300px"
    >
      <AppSettings />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
/**
 * 头部组件
 * 包含面包屑、用户信息、设置等功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAppStore } from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';
import AppSettings from './AppSettings.vue';

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

// 搜索关键词
const searchKeyword = ref('');
// 是否显示设置面板
const showSettings = ref(false);
// 是否全屏
const isFullscreen = ref(false);

// 切换侧边栏
const toggleSidebar = () => {
  appStore.toggleSidebar();
};

// 搜索处理
const handleSearch = (value: string) => {
  // TODO: 实现菜单搜索功能
  console.log('搜索:', value);
};

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};

// 监听全屏状态变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement;
});

// 跳转到个人中心
const goToProfile = () => {
  router.push('/profile');
};

// 修改密码
const changePassword = () => {
  router.push('/profile/password');
};

// 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await userStore.logout();
    ElMessage.success('退出登录成功');
    router.push('/login');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出登录失败:', error);
      ElMessage.error('退出登录失败');
    }
  }
};
</script>

<style lang="scss" scoped>
.app-header {
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.hamburger-container {
  padding: 0 15px;
  cursor: pointer;

  .hamburger {
    font-size: 20px;
    color: #5a5e66;
    transition: color 0.3s ease;

    &:hover {
      color: #1890ff;
    }

    &.is-active {
      color: #1890ff;
    }
  }
}

.app-breadcrumb {
  margin-left: 20px;
  
  :deep(.el-breadcrumb__inner) {
    color: #97a8be;
    
    &.is-link {
      color: #1890ff;
      
      &:hover {
        color: #40a9ff;
      }
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-search {
  width: 200px;
}

.header-notification,
.header-fullscreen,
.header-setting {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }

  .el-icon {
    font-size: 18px;
    color: #5a5e66;
  }
}

.notification-trigger,
.user-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-trigger {
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }

  .user-name {
    margin: 0 8px;
    font-size: 14px;
    color: #333;
  }

  .el-icon {
    font-size: 12px;
    color: #999;
  }
}

.notification-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.notification-list {
  padding: 0;
}

.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: #f9f9f9;
  }

  &:last-child {
    border-bottom: none;
  }
}

.notification-avatar {
  margin-right: 12px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.notification-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 12px;
  color: #ccc;
}
</style> 