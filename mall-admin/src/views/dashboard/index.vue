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
          <div class="welcome-actions">
            <el-button type="primary" @click="refreshStats" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" v-for="stat in statsData" :key="stat.title">
          <el-card class="stat-card" v-loading="loading">
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
              <div class="card-header">
                <h3>系统状态</h3>
                <el-button type="primary" text @click="refreshStats" :loading="loading">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </template>
            <div class="system-info">
              <div class="info-item">
                <span class="info-label">系统版本：</span>
                <span class="info-value">{{ systemInfo.version }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">运行时间：</span>
                <span class="info-value">{{ systemInfo.uptime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">数据库大小：</span>
                <span class="info-value">{{ systemInfo.databaseSize }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后更新：</span>
                <span class="info-value">{{ currentTime }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12">
          <el-card>
            <template #header>
              <h3>快捷操作</h3>
            </template>
            <el-space direction="vertical" fill>
              <el-button type="primary" @click="goToUsers">
                <el-icon><User /></el-icon>
                用户管理
              </el-button>
              <el-button type="success" @click="goToRoles">
                <el-icon><UserFilled /></el-icon>
                角色管理
              </el-button>
              <el-button type="warning" @click="goToPermissions">
                <el-icon><Lock /></el-icon>
                权限管理
              </el-button>
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
 * 系统首页，展示基本信息和真实统计数据
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Refresh, User, UserFilled, Lock } from '@element-plus/icons-vue';
import { formatDateTime } from '@/utils';
import { getDashboardStats, getSystemInfo, type DashboardStats, type SystemInfo } from '@/api';

const router = useRouter();

// 加载状态
const loading = ref(false);

// 当前时间
const currentTime = ref('');

// 统计数据
const statsData = ref([
  {
    title: '用户总数',
    value: '0',
    key: 'userCount',
  },
  {
    title: '订单总数', 
    value: '0',
    key: 'orderCount',
  },
  {
    title: '商品总数',
    value: '0',
    key: 'productCount',
  },
  {
    title: '今日访问',
    value: '0',
    key: 'todayVisits',
  },
]);

// 系统信息
const systemInfo = ref<SystemInfo>({
  version: '1.0.0',
  uptime: '-',
  lastBackupTime: '-',
  databaseSize: '-',
});

// 获取统计数据
const fetchStats = async () => {
  try {
    loading.value = true;
    const response = await getDashboardStats();
    
    if (response.code === 200 && response.data) {
      const data = response.data;
      
      // 更新统计数据
      statsData.value.forEach(stat => {
        const key = stat.key as keyof DashboardStats;
        if (data[key] !== undefined) {
          stat.value = formatNumber(data[key]);
        }
      });
    } else {
      throw new Error(response.message || '获取统计数据失败');
    }
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    ElMessage.error(error.message || '获取统计数据失败，显示默认值');
    
    // 发生错误时使用默认值
    statsData.value.forEach(stat => {
      stat.value = '-';
    });
  } finally {
    loading.value = false;
  }
};

// 获取系统信息
const fetchSystemInfo = async () => {
  try {
    const response = await getSystemInfo();
    
    if (response.code === 200 && response.data) {
      systemInfo.value = response.data;
    }
  } catch (error: any) {
    console.error('获取系统信息失败:', error);
    // 系统信息获取失败不影响页面主要功能，只记录错误
  }
};

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

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

// 刷新统计数据
const refreshStats = () => {
  fetchStats();
  fetchSystemInfo();
};

onMounted(() => {
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
  
  // 获取统计数据
  fetchStats();
  fetchSystemInfo();
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
    margin: 0 0 20px 0;
  }

  .welcome-actions {
    margin-top: 16px;
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

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }

  .system-info {
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }

    .info-label {
      width: 100px;
      font-size: 14px;
      color: #666;
      flex-shrink: 0;
    }

    .info-value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  }

  .el-space {
    width: 100%;
    
    .el-button {
      width: 100%;
      justify-content: flex-start;
      
      .el-icon {
        margin-right: 8px;
      }
    }
  }
}
</style> 