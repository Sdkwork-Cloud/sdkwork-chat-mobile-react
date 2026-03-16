/** Prompt enhance response */
export interface PromptEnhanceResponse {
  /** 增强后的提示词 */
  prompt: string;
  /** 预估 token 数 */
  tokensEstimated?: number;
}
