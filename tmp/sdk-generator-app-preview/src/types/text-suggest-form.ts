/** 文本替换建议请求 */
export interface TextSuggestForm {
  /** 待处理文本 */
  text: string;
  /** 建议类型 */
  suggestType?: 'replace' | 'delete' | 'rewrite';
  /** 场景类型 */
  scene?: string;
}
