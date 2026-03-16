/** 错误追踪请求 */
export interface ErrorTrackForm {
  /** 错误类型 */
  errorType: string;
  /** 错误消息 */
  errorMessage: string;
  /** 堆栈跟踪 */
  stackTrace?: string;
  /** 设备ID */
  deviceId?: string;
  /** 用户ID */
  userId?: string;
  /** 应用版本 */
  appVersion?: string;
  /** 设备型号 */
  deviceModel?: string;
  /** 操作系统版本 */
  osVersion?: string;
  /** 上下文信息 */
  context?: string;
  /** 错误发生时间 */
  errorTime?: string;
}
