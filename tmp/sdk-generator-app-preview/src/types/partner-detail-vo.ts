/** 合作伙伴详情响应 */
export interface PartnerDetailVO {
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
  /** 联系邮箱 */
  contactEmail?: string;
  /** 公司地址 */
  companyAddress?: string;
  /** 营业执照 */
  businessLicense?: string;
  /** 结算账户 */
  settlementAccount?: string;
  /** 佣金比例 */
  commissionRate?: number;
  /** 累计佣金 */
  totalCommission?: number;
  /** 可提现佣金 */
  withdrawableCommission?: number;
  /** 已提现佣金 */
  withdrawnCommission?: number;
  /** 上级ID */
  parentId?: number;
  /** 合作开始时间 */
  cooperationStartTime?: string;
  /** 合作结束时间 */
  cooperationEndTime?: string;
  /** 备注 */
  remark?: string;
}
