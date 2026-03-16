/** 更新笔记正文请求 */
export interface NoteContentUpdateRequest {
  /** 笔记正文文本 */
  text?: string;
  /** 多格式内容映射 */
  contents?: Record<string, string>;
  /** 提示词内容 */
  prompt?: string;
  /** 思维链内容 */
  thinkingContent?: string;
  /** 编码格式，如 UTF-8 */
  encoding?: string;
  /** 是否自动递增版本号 */
  bumpVersion?: boolean;
}
