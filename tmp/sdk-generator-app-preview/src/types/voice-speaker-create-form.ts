/** 发音人创建请求 */
export interface VoiceSpeakerCreateForm {
  /** 发音人名称 */
  name: string;
  /** 本地化名称 */
  localName?: string;
  /** 发音人代码 */
  code: string;
  /** 头像图片URL */
  faceImageUrl?: string;
  /** 渠道 */
  channel?: string;
  /** 产品名称 */
  product?: string;
  /** 性别: MALE-男, FEMALE-女, NEUTRAL-中性 */
  gender?: string;
  /** 年龄类型: ELDERLY-老人, ADULT-成年, CHILD-儿童 */
  ageType?: string;
  /** 发音人类型: NORMAL-普通, LLM-大模型, CLONE-克隆 */
  type?: string;
  /** 支持的模型列表 */
  models?: string[];
  /** 渠道发音人ID */
  channelSpeakerId?: string;
  /** 版本 */
  version?: string;
  /** 描述 */
  description?: string;
  /** 标签列表 */
  tags?: string[];
}
