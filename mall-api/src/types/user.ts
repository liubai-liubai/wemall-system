/**
 * 用户相关类型定义
 * 定义用户模块使用的接口和类型，确保类型安全
 * @author AI Assistant
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
