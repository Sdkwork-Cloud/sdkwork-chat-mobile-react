/** 实验反馈请求 */
export interface ExperimentFeedbackForm {
  /** 实验标识 */
  experimentKey: string;
  /** 反馈类型 */
  feedbackType?: string;
  /** 反馈内容 */
  feedbackContent?: string;
  /** 反馈评分 */
  rating?: number;
}
