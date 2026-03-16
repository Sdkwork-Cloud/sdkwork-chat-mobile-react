/** 合作伙伴响应 */
export interface PartnerVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 合作伙伴ID */
  partnerId?: string;
  /** 名称 */
  name?: string;
  /** 等级 */
  level?: string;
  /** 状态 */
  status?: string;
  /** 推广码 */
  promotionCode?: string;
  /** 联系人 */
  contactName?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 累计佣金 */
  totalCommission?: number;
  /** 可提现佣金 */
  withdrawableCommission?: number;
}
