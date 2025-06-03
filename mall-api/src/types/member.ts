/**
 * 会员模块类型定义
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

// ================================
// 会员等级相关类型
// ================================

export interface IMemberLevel {
  id: string;
  name: string;
  description?: string;
  growth_min: number;
  growth_max: number;
  privileges?: Record<string, any>;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateMemberLevelRequest {
  name: string;
  description?: string;
  growth_min: number;
  growth_max: number;
  privileges?: Record<string, any>;
  status?: number;
}

export interface IUpdateMemberLevelRequest {
  name?: string;
  description?: string;
  growth_min?: number;
  growth_max?: number;
  privileges?: Record<string, any>;
  status?: number;
}

export interface IMemberLevelQueryParams {
  page?: number;
  size?: number;
  name?: string;
  status?: number;
}

// ================================
// 用户会员相关类型
// ================================

export interface IUserMember {
  id: string;
  user_id: string;
  level_id: string;
  growth: number;
  points: number;
  inviter_id?: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  level?: IMemberLevel;
  user?: {
    id: string;
    nickname?: string;
    avatar?: string;
    phone?: string;
  };
}

export interface ICreateUserMemberRequest {
  user_id: string;
  level_id: string;
  growth?: number;
  points?: number;
  inviter_id?: string;
  status?: number;
}

export interface IUpdateUserMemberRequest {
  level_id?: string;
  growth?: number;
  points?: number;
  inviter_id?: string;
  status?: number;
}

export interface IUserMemberQueryParams {
  page?: number;
  size?: number;
  user_id?: string;
  level_id?: string;
  status?: number;
  growth_min?: number;
  growth_max?: number;
  points_min?: number;
  points_max?: number;
}

// ================================
// 积分记录相关类型
// ================================

export interface IMemberPoint {
  id: string;
  user_member_id: string;
  change: number;
  type: string;
  remark?: string;
  created_at: Date;
  user_member?: IUserMember;
}

export interface ICreateMemberPointRequest {
  user_member_id: string;
  change: number;
  type: string;
  remark?: string;
}

export interface IMemberPointQueryParams {
  page?: number;
  size?: number;
  user_member_id?: string;
  type?: string;
  change_min?: number;
  change_max?: number;
  start_date?: string;
  end_date?: string;
}

// ================================
// 用户地址相关类型
// ================================

export interface IUserAddress {
  id: string;
  user_member_id: string;
  consignee: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default: number;
  status: number;
  created_at: Date;
  updated_at: Date;
  user_member?: IUserMember;
}

export interface ICreateUserAddressRequest {
  user_member_id: string;
  consignee: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default?: number;
  status?: number;
}

export interface IUpdateUserAddressRequest {
  consignee?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  is_default?: number;
  status?: number;
}

export interface IUserAddressQueryParams {
  page?: number;
  size?: number;
  user_member_id?: string;
  province?: string;
  city?: string;
  district?: string;
  is_default?: number;
  status?: number;
}

// ================================
// API响应类型
// ================================

export interface IMemberLevelListResponse {
  list: IMemberLevel[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface IUserMemberListResponse {
  list: IUserMember[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface IMemberPointListResponse {
  list: IMemberPoint[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface IUserAddressListResponse {
  list: IUserAddress[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ================================
// 积分操作类型枚举
// ================================

export enum PointChangeType {
  EARN = 'earn',        // 获得积分
  CONSUME = 'consume',  // 消费积分
  ADJUST = 'adjust',    // 管理员调整
  EXPIRE = 'expire',    // 积分过期
  REFUND = 'refund'     // 积分退还
}

// ================================
// 会员状态枚举
// ================================

export enum MemberStatus {
  DISABLED = 0,   // 禁用
  ENABLED = 1     // 启用
} 