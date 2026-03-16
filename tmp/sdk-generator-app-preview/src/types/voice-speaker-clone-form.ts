/** 声音克隆请求 */
export interface VoiceSpeakerCloneForm {
  /** 样本音频URL */
  sampleAudioUrl: string;
  /** 说话人名称 */
  speakerName: string;
  /** 语言 */
  language?: string;
  /** 模型 */
  model?: string;
}
