import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultBoolean, PlusApiResultInviteRulesVO, PlusApiResultListVipBenefitVO, PlusApiResultListVipCouponVO, PlusApiResultListVipInviteRecordVO, PlusApiResultListVipLevelVO, PlusApiResultListVipPackGroupVO, PlusApiResultListVipPackVO, PlusApiResultListVipPointsHistoryVO, PlusApiResultLong, PlusApiResultVipDailyRewardStatusVO, PlusApiResultVipDailyRewardVO, PlusApiResultVipInfoVO, PlusApiResultVipInviteInfoVO, PlusApiResultVipInviteVO, PlusApiResultVipPackDetailVO, PlusApiResultVipPackGroupDetailVO, PlusApiResultVipPrivilegeUsageVO, PlusApiResultVipPurchaseVO, PlusApiResultVipStatusVO, PlusApiResultVoid, SpeedUpForm, VipInviteForm, VipPurchaseForm, VipRenewForm, VipUpgradeForm } from '../types';


export class VipApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 购买VIP */
  async purchase(body: VipPurchaseForm): Promise<PlusApiResultVipPurchaseVO> {
    return this.client.post<PlusApiResultVipPurchaseVO>(appApiPath(`/vip/purchase`), body);
  }

/** 升级VIP */
  async upgrade(body: VipUpgradeForm): Promise<PlusApiResultVipPurchaseVO> {
    return this.client.post<PlusApiResultVipPurchaseVO>(appApiPath(`/vip/purchase/upgrade`), body);
  }

/** 续费VIP */
  async renew(body: VipRenewForm): Promise<PlusApiResultVipPurchaseVO> {
    return this.client.post<PlusApiResultVipPurchaseVO>(appApiPath(`/vip/purchase/renew`), body);
  }

/** 使用加速特权 */
  async useSpeedUpPrivilege(body: SpeedUpForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/vip/privilege/speed-up`), body);
  }

/** 领取每日奖励 */
  async claimDailyReward(): Promise<PlusApiResultVipDailyRewardVO> {
    return this.client.post<PlusApiResultVipDailyRewardVO>(appApiPath(`/vip/points/daily-reward`));
  }

/** 邀请好友 */
  async inviteFriend(body: VipInviteForm): Promise<PlusApiResultVipInviteVO> {
    return this.client.post<PlusApiResultVipInviteVO>(appApiPath(`/vip/invite`), body);
  }

/** 领取优惠券 */
  async claimCoupon(couponId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/vip/coupons/${couponId}/claim`));
  }

/** 获取VIP状态 */
  async getVipStatus(): Promise<PlusApiResultVipStatusVO> {
    return this.client.get<PlusApiResultVipStatusVO>(appApiPath(`/vip/status`));
  }

/** 获取特权使用情况 */
  async getPrivilegeUsage(): Promise<PlusApiResultVipPrivilegeUsageVO> {
    return this.client.get<PlusApiResultVipPrivilegeUsageVO>(appApiPath(`/vip/privilege/usage`));
  }

/** 获取积分明细 */
  async getPointsHistory(): Promise<PlusApiResultListVipPointsHistoryVO> {
    return this.client.get<PlusApiResultListVipPointsHistoryVO>(appApiPath(`/vip/points/history`));
  }

/** 获取每日奖励状态 */
  async getDailyRewardStatus(): Promise<PlusApiResultVipDailyRewardStatusVO> {
    return this.client.get<PlusApiResultVipDailyRewardStatusVO>(appApiPath(`/vip/points/daily-reward/status`));
  }

/** 获取积分余额 */
  async getPointsBalance(): Promise<PlusApiResultLong> {
    return this.client.get<PlusApiResultLong>(appApiPath(`/vip/points/balance`));
  }

/** 获取套餐分组列表 */
  async listPackGroups(params?: QueryParams): Promise<PlusApiResultListVipPackGroupVO> {
    return this.client.get<PlusApiResultListVipPackGroupVO>(appApiPath(`/vip/pack-groups`), params);
  }

/** 获取分组详情 */
  async getPackGroupDetail(groupId: string | number): Promise<PlusApiResultVipPackGroupDetailVO> {
    return this.client.get<PlusApiResultVipPackGroupDetailVO>(appApiPath(`/vip/pack-groups/${groupId}`));
  }

/** 获取分组套餐 */
  async listPacksByGroup(groupId: string | number): Promise<PlusApiResultListVipPackVO> {
    return this.client.get<PlusApiResultListVipPackVO>(appApiPath(`/vip/pack-groups/${groupId}/packs`));
  }

/** 获取所有套餐 */
  async listAllPacks(params?: QueryParams): Promise<PlusApiResultListVipPackVO> {
    return this.client.get<PlusApiResultListVipPackVO>(appApiPath(`/vip/pack-groups/packs`), params);
  }

/** 获取套餐详情 */
  async getPackDetail(packId: string | number): Promise<PlusApiResultVipPackDetailVO> {
    return this.client.get<PlusApiResultVipPackDetailVO>(appApiPath(`/vip/pack-groups/packs/${packId}`));
  }

/** 对比套餐 */
  async comparePacks(params?: QueryParams): Promise<PlusApiResultListVipPackGroupVO> {
    return this.client.get<PlusApiResultListVipPackGroupVO>(appApiPath(`/vip/pack-groups/compare`), params);
  }

/** 获取VIP等级列表 */
  async listVipLevels(): Promise<PlusApiResultListVipLevelVO> {
    return this.client.get<PlusApiResultListVipLevelVO>(appApiPath(`/vip/levels`));
  }

/** 获取邀请规则 */
  async getInviteRules(): Promise<PlusApiResultInviteRulesVO> {
    return this.client.get<PlusApiResultInviteRulesVO>(appApiPath(`/vip/invite/rules`));
  }

/** 获取邀请记录 */
  async getInviteRecords(params?: QueryParams): Promise<PlusApiResultListVipInviteRecordVO> {
    return this.client.get<PlusApiResultListVipInviteRecordVO>(appApiPath(`/vip/invite/records`), params);
  }

/** 获取邀请信息 */
  async getInviteInfo(): Promise<PlusApiResultVipInviteInfoVO> {
    return this.client.get<PlusApiResultVipInviteInfoVO>(appApiPath(`/vip/invite/info`));
  }

/** 获取VIP信息 */
  async getVipInfo(): Promise<PlusApiResultVipInfoVO> {
    return this.client.get<PlusApiResultVipInfoVO>(appApiPath(`/vip/info`));
  }

/** 获取VIP优惠券 */
  async listVipCoupons(): Promise<PlusApiResultListVipCouponVO> {
    return this.client.get<PlusApiResultListVipCouponVO>(appApiPath(`/vip/coupons`));
  }

/** 获取我的优惠券 */
  async listMyCoupons(params?: QueryParams): Promise<PlusApiResultListVipCouponVO> {
    return this.client.get<PlusApiResultListVipCouponVO>(appApiPath(`/vip/coupons/my`), params);
  }

/** 检查VIP状态 */
  async checkVipStatus(): Promise<PlusApiResultBoolean> {
    return this.client.get<PlusApiResultBoolean>(appApiPath(`/vip/check`));
  }

/** 获取VIP权益 */
  async listVipBenefits(params?: QueryParams): Promise<PlusApiResultListVipBenefitVO> {
    return this.client.get<PlusApiResultListVipBenefitVO>(appApiPath(`/vip/benefits`), params);
  }
}

export function createVipApi(client: HttpClient): VipApi {
  return new VipApi(client);
}
