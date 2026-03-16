/** 批量特性检查请求 */
export interface BatchFeatureCheckForm {
  /** 特性标识列表 */
  featureKeys: string[];
  /** 用户属性 */
  userAttributes?: unknown;
}
