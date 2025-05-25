/**
 * Pinia状态管理主配置
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { createPinia } from 'pinia';

// 创建pinia实例
const pinia = createPinia();

export default pinia;

// 导出各个状态模块
export * from './modules/user';
export * from './modules/permission';
export * from './modules/app'; 