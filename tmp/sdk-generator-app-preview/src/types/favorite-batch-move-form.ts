/** 批量移动收藏请求 */
export interface FavoriteBatchMoveForm {
  /** 收藏ID列表 */
  favoriteIds?: string[];
  /** 目标文件夹ID */
  targetFolderId?: string;
  /** 文件夹ID（兼容字段） */
  folderId?: string;
}
