<template>
  <div id="app">
    <!-- 全局加载遮罩 -->
    <el-loading
      v-if="appStore.loading"
      :lock="true"
      text="加载中..."
      background="rgba(0, 0, 0, 0.7)"
    />
    
    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
/**
 * Vue主应用组件
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { onMounted } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';

const appStore = useAppStore();
const userStore = useUserStore();

// 应用初始化
onMounted(() => {
  try {
    // 恢复应用设置
    appStore.restoreSettings();
    
    // 恢复用户状态
    userStore.restoreFromStorage();
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
  overflow-x: hidden;
}

// 确保页面内容可见
body {
  margin: 0;
  padding: 0;
}
</style> 