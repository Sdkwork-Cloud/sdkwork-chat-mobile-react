/** 投票表单 */
export interface VoteForm {
  /** 内容类型 */
  contentType: string;
  /** 内容ID */
  contentId: number;
  /** 投票类型: LIKE, DISLIKE, NEUTRAL */
  rating: string;
  /** 投票来源 */
  source?: string;
  /** 设备信息 */
  deviceInfo?: string;
}
