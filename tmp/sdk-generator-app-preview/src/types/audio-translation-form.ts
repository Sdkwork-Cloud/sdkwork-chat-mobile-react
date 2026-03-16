/** 语音翻译请求 */
export interface AudioTranslationForm {
  /** 音频URL */
  audioUrl: string;
  /** 目标语言 */
  targetLanguage: string;
  /** 模型 */
  model?: string;
  /** 源语言 */
  sourceLanguage?: string;
  /** 格式 */
  format?: string;
}
