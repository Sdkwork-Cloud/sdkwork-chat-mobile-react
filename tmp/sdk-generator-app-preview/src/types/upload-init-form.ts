/** 上传初始化请求 */
export interface UploadInitForm {
  /** 文件名称 */
  fileName?: string;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 文件MD5 */
  fileMd5?: string;
  /** 文件类型 */
  fileType?: string;
  /** 上传类型：image/video/audio/file */
  uploadType?: string;
  /** 分块大小（字节） */
  chunkSize?: number;
  /** 总块数 */
  totalChunks?: number;
  /** 存储路径 */
  storagePath?: string;
  /** 业务类型 */
  businessType?: string;
  /** 业务ID */
  businessId?: string;
}
