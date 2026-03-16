/** 成员邀请请求 */
export interface MemberInviteForm {
  /** 工作空间ID */
  workspaceId?: string;
  /** 被邀请人邮箱列表 */
  emails?: string[];
  /** 角色ID */
  roleId?: string;
  /** 角色名称 */
  roleName?: string;
  /** 权限列表 */
  permissions?: string[];
  /** 邀请消息 */
  inviteMessage?: string;
  /** 邀请有效期（小时） */
  expireHours?: number;
  /** 是否需要审批 */
  needApproval?: boolean;
}
