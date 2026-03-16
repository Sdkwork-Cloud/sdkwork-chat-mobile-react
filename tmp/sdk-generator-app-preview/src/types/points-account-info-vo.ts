/** 积分账户信息响应 */
export interface PointsAccountInfoVO {
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
  /** 可用积分 */
  availablePoints?: number;
  /** 冻结积分 */
  frozenPoints?: number;
  /** 总积分 */
  totalPoints?: number;
  /** Token余额 */
  tokenBalance?: number;
  /** 账户状态: ACTIVE-正常, FROZEN-冻结, CLOSED-关闭 */
  status?: string;
  /** 状态名称 */
  statusName?: string;
  /** 待入账积分 */
  pendingPoints?: number;
  /** 累计获得积分 */
  totalEarned?: number;
  /** 累计消费积分 */
  totalSpent?: number;
  /** 积分等级 */
  level?: number;
  /** 等级名称 */
  levelName?: string;
  /** 经验值 */
  experience?: number;
}
