/** 工作空间设置 */
export interface WorkspaceSettings {
  /** 是否公开 */
  isPublic?: boolean;
  /** 是否允许邀请 */
  allowInvite?: boolean;
  /** 是否允许创建项目 */
  allowCreateProject?: boolean;
  /** 是否允许上传文件 */
  allowFileUpload?: boolean;
}
