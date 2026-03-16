/** 主题订阅表单 */
export interface TopicSubscribeForm {
  /** 主题名称 */
  topic: string;
  /** 是否订阅 */
  subscribe?: boolean;
  /** 设备ID */
  deviceId?: string;
}
