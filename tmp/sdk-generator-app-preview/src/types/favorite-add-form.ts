/** 添加收藏请求 */
export interface FavoriteAddForm {
  /** 收藏类型 */
  favoriteType?: string;
  /** 类型（兼容字段） */
  type?: string;
  /** 收藏对象ID */
  targetId?: string;
  /** 收藏名称 */
  favoriteName?: string;
  /** 收藏描述 */
  favoriteDescription?: string;
  /** 文件夹ID */
  folderId?: string;
  /** 标签 */
  tags?: string;
}
