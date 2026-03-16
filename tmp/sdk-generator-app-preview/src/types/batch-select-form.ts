/** 批量更新选中状态请求 */
export interface BatchSelectForm {
  /** 购物车项ID列表，为空则表示全选/全不选 */
  itemIds?: number[];
  /** 选中状态 */
  selected: boolean;
}
