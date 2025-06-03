/**
 * 用户相关类型定义
 * 定义用户模块使用的接口和类型，确保类型安全
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

/**
 * 用户性别枚举
 */
export enum UserGender {
  UNKNOWN = 0,  // 未知
  MALE = 1,     // 男性
  FEMALE = 2    // 女性
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  DISABLED = 0, // 禁用
  ACTIVE = 1    // 正常
}

/**
 * 微信登录请求参数
 */
export interface IWechatLoginRequest {
  code: string;           // 微信登录凭证
  encryptedData?: string; // 加密数据
  iv?: string;           // 初始向量
  signature?: string;     // 数据签名
}

/**
 * 用户登录响应数据
 */
export interface IUserLoginResponse {
  user: IUserInfo;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 用户信息接口
 */
export interface IUserInfo {
  id: string;
  openId: string;
  unionId?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  gender: UserGender;
  birthday?: string;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户更新请求参数
 */
export interface IUserUpdateRequest {
  nickname?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  gender?: UserGender;
  birthday?: string;
}

/**
 * JWT载荷接口
 */
export interface IJwtPayload {
  userId: string;
  openId: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * 微信用户信息接口（从微信API获取）
 */
export interface IWechatUserInfo {
  openId: string;
  unionId?: string;
  nickName?: string;
  avatarUrl?: string;
  gender?: number;
  city?: string;
  province?: string;
  country?: string;
  language?: string;
}

/**
 * 用户查询参数
 */
export interface IUserQueryParams {
  page?: number;
  size?: number;
  status?: UserStatus;
  keyword?: string;       // 搜索关键词（昵称、手机号）
  startDate?: string;     // 注册开始日期
  endDate?: string;       // 注册结束日期
  gender?: UserGender;
}

// 用户地址接口
export interface IUserAddress {
  id: string;
  userId: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  postalCode?: string;
  isDefault: boolean;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  user?: IUserInfo;
}

// 创建用户地址请求
export interface CreateUserAddressRequest {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  postalCode?: string;
  isDefault?: boolean;
  label?: string;
}

// 更新用户地址请求
export interface UpdateUserAddressRequest {
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
  postalCode?: string;
  isDefault?: boolean;
  label?: string;
}

// 用户地址查询参数
export interface UserAddressQueryParams {
  userId?: string;
  province?: string;
  city?: string;
  district?: string;
  isDefault?: boolean;
  label?: string;
  page?: number;
  size?: number;
  sortBy?: 'created_at' | 'updated_at' | 'receiver_name';
  sortOrder?: 'asc' | 'desc';
}

// 用户地址列表响应
export interface UserAddressListResponse {
  list: IUserAddress[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// 地址统计信息
export interface AddressStatistics {
  totalAddresses: number;
  defaultAddresses: number;
  provinceStats: Array<{
    province: string;
    count: number;
  }>;
  labelStats: Array<{
    label: string;
    count: number;
  }>;
}

// 设置默认地址请求
export interface SetDefaultAddressRequest {
  addressId: string;
}

// 地址验证结果
export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedAddress?: {
    province: string;
    city: string;
    district: string;
    detailAddress: string;
  };
}
