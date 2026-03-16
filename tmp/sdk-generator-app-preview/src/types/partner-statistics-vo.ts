/** 合作伙伴统计响应 */
export interface PartnerStatisticsVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 总合作伙伴数 */
  totalPartners?: number;
  /** 活跃合作伙伴数 */
  activePartners?: number;
  /** 待审核合作伙伴数 */
  pendingPartners?: number;
  /** 累计佣金总额 */
  totalCommission?: number;
  /** 可提现佣金总额 */
  withdrawableCommission?: number;
}
