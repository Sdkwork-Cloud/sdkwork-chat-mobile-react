import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CouponPointsExchangeForm, CouponRedeemForm, CouponRollbackForm, PlusApiResultCouponStatisticsVO, PlusApiResultCouponVO, PlusApiResultPageCouponVO, PlusApiResultPageUserCouponVO, PlusApiResultUserCouponVO } from '../types';


export class CouponsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 领取优惠券 */
  async receiveCoupon(couponId: string | number): Promise<PlusApiResultUserCouponVO> {
    return this.client.post<PlusApiResultUserCouponVO>(appApiPath(`/coupons/${couponId}/receive`));
  }

/** 积分兑换优惠券 */
  async exchangeCouponByPoints(couponId: string | number, body: CouponPointsExchangeForm): Promise<PlusApiResultUserCouponVO> {
    return this.client.post<PlusApiResultUserCouponVO>(appApiPath(`/coupons/${couponId}/exchange/points`), body);
  }

/** 兑换优惠券 */
  async redeemCoupon(body: CouponRedeemForm): Promise<PlusApiResultUserCouponVO> {
    return this.client.post<PlusApiResultUserCouponVO>(appApiPath(`/coupons/redeem`), body);
  }

/** 使用优惠券 */
  async useCoupon(userCouponId: string | number, params?: QueryParams): Promise<PlusApiResultUserCouponVO> {
    return this.client.post<PlusApiResultUserCouponVO>(appApiPath(`/coupons/my/${userCouponId}/use`), undefined, params);
  }

/** 回滚积分兑换优惠券 */
  async rollbackPointsExchangeCoupon(userCouponId: string | number, body?: CouponRollbackForm): Promise<PlusApiResultUserCouponVO> {
    return this.client.post<PlusApiResultUserCouponVO>(appApiPath(`/coupons/my/${userCouponId}/rollback`), body);
  }

/** 取消使用优惠券 */
  async cancelUseCoupon(userCouponId: string | number): Promise<PlusApiResultUserCouponVO> {
    return this.client.post<PlusApiResultUserCouponVO>(appApiPath(`/coupons/my/${userCouponId}/cancel`));
  }

/** 获取可领取优惠券列表 */
  async listCoupons(params?: QueryParams): Promise<PlusApiResultPageCouponVO> {
    return this.client.get<PlusApiResultPageCouponVO>(appApiPath(`/coupons`), params);
  }

/** 获取优惠券详情 */
  async getCouponDetail(couponId: string | number): Promise<PlusApiResultCouponVO> {
    return this.client.get<PlusApiResultCouponVO>(appApiPath(`/coupons/${couponId}`));
  }

/** 获取优惠券统计 */
  async getStatistics(): Promise<PlusApiResultCouponStatisticsVO> {
    return this.client.get<PlusApiResultCouponStatisticsVO>(appApiPath(`/coupons/statistics`));
  }

/** 获取我的优惠券列表 */
  async getMy(params?: QueryParams): Promise<PlusApiResultPageUserCouponVO> {
    return this.client.get<PlusApiResultPageUserCouponVO>(appApiPath(`/coupons/my`), params);
  }

/** 获取用户优惠券详情 */
  async getUserCouponDetail(userCouponId: string | number): Promise<PlusApiResultUserCouponVO> {
    return this.client.get<PlusApiResultUserCouponVO>(appApiPath(`/coupons/my/${userCouponId}`));
  }

/** 获取可用优惠券列表 */
  async getAvailable(params?: QueryParams): Promise<PlusApiResultPageUserCouponVO> {
    return this.client.get<PlusApiResultPageUserCouponVO>(appApiPath(`/coupons/my/available`), params);
  }
}

export function createCouponsApi(client: HttpClient): CouponsApi {
  return new CouponsApi(client);
}
