/** 生成邀请链接请求 */
export interface InviteLinkForm {
  /** 邀请类型 */
  inviteType?: string;
  /** 过期时间（秒） */
  expireSeconds?: number;
  /** 邀请码 */
  inviteCode?: string;
  /** 渠道 */
  channel?: string;
}
