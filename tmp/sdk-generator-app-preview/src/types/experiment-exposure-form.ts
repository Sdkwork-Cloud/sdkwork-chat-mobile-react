/** 实验曝光事件请求 */
export interface ExperimentExposureForm {
  /** 实验标识 */
  experimentKey: string;
  /** 变体标识 */
  variantKey?: string;
  /** 曝光上下文 */
  exposureContext?: unknown;
}
