/** 更新收藏文件夹请求 */
export interface FavoriteFolderUpdateForm {
  /** 文件夹ID */
  folderId?: string;
  /** 文件夹名称 */
  folderName?: string;
  /** 父文件夹ID */
  parentFolderId?: string;
  /** 文件夹描述 */
  folderDescription?: string;
}
