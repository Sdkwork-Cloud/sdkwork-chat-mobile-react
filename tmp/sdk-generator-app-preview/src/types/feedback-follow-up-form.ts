/** 反馈跟进表单 */
export interface FeedbackFollowUpForm {
  /** 反馈ID */
  feedbackId: string;
  /** 跟进内容 */
  content: string;
  /** 附件URL */
  attachmentUrl?: string;
}
