/** 语音转文本请求 */
export interface AudioTranscriptionForm {
  /** 音频URL */
  audioUrl: string;
  /** 模型 */
  model?: string;
  /** 语言 */
  language?: string;
  /** 格式 */
  format?: string;
}
