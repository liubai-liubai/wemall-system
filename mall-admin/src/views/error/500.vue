<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-image">
        <img src="/500.svg" alt="500" />
      </div>
      <div class="error-info">
        <h1 class="error-title">500</h1>
        <p class="error-desc">抱歉，服务器出现了错误</p>
        <div class="error-actions">
          <el-button type="primary" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button @click="refresh">
            <el-icon><Refresh /></el-icon>
            刷新页面
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 500服务器错误页面
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { useRouter } from 'vue-router';
import { HomeFilled, Refresh } from '@element-plus/icons-vue';

const router = useRouter();

const goHome = () => {
  router.push('/dashboard');
};

const refresh = () => {
  window.location.reload();
};
</script>

<style lang="scss" scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.error-content {
  display: flex;
  align-items: center;
  max-width: 600px;
  text-align: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.error-image {
  width: 200px;
  height: 200px;
  margin-right: 40px;
  
  @media (max-width: 768px) {
    margin: 0 0 30px 0;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.error-info {
  text-align: left;
  
  @media (max-width: 768px) {
    text-align: center;
  }
}

.error-title {
  font-size: 72px;
  font-weight: 600;
  color: #fa8c16;
  margin: 0 0 16px 0;
  line-height: 1;
}

.error-desc {
  font-size: 20px;
  color: #666;
  margin: 0 0 32px 0;
}

.error-actions {
  .el-button {
    margin-right: 16px;
    
    @media (max-width: 768px) {
      margin: 0 8px 16px 8px;
    }
  }
}
</style> 