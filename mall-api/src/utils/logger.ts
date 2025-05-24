/**
 * 日志工具
 * 提供统一的日志记录功能，支持不同级别的日志输出
 * @author AI Assistant
 * @since 1.0.0
 */

/**
 * 日志级别枚举
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * 日志工具类
 */
class Logger {
  /**
   * 格式化日志输出
   * @param level 日志级别
   * @param message 日志消息
   * @param data 附加数据
   */
  private formatLog(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${logData}`;
  }

  /**
   * 错误日志
   * @param message 错误消息
   * @param error 错误对象或数据
   */
  error(message: string, error?: unknown): void {
    console.error(this.formatLog(LogLevel.ERROR, message, error));
  }

  /**
   * 警告日志
   * @param message 警告消息
   * @param data 附加数据
   */
  warn(message: string, data?: unknown): void {
    console.warn(this.formatLog(LogLevel.WARN, message, data));
  }

  /**
   * 信息日志
   * @param message 信息消息
   * @param data 附加数据
   */
  info(message: string, data?: unknown): void {
    console.log(this.formatLog(LogLevel.INFO, message, data));
  }

  /**
   * 调试日志
   * @param message 调试消息
   * @param data 附加数据
   */
  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatLog(LogLevel.DEBUG, message, data));
    }
  }
}

// 导出日志工具实例
export const logger = new Logger(); 