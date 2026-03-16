/** 通知设置 */
export interface NotificationSettings {
  /** 系统通知 */
  system?: boolean;
  /** 消息通知 */
  message?: boolean;
  /** 活动通知 */
  activity?: boolean;
  /** 优惠通知 */
  promotion?: boolean;
  /** 声音 */
  sound?: boolean;
  /** 振动 */
  vibration?: boolean;
}
