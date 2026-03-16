/** 创建评论表单 */
export interface CommentCreateForm {
  /** 内容类型 */
  contentType: string;
  /** 内容ID */
  contentId: number;
  /** 评论内容 */
  content: string;
  /** 设备信息 */
  deviceInfo?: string;
}
