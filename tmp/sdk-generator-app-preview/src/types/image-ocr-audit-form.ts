/** 图片OCR审核请求 */
export interface ImageOcrAuditForm {
  /** 图片URL */
  imageUrl: string;
  /** 内容ID */
  contentId?: string;
  /** 检测类型 */
  checkTypes?: string[];
  /** OCR语言 */
  language?: string;
  /** 是否返回OCR全文 */
  returnFullText?: boolean;
}
