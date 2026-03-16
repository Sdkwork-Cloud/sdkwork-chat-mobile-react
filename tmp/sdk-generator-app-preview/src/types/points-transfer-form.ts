/** 积分转账请求 */
export interface PointsTransferForm {
  /** 目标用户ID */
  toUserId: string;
  /** 转账积分 */
  points: number;
  /** 备注 */
  remarks?: string;
}
