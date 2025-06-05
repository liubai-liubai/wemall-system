/**
 * JWT工具类
 * 提供JWT令牌的生成、验证、解析等核心功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import jwt, { SignOptions } from 'jsonwebtoken';

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// JWT载荷接口
export interface IJwtPayload {
  userId: string;
  userType: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

export class JwtUtils {
  /**
   * 生成访问令牌
   * @param payload 载荷数据
   * @param expiresIn 过期时间 (例如: '24h', '7d', '1h')
   * @returns JWT令牌
   */
  generateToken(payload: Omit<IJwtPayload, 'iat' | 'exp'>, expiresIn: string = JWT_EXPIRES_IN): string {
    const options = { expiresIn } as SignOptions;
    return jwt.sign(payload, JWT_SECRET, options);
  }

  /**
   * 生成刷新令牌
   * @param payload 载荷数据
   * @param expiresIn 过期时间 (例如: '7d', '30d', '1h')
   * @returns 刷新令牌
   */
  generateRefreshToken(payload: Omit<IJwtPayload, 'iat' | 'exp'>, expiresIn: string = JWT_REFRESH_EXPIRES_IN): string {
    const options = { expiresIn } as SignOptions;
    return jwt.sign(payload, JWT_REFRESH_SECRET, options);
  }

  /**
   * 验证访问令牌
   * @param token JWT令牌
   * @returns 解析后的载荷
   */
  verifyToken(token: string): IJwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as IJwtPayload;
    } catch (error) {
      throw new Error('Token验证失败');
    }
  }

  /**
   * 验证刷新令牌
   * @param refreshToken 刷新令牌
   * @returns 解析后的载荷
   */
  verifyRefreshToken(refreshToken: string): IJwtPayload {
    try {
      return jwt.verify(refreshToken, JWT_REFRESH_SECRET) as IJwtPayload;
    } catch (error) {
      throw new Error('刷新令牌验证失败');
    }
  }

  /**
   * 解析令牌（不验证签名）
   * @param token JWT令牌
   * @returns 解析后的载荷
   */
  decodeToken(token: string): IJwtPayload | null {
    try {
      return jwt.decode(token) as IJwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 检查令牌是否即将过期（30分钟内）
   * @param token JWT令牌
   * @returns 是否即将过期
   */
  isTokenExpiringSoon(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    const thirtyMinutes = 30 * 60;
    
    return decoded.exp - now < thirtyMinutes;
  }

  /**
   * 从Authorization头中提取Token
   * @param authHeader Authorization头值
   * @returns JWT令牌
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}

export const jwtUtils = new JwtUtils(); 