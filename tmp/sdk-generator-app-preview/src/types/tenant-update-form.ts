/** 更新租户表单 */
export interface TenantUpdateForm {
  /** 租户名称 */
  name?: string;
  /** 租户描述 */
  description?: string;
  /** 联系人 */
  contactPerson?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 过期时间 */
  expireTime?: string;
}
