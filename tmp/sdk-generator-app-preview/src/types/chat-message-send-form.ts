/** 发送聊天消息请求 */
export interface ChatMessageSendForm {
  /** 会话ID */
  sessionId?: number;
  /** 消息内容 */
  content: string;
  /** 消息类型：text/image/audio/video/file */
  type?: string;
  /** 消息格式：plain/markdown */
  format?: string;
  /** 引用消息ID */
  quoteMessageId?: number;
  /** 是否需要思考过程 */
  needThinking?: boolean;
  /** 是否流式响应 */
  streaming?: boolean;
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
}
