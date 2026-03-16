/** 实验转化事件请求 */
export interface ExperimentConversionForm {
  /** 实验标识 */
  experimentKey: string;
  /** 转化目标 */
  conversionGoal?: string;
  /** 转化值 */
  conversionValue?: number;
}
