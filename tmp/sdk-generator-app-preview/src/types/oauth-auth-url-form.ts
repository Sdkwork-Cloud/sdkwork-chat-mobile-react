/** 获取OAuth授权URL请求 */
export interface OAuthAuthUrlForm {
  /** OAuth提供商 */
  provider: 'WECHAT' | 'WECHAT_MINI' | 'QQ' | 'GITHUB' | 'GOOGLE' | 'APPLE';
  /** 回调URL(不填则使用服务端配置的默认回调地址) */
  redirectUri?: string;
  /** 授权范围(不同平台含义不同，如微信的snsapi_userinfo/snsapi_base) */
  scope?: string;
  /** 状态参数(CSRF防护，建议客户端生成随机串，不传则服务端自动生成) */
  state?: string;
}
