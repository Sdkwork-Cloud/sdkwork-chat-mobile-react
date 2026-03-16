/** VIP套餐分组查询请求 */
export interface VipPackGroupQueryForm {
  /** VIP等级ID */
  vipLevelId?: number;
  /** 是否只显示推荐 */
  recommendedOnly?: boolean;
}
