/**
 * 仪表盘相关API
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { request } from '@/utils/request';

// 统计数据类型
export interface DashboardStats {
  userCount: number;      // 用户总数
  orderCount: number;     // 订单总数
  productCount: number;   // 商品总数
  todayVisits: number;    // 今日访问量
}

// 系统信息类型
export interface SystemInfo {
  version: string;        // 系统版本
  uptime: string;        // 运行时间
  lastBackupTime: string; // 最后备份时间
  databaseSize: string;   // 数据库大小
}

/**
 * 获取仪表盘统计数据
 */
export const getDashboardStats = () => {
  return request.get<DashboardStats>('/dashboard/stats');
};

/**
 * 获取系统信息
 */
export const getSystemInfo = () => {
  return request.get<SystemInfo>('/dashboard/system-info');
};

/**
 * 获取最近活动
 */
export const getRecentActivities = () => {
  return request.get<any[]>('/dashboard/recent-activities');
}; 