/** 路径分析查询请求 */
export interface PathAnalysisQueryForm {
  /** 开始时间 */
  startDate?: string;
  /** 结束时间 */
  endDate?: string;
  /** 开始页面 */
  startPage?: string;
  /** 结束页面 */
  endPage?: string;
  /** 最大步数 */
  maxSteps?: number;
  /** 设备类型 */
  deviceType?: string;
  /** 操作系统类型 */
  osType?: string;
}
