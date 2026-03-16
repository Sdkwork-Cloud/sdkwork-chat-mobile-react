import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { AdvertClickForm, AdvertCloseForm, AdvertImpressionForm, AdvertReportForm, AdvertSettingsUpdateForm, PlusApiResultAdvertConfigVO, PlusApiResultAdvertPositionDetailVO, PlusApiResultAdvertSettingsVO, PlusApiResultInterstitialAdvertVO, PlusApiResultListAdvertPositionVO, PlusApiResultListAdvertVO, PlusApiResultListBannerAdvertVO, PlusApiResultListFeedAdvertVO, PlusApiResultPopupAdvertVO, PlusApiResultRewardedAdvertVO, PlusApiResultRewardVerifyVO, PlusApiResultSplashAdvertVO, PlusApiResultVoid, RewardVerifyForm, VideoCompleteForm, VideoProgressForm } from '../types';


export class AdvertApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 广告设置 */
  async getAdvertSettings(): Promise<PlusApiResultAdvertSettingsVO> {
    return this.client.get<PlusApiResultAdvertSettingsVO>(appApiPath(`/advert/settings`));
  }

/** 更新广告设置 */
  async updateAdvertSettings(body: AdvertSettingsUpdateForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/advert/settings`), body);
  }

/** 广告反馈 */
  async report(adId: string | number, body: AdvertReportForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/advert/${adId}/report`), body);
  }

/** 上报播放进度 */
  async trackVideoProgress(adId: string | number, body: VideoProgressForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/advert/${adId}/progress`), body);
  }

/** 上报展示 */
  async trackImpression(adId: string | number, body: AdvertImpressionForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/advert/${adId}/impression`), body);
  }

/** 上报播放完成 */
  async trackVideoComplete(adId: string | number, body: VideoCompleteForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/advert/${adId}/complete`), body);
  }

/** 上报关闭 */
  async trackClose(adId: string | number, body: AdvertCloseForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/advert/${adId}/close`), body);
  }

/** 上报点击 */
  async trackClick(adId: string | number, body: AdvertClickForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/advert/${adId}/click`), body);
  }

/** 屏蔽广告 */
  async block(adId: string | number, params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/advert/${adId}/block`), undefined, params);
  }

/** 验证奖励 */
  async verifyReward(body: RewardVerifyForm): Promise<PlusApiResultRewardVerifyVO> {
    return this.client.post<PlusApiResultRewardVerifyVO>(appApiPath(`/advert/rewarded/verify`), body);
  }

/** 开屏广告 */
  async getSplash(): Promise<PlusApiResultSplashAdvertVO> {
    return this.client.get<PlusApiResultSplashAdvertVO>(appApiPath(`/advert/splash`));
  }

/** 激励视频广告 */
  async getRewarded(params?: QueryParams): Promise<PlusApiResultRewardedAdvertVO> {
    return this.client.get<PlusApiResultRewardedAdvertVO>(appApiPath(`/advert/rewarded`), params);
  }

/** 广告位列表 */
  async listAdvertPositions(): Promise<PlusApiResultListAdvertPositionVO> {
    return this.client.get<PlusApiResultListAdvertPositionVO>(appApiPath(`/advert/positions`));
  }

/** 广告位详情 */
  async getAdvertPosition(positionId: string | number): Promise<PlusApiResultAdvertPositionDetailVO> {
    return this.client.get<PlusApiResultAdvertPositionDetailVO>(appApiPath(`/advert/positions/${positionId}`));
  }

/** 获取位置广告 */
  async getAdsByPosition(positionId: string | number, params?: QueryParams): Promise<PlusApiResultListAdvertVO> {
    return this.client.get<PlusApiResultListAdvertVO>(appApiPath(`/advert/positions/${positionId}/ads`), params);
  }

/** 弹窗广告 */
  async getPopup(): Promise<PlusApiResultPopupAdvertVO> {
    return this.client.get<PlusApiResultPopupAdvertVO>(appApiPath(`/advert/popup`));
  }

/** 插屏广告 */
  async getInterstitial(params?: QueryParams): Promise<PlusApiResultInterstitialAdvertVO> {
    return this.client.get<PlusApiResultInterstitialAdvertVO>(appApiPath(`/advert/interstitial`), params);
  }

/** 信息流广告 */
  async getFeedAdverts(params?: QueryParams): Promise<PlusApiResultListFeedAdvertVO> {
    return this.client.get<PlusApiResultListFeedAdvertVO>(appApiPath(`/advert/feed`), params);
  }

/** 广告配置 */
  async getAdvertConfig(): Promise<PlusApiResultAdvertConfigVO> {
    return this.client.get<PlusApiResultAdvertConfigVO>(appApiPath(`/advert/config`));
  }

/** Banner广告 */
  async getBannerAdverts(params?: QueryParams): Promise<PlusApiResultListBannerAdvertVO> {
    return this.client.get<PlusApiResultListBannerAdvertVO>(appApiPath(`/advert/banner`), params);
  }
}

export function createAdvertApi(client: HttpClient): AdvertApi {
  return new AdvertApi(client);
}
