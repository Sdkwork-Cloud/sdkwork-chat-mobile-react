/** 更新隐私设置请求 */
export interface PrivacySettingsUpdateForm {
  /** 是否允许数据收集 */
  dataCollectionEnabled?: boolean;
  /** 是否允许个性化推荐 */
  personalizedRecommendationsEnabled?: boolean;
  /** 是否允许第三方分析 */
  thirdPartyAnalyticsEnabled?: boolean;
  /** 是否允许通知 */
  notificationsEnabled?: boolean;
  /** 是否允许分享使用数据 */
  usageDataSharingEnabled?: boolean;
  /** 是否允许自动保存 */
  autoSaveEnabled?: boolean;
  /** 数据保留期限（天） */
  dataRetentionDays?: number;
  /** 是否允许AI学习 */
  aiLearningEnabled?: boolean;
}
