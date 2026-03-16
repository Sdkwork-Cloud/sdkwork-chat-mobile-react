/** 项目移动请求 */
export interface ProjectMoveForm {
  /** 项目ID */
  projectId?: string;
  /** 目标工作空间ID */
  targetWorkspaceId?: string;
  /** 移动原因 */
  moveReason?: string;
  /** 是否保留成员 */
  retainMembers?: boolean;
  /** 是否保留设置 */
  retainSettings?: boolean;
}
