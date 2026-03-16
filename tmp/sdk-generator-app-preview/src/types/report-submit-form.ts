/** 举报提交表单 */
export interface ReportSubmitForm {
  /** 举报类型 */
  type: string;
  /** 举报对象ID */
  targetId: string;
  /** 举报内容 */
  content: string;
  /** 附件URL */
  attachmentUrl?: string;
  /** 相关截图 */
  screenshotUrl?: string;
}
