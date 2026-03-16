/** 创建合作伙伴表单 */
export interface PartnerCreateForm {
  /** 名称 */
  name: string;
  /** 联系人 */
  contactName?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 联系邮箱 */
  contactEmail?: string;
  /** 等级 */
  level?: string;
  /** 上级ID */
  parentId?: number;
}
