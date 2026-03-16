/** 事件统计查询请求 */
export interface EventStatsQueryForm {
  /** 事件名称 */
  eventName?: string;
  /** 开始时间 */
  startDate?: string;
  /** 结束时间 */
  endDate?: string;
  /** 时间间隔 */
  interval?: string;
  /** 设备类型 */
  deviceType?: string;
  /** 操作系统类型 */
  osType?: string;
}
