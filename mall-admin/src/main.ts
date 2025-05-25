/**
 * Vue应用主入口文件
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { createApp } from 'vue';
import App from './App.vue';

// 路由
import router from './router';

// 状态管理
import pinia from './store';

// 样式
import 'element-plus/dist/index.css';
import '@/assets/styles/index.scss';

// Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 创建应用实例
const app = createApp(App);

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 挂载插件
app.use(pinia);
app.use(router);

// 挂载应用
app.mount('#app');

console.log('🚀 微信小程序商城管理系统启动成功！'); 