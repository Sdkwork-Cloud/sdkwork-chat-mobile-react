/** 设备控制命令表单 */
export interface DeviceControlForm {
  /** 控制动作 */
  action: string;
  /** 控制参数 */
  params?: Record<string, unknown>;
}
