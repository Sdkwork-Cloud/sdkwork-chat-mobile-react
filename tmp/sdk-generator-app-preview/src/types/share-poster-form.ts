/** 生成分享海报请求 */
export interface SharePosterForm {
  /** 分享类型 */
  shareType?: string;
  /** 分享ID */
  shareId?: string;
  /** 海报模板 */
  template?: string;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 文字颜色 */
  textColor?: string;
  /** 是否包含二维码 */
  includeQrCode?: boolean;
  /** 自定义文字 */
  customText?: string;
}
