/** 钱包资产账户信息 */
export interface WalletAssetAccountVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 账户ID */
  accountId?: string;
  /** 账户类型 */
  accountType?: string;
  /** 账户类型描述 */
  accountTypeName?: string;
  /** 账户状态 */
  status?: string;
  /** 账户状态描述 */
  statusName?: string;
  /** 可用现金余额 */
  availableBalance?: number;
  /** 冻结现金余额 */
  frozenBalance?: number;
  /** 可用积分 */
  availablePoints?: number;
  /** 冻结积分 */
  frozenPoints?: number;
  /** 可用Token */
  availableToken?: number;
  /** 冻结Token */
  frozenToken?: number;
}
