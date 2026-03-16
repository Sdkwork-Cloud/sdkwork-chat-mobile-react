/** 隐私设置 */
export interface PrivacySettings {
  /** 公开资料 */
  publicProfile?: boolean;
  /** 允许搜索 */
  allowSearch?: boolean;
  /** 允许好友请求 */
  allowFriendRequest?: boolean;
  /** 允许陌生人消息 */
  allowStrangerMessage?: boolean;
  /** 位置共享 */
  locationShare?: boolean;
}
