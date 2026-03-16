/** 导出对话请求 */
export interface ChatExportForm {
  /** 导出格式：markdown/pdf/word/json */
  format: string;
  /** 导出范围：all/last_n */
  scope?: string;
  /** 导出数量（当scope为last_n时） */
  count?: number;
  /** 是否包含思考过程 */
  includeThinking?: boolean;
  /** 是否包含系统消息 */
  includeSystemMessages?: boolean;
  /** 是否包含附件 */
  includeAttachments?: boolean;
  /** 导出文件名称 */
  fileName?: string;
}
