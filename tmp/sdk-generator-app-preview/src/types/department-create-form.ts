/** 创建部门表单 */
export interface DepartmentCreateForm {
  /** 部门名称 */
  name: string;
  /** 部门编码 */
  code?: string;
  /** 部门描述 */
  description?: string;
  /** 组织ID */
  ownerId: number;
  /** 父部门ID */
  parentId?: number;
  /** 排序 */
  sortOrder?: number;
  /** 负责人ID */
  managerId?: number;
  /** 联系电话 */
  phone?: string;
  /** 邮箱 */
  email?: string;
}
