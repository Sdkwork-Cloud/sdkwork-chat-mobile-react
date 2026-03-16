/** 预签名URL请求 */
export interface PresignedUrlForm {
  /** 对象Key */
  objectKey?: string;
  /** 存储桶名称 */
  bucket?: string;
  /** HTTP方法: GET/PUT/POST/DELETE */
  method?: string;
  /** 过期时间(秒), 默认3600 */
  expirationSeconds?: number;
}
