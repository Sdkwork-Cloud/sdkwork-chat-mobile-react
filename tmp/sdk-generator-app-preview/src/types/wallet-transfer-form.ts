/** 钱包转账请求 */
export interface WalletTransferForm {
  /** 转账资产类型: CASH/POINTS */
  accountType: 'DEFAULT' | 'CASH' | 'POINTS' | 'TOKEN';
  /** 目标用户ID */
  toUserId: string;
  /** 现金转账金额(当accountType=CASH时必填) */
  amount?: number;
  /** 积分转账数量(当accountType=POINTS时必填) */
  points?: number;
  /** 幂等请求号(建议前端传UUID) */
  requestNo?: string;
  /** 备注 */
  remarks?: string;
}
