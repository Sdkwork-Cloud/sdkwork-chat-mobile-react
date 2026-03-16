/** 成员角色更新请求 */
export interface MemberRoleUpdateForm {
  /** 工作空间ID */
  workspaceId?: string;
  /** 成员ID */
  memberId?: string;
  /** 用户ID */
  userId?: string;
  /** 新角色ID */
  newRoleId?: string;
  /** 新角色名称 */
  newRoleName?: string;
  /** 权限列表 */
  permissions?: string[];
  /** 更新原因 */
  updateReason?: string;
  /** 是否需要通知 */
  needNotify?: boolean;
}
