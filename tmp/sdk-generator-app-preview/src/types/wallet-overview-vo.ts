import type { WalletAssetAccountVO } from './wallet-asset-account-vo';

/** 钱包总览 */
export interface WalletOverviewVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 用户ID */
  userId?: string;
  /** 快照时间 */
  snapshotAt?: string;
  /** 现金可用余额 */
  cashAvailable?: number;
  /** 现金冻结余额 */
  cashFrozen?: number;
  /** 积分可用余额 */
  pointsAvailable?: number;
  /** 积分冻结余额 */
  pointsFrozen?: number;
  /** Token可用余额 */
  tokenAvailable?: number;
  /** Token冻结余额 */
  tokenFrozen?: number;
  /** 资产账户列表 */
  accounts?: WalletAssetAccountVO[];
}
