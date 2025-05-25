<template>
  <div class="login-page">
    <div class="login-background">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
    
    <div class="login-container">
      <!-- 左侧介绍区域 -->
      <div class="login-intro">
        <div class="intro-content">
          <h1 class="intro-title">{{ config.app.title }}</h1>
          <p class="intro-desc">现代化的微信小程序商城管理系统</p>
          <div class="intro-features">
            <div class="feature-item">
              <el-icon><ShoppingCart /></el-icon>
              <span>商品管理</span>
            </div>
            <div class="feature-item">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </div>
            <div class="feature-item">
              <el-icon><TrendCharts /></el-icon>
              <span>数据分析</span>
            </div>
            <div class="feature-item">
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-container">
        <div class="login-form-wrapper">
          <div class="login-header">
            <h2 class="login-title">欢迎登录</h2>
            <p class="login-subtitle">请输入您的账号密码</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            size="large"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                clearable
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                clearable
              />
            </el-form-item>

            <el-form-item>
              <div class="login-options">
                <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
                <el-button type="primary" link>忘记密码？</el-button>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="loading"
                @click="handleLogin"
              >
                <span v-if="!loading">登录</span>
                <span v-else>登录中...</span>
              </el-button>
            </el-form-item>
          </el-form>

          <div class="login-footer">
            <p class="copyright">© 2024 {{ config.app.title }}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 登录页面
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { config } from '@/config';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 表单引用
const loginFormRef = ref<FormInstance>();

// 登录表单
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  remember: false,
});

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
};

// 加载状态
const loading = ref(false);

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();
    
    loading.value = true;
    
    // 执行登录
    await userStore.login({
      username: loginForm.username,
      password: loginForm.password,
    });

    ElMessage.success('登录成功');
    
    // 跳转到目标页面或首页
    const redirect = route.query.redirect as string;
    router.push(redirect || '/dashboard');
    
  } catch (error: any) {
    console.error('登录失败:', error);
    ElMessage.error(error.message || '登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
  
  &.shape-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }
  
  &.shape-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 15%;
    animation-delay: 2s;
  }
  
  &.shape-3 {
    width: 100px;
    height: 100px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.login-container {
  position: relative;
  height: 100%;
  display: flex;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.login-intro {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: white;
  
  @media (max-width: 768px) {
    flex: none;
    padding: 40px 20px;
  }
}

.intro-content {
  max-width: 500px;
  text-align: center;
}

.intro-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
}

.intro-desc {
  font-size: 18px;
  margin: 0 0 40px 0;
  opacity: 0.9;
}

.intro-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.15);
  }
  
  .el-icon {
    font-size: 32px;
    margin-bottom: 8px;
    color: #fff;
  }
  
  span {
    font-size: 14px;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    
    .el-icon {
      font-size: 24px;
    }
    
    span {
      font-size: 12px;
    }
  }
}

.login-form-container {
  width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  
  @media (max-width: 768px) {
    width: 100%;
    flex: 1;
  }
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 60px 40px;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }
  
  :deep(.el-input__inner) {
    height: 48px;
    border-radius: 8px;
  }
  
  :deep(.el-input__prefix) {
    color: #999;
  }
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.login-footer {
  margin-top: 40px;
  text-align: center;
}

.copyright {
  font-size: 12px;
  color: #999;
  margin: 0;
}
</style> 