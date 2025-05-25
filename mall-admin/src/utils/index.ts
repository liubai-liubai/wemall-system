/**
 * 通用工具函数
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import dayjs from 'dayjs';

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式
 * @returns 格式化后的字符串
 */
export const formatDateTime = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 格式化日期
 * @param date 日期
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date) => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

/**
 * 生成随机ID
 * @param length 长度
 * @returns 随机ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 防抖函数
 * @param fn 函数
 * @param delay 延迟时间
 * @returns 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay = 300) => {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * 节流函数
 * @param fn 函数
 * @param delay 延迟时间
 * @returns 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(fn: T, delay = 300) => {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (!timer) {
      timer = setTimeout(() => {
        fn(...args);
        timer = null;
      }, delay);
    }
  };
};

/**
 * 深拷贝
 * @param obj 对象
 * @returns 深拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  if (typeof obj === 'object') {
    const copy = {} as { [K in keyof T]: T[K] };
    Object.keys(obj).forEach(key => {
      copy[key as keyof T] = deepClone(obj[key as keyof T]);
    });
    return copy;
  }
  return obj;
};

/**
 * 树形数据转平铺数据
 * @param tree 树形数据
 * @param childrenKey 子节点key
 * @returns 平铺数据
 */
export const treeToFlat = <T extends Record<string, any>>(
  tree: T[],
  childrenKey = 'children'
): T[] => {
  const result: T[] = [];
  const stack = [...tree];
  
  while (stack.length) {
    const node = stack.pop()!;
    result.push(node);
    
    if (node[childrenKey] && node[childrenKey].length) {
      stack.push(...node[childrenKey]);
    }
  }
  
  return result;
};

/**
 * 平铺数据转树形数据
 * @param list 平铺数据
 * @param options 配置选项
 * @returns 树形数据
 */
export const flatToTree = <T extends Record<string, any>>(
  list: T[],
  options: {
    id?: string;
    parentId?: string;
    children?: string;
  } = {}
): T[] => {
  const { id = 'id', parentId = 'parentId', children = 'children' } = options;
  
  const map = new Map<string, T>();
  const tree: T[] = [];
  
  // 创建映射
  list.forEach(item => {
    map.set(item[id], { ...item, [children]: [] });
  });
  
  // 构建树形结构
  list.forEach(item => {
    const node = map.get(item[id])!;
    const parent = map.get(item[parentId]);
    
    if (parent) {
      parent[children].push(node);
    } else {
      tree.push(node);
    }
  });
  
  return tree;
};

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 扩展名
 */
export const getFileExtension = (filename: string) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export const downloadFile = (url: string, filename?: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || '';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 复制到剪贴板
 * @param text 文本
 * @returns 是否成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // 兼容旧浏览器
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
};

/**
 * 获取URL参数
 * @param key 参数名
 * @returns 参数值
 */
export const getUrlParam = (key: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
};

/**
 * 设置URL参数
 * @param params 参数对象
 */
export const setUrlParams = (params: Record<string, string>) => {
  const url = new URL(window.location.href);
  Object.keys(params).forEach(key => {
    url.searchParams.set(key, params[key]);
  });
  window.history.replaceState({}, '', url.toString());
};

/**
 * 验证邮箱格式
 * @param email 邮箱
 * @returns 是否有效
 */
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export const isValidPhone = (phone: string) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证身份证号格式
 * @param idCard 身份证号
 * @returns 是否有效
 */
export const isValidIdCard = (idCard: string) => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardRegex.test(idCard);
};

/**
 * 构建树形数据（flatToTree的别名）
 * @param list 平铺数据
 * @param options 配置选项
 * @returns 树形数据
 */
export const buildTree = flatToTree; 