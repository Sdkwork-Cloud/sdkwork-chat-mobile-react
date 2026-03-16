/** 创建笔记文件夹请求 */
export interface NoteFolderCreateRequest {
  /** 文件夹名称 */
  name?: string;
  /** 父文件夹ID */
  parentId?: string;
  /** 磁盘ID，为空时跟随父目录或默认主盘 */
  diskId?: string;
}
