/** 测试通知表单 */
export interface TestNotificationForm {
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  content: string;
  /** 通知类型 */
  type?: string;
  /** 设备ID */
  deviceId?: string;
}
