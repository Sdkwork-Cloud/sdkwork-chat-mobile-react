/** 语音克隆请求 */
export interface VoiceCloneForm {
  /** 样本音频URL */
  sampleAudioUrl: string;
  /** 文本 */
  text: string;
  /** 模型 */
  model?: string;
  /** 格式 */
  format?: string;
}
