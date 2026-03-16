/** 广告设置更新请求 */
export interface AdvertSettingsUpdateForm {
  enabled?: boolean;
  personalized?: boolean;
  maxDailyAds?: number;
  adBlockLevel?: string;
  rewardVideoEnabled?: boolean;
  interstitialEnabled?: boolean;
  bannerEnabled?: boolean;
}
