/** 二维码确认登录请求 */
export interface QrCodeConfirmForm {
  /** 二维码唯一标识 */
  qrKey: string;
  /** 用户访问令牌 */
  token: string;
}
