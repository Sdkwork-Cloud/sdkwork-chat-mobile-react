/** 发音人查询请求 */
export interface VoiceSpeakerQueryForm {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 关键词 */
  keyword?: string;
  /** 性别: MALE-男, FEMALE-女, NEUTRAL-中性 */
  gender?: string;
  /** 年龄类型: ELDERLY-老人, ADULT-成年, CHILD-儿童 */
  ageType?: string;
  /** 发音人类型: NORMAL-普通, LLM-大模型, CLONE-克隆 */
  type?: string;
  /** 渠道 */
  channel?: string;
  /** 状态: ACTIVE-激活, INACTIVE-未激活, DEPRECATED-弃用 */
  status?: string;
}
