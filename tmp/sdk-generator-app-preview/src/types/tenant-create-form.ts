/** 创建租户表单 */
export interface TenantCreateForm {
  /** 租户名称 */
  name: string;
  /** 租户编码 */
  code?: string;
  /** 租户类型 */
  type: string;
  /** 业务类型 */
  bizType?: string;
  /** 业务ID */
  bizId?: number;
  /** 租户描述 */
  description?: string;
  /** 管理员用户ID */
  adminUserId?: number;
  /** 联系人 */
  contactPerson?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 过期时间 */
  expireTime?: string;
}
