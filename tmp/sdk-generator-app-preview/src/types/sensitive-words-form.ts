/** 敏感词检测请求 */
export interface SensitiveWordsForm {
  /** 待检测文本 */
  text: string;
  /** 敏感词库类型 */
  wordListType?: 'default' | 'strict' | 'custom';
  /** 检测模式 */
  mode?: 'detect' | 'highlight' | 'replace';
  /** 替换字符 */
  replacement?: string;
  /** 指定敏感词类别 */
  categories?: string[];
}
