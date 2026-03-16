/** 语音列表查询请求 */
export interface VoiceListQueryForm {
  /** 语言 */
  language?: string;
  /** 性别 */
  gender?: string;
  /** 风格 */
  style?: string;
  /** 年龄范围 */
  ageRange?: string;
}
