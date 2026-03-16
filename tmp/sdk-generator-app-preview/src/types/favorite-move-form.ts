/** 移动收藏请求 */
export interface FavoriteMoveForm {
  /** 收藏ID */
  favoriteId?: string;
  /** 目标文件夹ID */
  targetFolderId?: string;
  /** 文件夹ID（兼容字段） */
  folderId?: string;
}
