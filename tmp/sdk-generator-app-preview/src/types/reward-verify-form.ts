/** 奖励验证请求 */
export interface RewardVerifyForm {
  advertId: string;
  rewardId: string;
  verificationToken: string;
  deviceId?: string;
  ipAddress?: string;
}
