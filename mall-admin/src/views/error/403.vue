<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-image">
        <img src="/403.svg" alt="403" />
      </div>
      <div class="error-info">
        <h1 class="error-title">403</h1>
        <p class="error-desc">抱歉，您没有权限访问该页面</p>
        <div class="error-actions">
          <el-button type="primary" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 403权限错误页面
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { useRouter } from 'vue-router';
import { HomeFilled, Back } from '@element-plus/icons-vue';

const router = useRouter();

const goHome = () => {
  router.push('/dashboard');
};

const goBack = () => {
  router.go(-1);
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
  color: #f5222d;
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