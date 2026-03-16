/** 设备注册表单 */
export interface DeviceRegisterForm {
  /** 设备类型 */
  deviceType: string;
  /** 设备标识符 */
  deviceId: string;
  /** 推送令牌 */
  pushToken: string;
  /** 操作系统版本 */
  osVersion?: string;
  /** 应用版本 */
  appVersion?: string;
}
