/** 设备消息发送表单 */
export interface DeviceMessageSendForm {
  /** 消息类型 */
  type: string;
  /** 消息负载 */
  payload: Record<string, unknown>;
  /** 消息主题 */
  topic?: string;
}
