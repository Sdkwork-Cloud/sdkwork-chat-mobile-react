/** 批量取消分享请求 */
export interface BatchCancelShareForm {
  /** 分享ID列表 */
  shareIds?: string[];
  /** 取消原因 */
  reason?: string;
}
