/**
 * 认证服务
 * 处理用户认证、登录、令牌管理等核心业务逻辑
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { 
  IWechatLoginRequest, 
  IUserLoginResponse, 
  IUserInfo,
  IJwtPayload,
  UserStatus 
} from '../types/user.js';
import { logger } from '../utils/logger.js';

/**
 * 认证服务类
 */
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = '7d';          // 访问令牌有效期
  private readonly REFRESH_EXPIRES_IN = '30d';     // 刷新令牌有效期

  /**
   * 微信小程序登录
   * @param loginData 微信登录数据
   * @returns 用户信息和令牌
   */
  async wechatLogin(loginData: IWechatLoginRequest): Promise<IUserLoginResponse> {
    try {
      // 1. 调用微信API获取openId和session_key
      const wechatData = await this.getWechatUserData(loginData.code);
      
      // 2. 查找或创建用户
      let user = await this.findUserByOpenId(wechatData.openId);
      if (!user) {
        user = await this.createUser(wechatData);
      } else {
        // 更新最后登录时间和session_key
        user = await this.updateUserLogin(user.id, wechatData.sessionKey);
      }

      // 3. 生成JWT令牌
      const tokens = await this.generateTokens(user);

      // 4. 返回登录响应
      return {
        user: this.formatUserInfo(user),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 7 * 24 * 60 * 60 // 7天（秒）
      };
    } catch (error) {
      logger.error('微信登录失败', error);
      throw new Error('登录失败，请重试');
    }
  }

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌
   */
  async refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
    try {
      // 1. 验证刷新令牌
      const payload = jwt.verify(refreshToken, this.JWT_SECRET) as IJwtPayload;
      
      if (payload.type !== 'refresh') {
        throw new Error('无效的刷新令牌类型');
      }

      // 2. 生成token哈希并查找数据库中的刷新令牌
      const tokenHash = this.generateTokenHash(refreshToken);
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token_hash: tokenHash },
        include: { user: true }
      });

      // 使用正确的字段名 expires_at（snake_case）
      if (!storedToken || storedToken.expires_at < new Date()) {
        throw new Error('刷新令牌已过期');
      }

      // 3. 生成新的访问令牌
      const newAccessToken = this.generateAccessToken(payload.userId, payload.openId);

      return { token: newAccessToken };
    } catch (error) {
      logger.error('刷新令牌失败', error);
      throw new Error('令牌刷新失败');
    }
  }

  /**
   * 调用微信API获取用户数据
   * @param code 微信登录凭证
   * @returns 微信用户数据
   */
  private async getWechatUserData(code: string): Promise<{
    openId: string;
    sessionKey: string;
    unionId?: string;
  }> {
    // TODO: 实现微信API调用
    // 这里先返回模拟数据，后续完善
    return {
      openId: `wx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionKey: `session_${Math.random().toString(36).substr(2, 32)}`,
      unionId: undefined
    };
  }

  /**
   * 根据openId查找用户
   * @param openId 微信openId
   * @returns 用户信息或null
   */
  private async findUserByOpenId(openId: string) {
    return await prisma.user.findUnique({
      where: { open_id: openId }  // 使用schema中定义的字段名
    });
  }

  /**
   * 创建新用户
   * @param wechatData 微信用户数据
   * @returns 用户信息
   */
  private async createUser(wechatData: { openId: string; sessionKey: string; unionId?: string }) {
    return await prisma.user.create({
      data: {
        open_id: wechatData.openId,      // 使用schema中定义的字段名
        union_id: wechatData.unionId,    // 使用schema中定义的字段名
        session_key: wechatData.sessionKey, // 使用schema中定义的字段名
        status: UserStatus.ACTIVE,
        last_login: new Date()           // 使用schema中定义的字段名
      }
    });
  }

  /**
   * 更新用户登录信息
   * @param userId 用户ID
   * @param sessionKey 会话密钥
   * @returns 更新后的用户信息
   */
  private async updateUserLogin(userId: string, sessionKey?: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        session_key: sessionKey,  // 使用schema中定义的字段名
        last_login: new Date()    // 使用schema中定义的字段名
      }
    });
  }

  /**
   * 生成JWT令牌对
   * @param user 用户信息
   * @returns 访问令牌和刷新令牌
   */
  private async generateTokens(user: any): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // 使用schema中定义的字段名
    const accessToken = this.generateAccessToken(user.id, user.open_id);
    const refreshToken = this.generateRefreshToken(user.id, user.open_id);

    // 保存刷新令牌到数据库
    await this.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * 生成访问令牌
   * @param userId 用户ID
   * @param openId 微信openId
   * @returns 访问令牌
   */
  private generateAccessToken(userId: string, openId: string): string {
    const payload: IJwtPayload = {
      userId,
      openId,
      type: 'access'
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }

  /**
   * 生成刷新令牌
   * @param userId 用户ID
   * @param openId 微信openId
   * @returns 刷新令牌
   */
  private generateRefreshToken(userId: string, openId: string): string {
    const payload: IJwtPayload = {
      userId,
      openId,
      type: 'refresh'
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_EXPIRES_IN
    });
  }

  /**
   * 保存刷新令牌到数据库
   * @param userId 用户ID
   * @param refreshToken 刷新令牌
   */
  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30天后过期

    // 生成token哈希
    const tokenHash = this.generateTokenHash(refreshToken);

    // 使用正确的模型名 refreshToken（小写r）和字段名（snake_case）
    await prisma.refreshToken.create({
      data: {
        user_id: userId,           // 使用schema中定义的字段名
        token: refreshToken,       // 完整的JWT token
        token_hash: tokenHash,     // token的SHA256哈希值
        expires_at: expiresAt      // 使用schema中定义的字段名
      }
    });
  }

  /**
   * 生成token的SHA256哈希值
   * @param token JWT token
   * @returns SHA256哈希值
   */
  private generateTokenHash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * 格式化用户信息返回
   * @param user 原始用户数据
   * @returns 格式化的用户信息
   */
  private formatUserInfo(user: any): IUserInfo {
    return {
      id: user.id,
      openId: user.open_id,                    // 数据库字段转接口字段
      unionId: user.union_id || undefined,     // 数据库字段转接口字段
      nickname: user.nickname || undefined,
      avatar: user.avatar || undefined,
      phone: user.phone || undefined,
      email: user.email || undefined,
      gender: user.gender,
      birthday: user.birthday?.toISOString(),
      status: user.status,
      lastLogin: user.last_login?.toISOString(),  // 数据库字段转接口字段
      createdAt: user.created_at.toISOString(),   // 数据库字段转接口字段
      updatedAt: user.updated_at.toISOString()    // 数据库字段转接口字段
    };
  }
}

// 导出服务实例
export const authService = new AuthService(); 