<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <el-card class="welcome-card">
        <div class="welcome-content">
          <h1 class="welcome-title">
            欢迎使用微信小程序商城管理系统！
          </h1>
          <p class="welcome-desc">
            系统运行正常，所有功能已准备就绪。
          </p>
        </div>
      </el-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" v-for="stat in statsData" :key="stat.title">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <el-card>
            <template #header>
              <h3>系统状态</h3>
            </template>
            <p>系统运行正常</p>
            <p>最后更新时间：{{ currentTime }}</p>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12">
          <el-card>
            <template #header>
              <h3>快捷操作</h3>
            </template>
            <el-space direction="vertical" fill>
              <el-button type="primary" @click="goToUsers">用户管理</el-button>
              <el-button type="success" @click="goToRoles">角色管理</el-button>
              <el-button type="warning" @click="goToPermissions">权限管理</el-button>
            </el-space>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 仪表盘页面 - 简化版
 * 系统首页，展示基本信息
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { formatDateTime } from '@/utils';

const router = useRouter();

// 当前时间
const currentTime = ref('');

// 统计数据
const statsData = ref([
  {
    title: '用户总数',
    value: '1,234',
  },
  {
    title: '订单总数',
    value: '5,678',
  },
  {
    title: '商品总数',
    value: '999',
  },
  {
    title: '今日访问',
    value: '888',
  },
]);

// 跳转到用户管理
const goToUsers = () => {
  router.push('/system/user');
};

// 跳转到角色管理
const goToRoles = () => {
  router.push('/system/role');
};

// 跳转到权限管理
const goToPermissions = () => {
  router.push('/system/permission');
};

// 更新当前时间
const updateCurrentTime = () => {
  currentTime.value = formatDateTime(new Date());
};

onMounted(() => {
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 0;
}

.welcome-section {
  margin-bottom: 20px;
}

.welcome-card {
  .welcome-content {
    text-align: center;
    padding: 20px;
  }

  .welcome-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .welcome-desc {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
}

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  .stat-content {
    text-align: center;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #1890ff;
    margin-bottom: 8px;
  }

  .stat-title {
    font-size: 14px;
    color: #666;
  }
}

.content-section {
  .el-card {
    margin-bottom: 20px;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
}
</style> 