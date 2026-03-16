import type { CheckItem } from './check-item';

/** 批量检查收藏请求 */
export interface FavoriteBatchCheckForm {
  /** 收藏类型 */
  favoriteType?: string;
  /** 收藏对象ID列表 */
  targetIds?: string[];
  /** 检查项列表 */
  items?: CheckItem[];
}
