/** 二维码生成响应 */
export interface QrCodeVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 二维码唯一标识 */
  qrKey?: string;
  /** 二维码图片URL */
  qrUrl?: string;
  /** 二维码内容(用于前端生成) */
  qrContent?: string;
  /** 过期时间(秒) */
  expireTime?: number;
}
