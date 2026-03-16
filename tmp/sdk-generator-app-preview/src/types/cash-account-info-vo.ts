/** 现金账户信息响应 */
export interface CashAccountInfoVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 账户ID */
  accountId?: string;
  /** 账户类型 */
  accountType?: string;
  /** 账户类型名称 */
  accountTypeName?: string;
  /** 所有者ID */
  ownerId?: string;
  /** 用户ID */
  userId?: string;
  /** 可用余额 */
  availableBalance?: number;
  /** 冻结余额 */
  frozenBalance?: number;
  /** 总余额 */
  totalBalance?: number;
  /** 账户状态: ACTIVE-正常, FROZEN-冻结, CLOSED-关闭 */
  status?: string;
  /** 状态名称 */
  statusName?: string;
  /** 待入账金额 */
  pendingBalance?: number;
  /** 累计充值金额 */
  totalRecharged?: number;
  /** 累计消费金额 */
  totalSpent?: number;
  /** 累计提现金额 */
  totalWithdrawn?: number;
}
