/** 反馈查询表单 */
export interface FeedbackQueryForm {
  /** 反馈类型 */
  type?: string;
  /** 状态 */
  status?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  size?: number;
}
