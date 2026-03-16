/** 第三方绑定请求 */
export interface ThirdPartyBindForm {
  /** 第三方平台：wechat/qq/weibo/google/apple */
  platform?: string;
  /** 授权码 */
  code?: string;
  /** 第三方用户ID */
  thirdPartyUserId?: string;
  /** 第三方用户名 */
  thirdPartyUserName?: string;
  /** 第三方用户头像 */
  thirdPartyAvatar?: string;
  /** 授权token */
  accessToken?: string;
  /** 刷新token */
  refreshToken?: string;
  /** 过期时间 */
  expireTime?: string;
}
