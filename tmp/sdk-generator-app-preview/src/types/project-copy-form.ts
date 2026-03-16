/** 项目复制请求 */
export interface ProjectCopyForm {
  /** 源项目ID */
  sourceProjectId?: string;
  /** 目标工作空间ID */
  targetWorkspaceId?: string;
  /** 新项目名称 */
  newName?: string;
  /** 新项目描述 */
  newProjectDescription?: string;
  /** 是否复制成员 */
  copyMembers?: boolean;
  /** 是否复制文件 */
  copyFiles?: boolean;
  /** 是否复制设置 */
  copySettings?: boolean;
  /** 复制原因 */
  copyReason?: string;
}
