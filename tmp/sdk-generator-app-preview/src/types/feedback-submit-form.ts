/** 反馈提交表单 */
export interface FeedbackSubmitForm {
  /** 反馈类型 */
  type: string;
  /** 反馈内容 */
  content: string;
  /** 联系方式 */
  contact?: string;
  /** 附件URL */
  attachmentUrl?: string;
  /** 相关截图 */
  screenshotUrl?: string;
}
