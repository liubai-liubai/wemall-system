/**
 * 用户模型定义
 * 定义用户相关的数据传输对象、业务实体和验证模型
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { IAdminUser } from '../types/system.js';

/**
 * 管理员用户实体模型
 * 扩展基础接口，添加业务方法
 */
export class AdminUserModel implements IAdminUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  realName?: string;
  departmentId?: string;
  status: number;
  lastLoginTime?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IAdminUser) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.phone = data.phone;
    this.avatar = data.avatar;
    this.realName = data.realName;
    this.departmentId = data.departmentId;
    this.status = data.status;
    this.lastLoginTime = data.lastLoginTime;
    this.lastLoginIp = data.lastLoginIp;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * 检查用户是否为活跃状态
   */
  isActive(): boolean {
    return this.status === 1;
  }

  /**
   * 检查用户是否为新用户（最近30天内注册）
   */
  isNewUser(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt > thirtyDaysAgo;
  }

  /**
   * 获取用户显示名称
   */
  getDisplayName(): string {
    return this.realName || this.username;
  }

  /**
   * 脱敏处理手机号
   */
  getMaskedPhone(): string | undefined {
    if (!this.phone) return undefined;
    return this.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  /**
   * 脱敏处理邮箱
   */
  getMaskedEmail(): string | undefined {
    if (!this.email) return undefined;
    const [prefix, domain] = this.email.split('@');
    if (prefix.length <= 2) return this.email;
    
    const maskedPrefix = prefix.substring(0, 2) + '*'.repeat(prefix.length - 2);
    return `${maskedPrefix}@${domain}`;
  }

  /**
   * 转换为安全的输出格式（移除敏感信息）
   */
  toSafeObject(): Omit<IAdminUser, 'lastLoginIp'> {
    const { lastLoginIp, ...safeData } = this;
    return {
      ...safeData,
      phone: this.getMaskedPhone(),
      email: this.getMaskedEmail(),
    };
  }
}

/**
 * 用户数据传输对象
 * 用于API响应的标准化数据格式
 */
export class AdminUserDTO {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  realName?: string;
  departmentId?: string;
  departmentName?: string;
  status: number;
  statusText: string;
  lastLoginTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  roles?: string[];
  permissions?: string[];

  constructor(user: IAdminUser, options?: {
    departmentName?: string;
    roles?: string[];
    permissions?: string[];
    maskSensitiveData?: boolean;
  }) {
    this.id = user.id;
    this.username = user.username;
    this.email = options?.maskSensitiveData ? this.maskEmail(user.email) : user.email;
    this.phone = options?.maskSensitiveData ? this.maskPhone(user.phone) : user.phone;
    this.avatar = user.avatar;
    this.realName = user.realName;
    this.departmentId = user.departmentId;
    this.departmentName = options?.departmentName;
    this.status = user.status;
    this.statusText = user.status === 1 ? '启用' : '禁用';
    this.lastLoginTime = user.lastLoginTime;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.roles = options?.roles;
    this.permissions = options?.permissions;
  }

  private maskPhone(phone?: string): string | undefined {
    if (!phone) return undefined;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  private maskEmail(email?: string): string | undefined {
    if (!email) return undefined;
    const [prefix, domain] = email.split('@');
    if (prefix.length <= 2) return email;
    
    const maskedPrefix = prefix.substring(0, 2) + '*'.repeat(prefix.length - 2);
    return `${maskedPrefix}@${domain}`;
  }
} 