/** 创建聊天会话请求 */
export interface ChatSessionCreateForm {
  /** 会话名称 */
  name: string;
  /** 会话描述 */
  description?: string;
  /** AI模型ID */
  modelId?: string;
  /** 系统提示词 */
  systemPrompt?: string;
  /** 温度参数 */
  temperature?: number;
  /** 最大token数 */
  maxTokens?: number;
  /** Top P参数 */
  topP?: number;
  /** 会话类型：chat/document/code */
  type?: string;
  /** 关联资源ID */
  resourceId?: string;
}
