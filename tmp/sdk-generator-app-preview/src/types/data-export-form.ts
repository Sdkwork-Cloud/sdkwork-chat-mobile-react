/** 导出用户数据请求 */
export interface DataExportForm {
  /** 导出格式：json/csv/excel */
  format?: string;
  /** 导出数据类型：all/history/settings */
  dataType?: string;
  /** 是否包含媒体文件 */
  includeMedia?: boolean;
  /** 导出时间范围开始 */
  startTime?: string;
  /** 导出时间范围结束 */
  endTime?: string;
  /** 导出邮箱（可选） */
  email?: string;
}
