/** 统计导出请求 */
export interface StatsExportForm {
  /** 报告类型 */
  reportType: string;
  /** 开始时间 */
  startDate?: string;
  /** 结束时间 */
  endDate?: string;
  /** 导出格式 */
  format?: string;
  /** 接收邮箱 */
  email?: string;
  /** 设备类型 */
  deviceType?: string;
  /** 操作系统类型 */
  osType?: string;
}
