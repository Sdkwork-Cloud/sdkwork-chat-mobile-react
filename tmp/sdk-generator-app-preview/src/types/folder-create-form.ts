/** 文件夹创建请求 */
export interface FolderCreateForm {
  /** 文件夹名称 */
  name: string;
  /** 父文件夹ID */
  parentId?: string;
}
