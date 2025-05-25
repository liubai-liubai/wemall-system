<template>
  <div class="app-settings">
    <!-- 整体风格设置 -->
    <div class="setting-section">
      <h4 class="setting-title">整体风格设置</h4>
      <div class="theme-picker">
        <div
          class="theme-item"
          :class="{ 'is-active': appStore.theme === 'light' }"
          @click="handleThemeChange('light')"
        >
          <div class="theme-preview light-theme">
            <div class="theme-header"></div>
            <div class="theme-body">
              <div class="theme-sidebar"></div>
              <div class="theme-content"></div>
            </div>
          </div>
          <span class="theme-name">亮色主题</span>
        </div>
        
        <div
          class="theme-item"
          :class="{ 'is-active': appStore.theme === 'dark' }"
          @click="handleThemeChange('dark')"
        >
          <div class="theme-preview dark-theme">
            <div class="theme-header"></div>
            <div class="theme-body">
              <div class="theme-sidebar"></div>
              <div class="theme-content"></div>
            </div>
          </div>
          <span class="theme-name">暗色主题</span>
        </div>
      </div>
    </div>

    <!-- 主题色设置 -->
    <div class="setting-section">
      <h4 class="setting-title">主题色</h4>
      <div class="color-picker">
        <div
          v-for="color in themeColors"
          :key="color.value"
          class="color-item"
          :class="{ 'is-active': currentThemeColor === color.value }"
          :style="{ backgroundColor: color.value }"
          @click="handleColorChange(color.value)"
        >
          <el-icon v-if="currentThemeColor === color.value" class="color-check">
            <Check />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 导航模式 -->
    <div class="setting-section">
      <h4 class="setting-title">导航模式</h4>
      <div class="nav-mode">
        <el-radio-group v-model="navMode" @change="handleNavModeChange">
          <el-radio label="side">侧边菜单布局</el-radio>
          <el-radio label="top">顶部菜单布局</el-radio>
          <el-radio label="mix">混合菜单布局</el-radio>
        </el-radio-group>
      </div>
    </div>

    <!-- 系统设置 -->
    <div class="setting-section">
      <h4 class="setting-title">系统设置</h4>
      
      <div class="setting-item">
        <span class="setting-label">开启标签页</span>
        <el-switch v-model="showTabs" @change="handleTabsChange" />
      </div>
      
      <div class="setting-item">
        <span class="setting-label">固定头部</span>
        <el-switch v-model="fixedHeader" @change="handleFixedHeaderChange" />
      </div>
      
      <div class="setting-item">
        <span class="setting-label">侧边栏Logo</span>
        <el-switch v-model="sidebarLogo" @change="handleSidebarLogoChange" />
      </div>
      
      <div class="setting-item">
        <span class="setting-label">水印</span>
        <el-switch v-model="watermark" @change="handleWatermarkChange" />
      </div>
    </div>

    <!-- 其他设置 -->
    <div class="setting-section">
      <h4 class="setting-title">其他设置</h4>
      
      <div class="setting-item">
        <span class="setting-label">语言</span>
        <el-select v-model="language" size="small" @change="handleLanguageChange">
          <el-option label="简体中文" value="zh-cn" />
          <el-option label="English" value="en" />
        </el-select>
      </div>
      
      <div class="setting-item">
        <span class="setting-label">组件尺寸</span>
        <el-select v-model="componentSize" size="small" @change="handleSizeChange">
          <el-option label="大" value="large" />
          <el-option label="默认" value="default" />
          <el-option label="小" value="small" />
        </el-select>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="setting-actions">
      <el-button type="primary" @click="saveSettings">
        <el-icon><Check /></el-icon>
        保存设置
      </el-button>
      <el-button @click="resetSettings">
        <el-icon><RefreshLeft /></el-icon>
        重置设置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 系统设置组件
 * 提供主题、布局等个性化设置
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useAppStore } from '@/store/modules/app';

const appStore = useAppStore();

// 当前主题色
const currentThemeColor = ref('#1890ff');

// 导航模式
const navMode = ref('side');

// 系统设置
const showTabs = ref(true);
const fixedHeader = ref(true);
const sidebarLogo = ref(true);
const watermark = ref(false);

// 其他设置
const language = computed({
  get: () => appStore.language,
  set: (val) => appStore.setLanguage(val)
});

const componentSize = computed({
  get: () => appStore.size,
  set: (val) => appStore.setSize(val)
});

// 主题色选项
const themeColors = [
  { name: '拂晓蓝', value: '#1890ff' },
  { name: '薄暮', value: '#722ed1' },
  { name: '火山', value: '#fa541c' },
  { name: '日暮', value: '#faad14' },
  { name: '明青', value: '#13c2c2' },
  { name: '极光绿', value: '#52c41a' },
  { name: '极客蓝', value: '#2f54eb' },
  { name: '酱紫', value: '#722ed1' },
];

// 主题切换
const handleThemeChange = (theme: 'light' | 'dark') => {
  appStore.setTheme(theme);
  ElMessage.success(`已切换到${theme === 'light' ? '亮色' : '暗色'}主题`);
};

// 主题色切换
const handleColorChange = (color: string) => {
  currentThemeColor.value = color;
  // 更新CSS变量
  document.documentElement.style.setProperty('--el-color-primary', color);
  ElMessage.success('主题色已更新');
};

// 导航模式切换
const handleNavModeChange = (mode: string) => {
  ElMessage.success(`已切换到${mode === 'side' ? '侧边' : mode === 'top' ? '顶部' : '混合'}菜单布局`);
};

// 标签页设置
const handleTabsChange = (value: boolean) => {
  ElMessage.success(`已${value ? '开启' : '关闭'}标签页`);
};

// 固定头部设置
const handleFixedHeaderChange = (value: boolean) => {
  ElMessage.success(`已${value ? '固定' : '取消固定'}头部`);
};

// 侧边栏Logo设置
const handleSidebarLogoChange = (value: boolean) => {
  ElMessage.success(`已${value ? '显示' : '隐藏'}侧边栏Logo`);
};

// 水印设置
const handleWatermarkChange = (value: boolean) => {
  ElMessage.success(`已${value ? '开启' : '关闭'}水印`);
};

// 语言切换
const handleLanguageChange = (lang: string) => {
  ElMessage.success(`语言已切换为${lang === 'zh-cn' ? '简体中文' : 'English'}`);
};

// 组件尺寸切换
const handleSizeChange = (size: string) => {
  ElMessage.success(`组件尺寸已设置为${size === 'large' ? '大' : size === 'default' ? '默认' : '小'}`);
};

// 保存设置
const saveSettings = () => {
  // 这里可以将设置保存到服务器
  ElMessage.success('设置已保存');
};

// 重置设置
const resetSettings = () => {
  appStore.resetAppState();
  currentThemeColor.value = '#1890ff';
  navMode.value = 'side';
  showTabs.value = true;
  fixedHeader.value = true;
  sidebarLogo.value = true;
  watermark.value = false;
  
  // 重置CSS变量
  document.documentElement.style.setProperty('--el-color-primary', '#1890ff');
  
  ElMessage.success('设置已重置');
};
</script>

<style lang="scss" scoped>
.app-settings {
  padding: 20px;
}

.setting-section {
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }
}

.setting-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.theme-picker {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.theme-item {
  cursor: pointer;
  text-align: center;
  
  &.is-active {
    .theme-preview {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
}

.theme-preview {
  width: 100%;
  height: 60px;
  border: 2px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  
  &.light-theme {
    .theme-header {
      height: 12px;
      background: #fff;
      border-bottom: 1px solid #eee;
    }
    
    .theme-body {
      display: flex;
      height: calc(100% - 12px);
      
      .theme-sidebar {
        width: 30%;
        background: #001529;
      }
      
      .theme-content {
        flex: 1;
        background: #f0f2f5;
      }
    }
  }
  
  &.dark-theme {
    .theme-header {
      height: 12px;
      background: #1f1f1f;
      border-bottom: 1px solid #333;
    }
    
    .theme-body {
      display: flex;
      height: calc(100% - 12px);
      
      .theme-sidebar {
        width: 30%;
        background: #000;
      }
      
      .theme-content {
        flex: 1;
        background: #141414;
      }
    }
  }
}

.theme-name {
  font-size: 12px;
  color: #666;
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.color-item {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &.is-active {
    border-color: #fff;
    box-shadow: 0 0 0 2px currentColor;
  }
  
  .color-check {
    color: #fff;
    font-size: 16px;
  }
}

.nav-mode {
  :deep(.el-radio) {
    display: block;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.setting-label {
  font-size: 14px;
  color: #333;
}

.setting-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
  
  .el-button {
    flex: 1;
  }
}
</style> 