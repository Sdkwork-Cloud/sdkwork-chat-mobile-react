/** 活动参与请求 */
export interface ActivityJoinForm {
  /** 附加参数 */
  extraParams?: Record<string, unknown>;
  /** 邀请码(如果是邀请活动) */
  inviteCode?: string;
}
