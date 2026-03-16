/** 漏斗查询请求 */
export interface FunnelQueryForm {
  /** 漏斗名称 */
  funnelName?: string;
  /** 事件列表 */
  events: string[];
  /** 开始时间 */
  startDate?: string;
  /** 结束时间 */
  endDate?: string;
  /** 设备类型 */
  deviceType?: string;
  /** 操作系统类型 */
  osType?: string;
}
