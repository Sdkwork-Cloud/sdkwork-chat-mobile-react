/** Prompt enhance request */
export interface PromptEnhanceRequest {
  /** 原始提示词 */
  prompt: string;
  /** 场景上下文 */
  scene?: string;
  /** 风格 */
  style?: string;
  /** 语言 */
  language?: string;
  /** 最大词数 */
  maxWords?: number;
}
