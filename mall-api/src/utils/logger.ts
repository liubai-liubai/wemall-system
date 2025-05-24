/**
 * 日志级别枚举
 */
enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
  DEBUG = 'DEBUG'
}

/**
 * 日志工具类
 */
class Logger {
  /**
   * 格式化日志消息
   * @param level 日志级别
   * @param message 日志消息
   * @param extra 额外信息
   * @returns 格式化后的日志字符串
   */
  private formatMessage(level: LogLevel, message: string, extra?: unknown): string {
    const timestamp = new Date().toISOString();
    const extraStr = extra ? ` | ${JSON.stringify(extra)}` : '';
    return `[${timestamp}] [${level}] ${message}${extraStr}`;
  }

  /**
   * 输出信息日志
   * @param message 日志消息
   * @param extra 额外信息
   */
  info(message: string, extra?: unknown): void {
    console.log(this.formatMessage(LogLevel.INFO, message, extra));
  }

  /**
   * 输出错误日志
   * @param message 日志消息
   * @param extra 额外信息
   */
  error(message: string, extra?: unknown): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, extra));
  }

  /**
   * 输出警告日志
   * @param message 日志消息
   * @param extra 额外信息
   */
  warn(message: string, extra?: unknown): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, extra));
  }

  /**
   * 输出调试日志（仅开发环境）
   * @param message 日志消息
   * @param extra 额外信息
   */
  debug(message: string, extra?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, extra));
    }
  }
}

export const logger = new Logger(); 