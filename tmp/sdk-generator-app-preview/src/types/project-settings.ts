/** 项目设置 */
export interface ProjectSettings {
  /** 是否公开 */
  isPublic?: boolean;
  /** 是否允许评论 */
  allowComments?: boolean;
  /** 是否允许文件上传 */
  allowFileUpload?: boolean;
  /** 是否允许邀请成员 */
  allowInviteMembers?: boolean;
}
