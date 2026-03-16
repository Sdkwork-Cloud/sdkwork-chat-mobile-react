/** 创建收藏文件夹请求 */
export interface FavoriteFolderCreateForm {
  /** 文件夹名称 */
  folderName?: string;
  /** 名称（兼容字段） */
  name?: string;
  /** 父文件夹ID */
  parentFolderId?: string;
  /** 文件夹描述 */
  folderDescription?: string;
}
