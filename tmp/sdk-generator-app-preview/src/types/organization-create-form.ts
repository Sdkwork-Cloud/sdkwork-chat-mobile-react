/** 创建组织表单 */
export interface OrganizationCreateForm {
  /** 组织名称 */
  name: string;
  /** 组织编码 */
  code?: string;
  /** 组织描述 */
  description?: string;
  /** 父组织ID */
  parentId?: number;
  /** 联系人 */
  contactPerson?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 联系邮箱 */
  contactEmail?: string;
  /** 地址 */
  address?: string;
  /** 网站 */
  website?: string;
  /** Logo URL */
  logoUrl?: string;
}
