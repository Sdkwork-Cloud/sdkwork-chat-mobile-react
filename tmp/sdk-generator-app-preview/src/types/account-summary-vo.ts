/** 账户余额汇总响应 */
export interface AccountSummaryVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 可用现金余额 */
  cashAvailable?: number;
  /** 冻结现金余额 */
  cashFrozen?: number;
  /** 可用积分余额 */
  pointsAvailable?: number;
  /** 冻结积分余额 */
  pointsFrozen?: number;
  /** 可用Token余额 */
  tokenAvailable?: number;
  /** 冻结Token余额 */
  tokenFrozen?: number;
  /** 是否设置支付密码 */
  hasPayPassword?: boolean;
}
