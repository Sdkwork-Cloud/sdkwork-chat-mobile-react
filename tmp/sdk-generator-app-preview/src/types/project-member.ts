/** 项目成员 */
export interface ProjectMember {
  /** 用户ID */
  userId?: string;
  /** 角色ID */
  roleId?: string;
  /** 角色名称 */
  roleName?: string;
  /** 权限列表 */
  permissions?: string[];
}
