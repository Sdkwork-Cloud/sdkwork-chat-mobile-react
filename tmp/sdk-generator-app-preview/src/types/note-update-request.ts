/** 更新笔记请求 */
export interface NoteUpdateRequest {
  /** 笔记标题 */
  title?: string;
  /** 笔记内容 */
  content?: string;
  /** 标签列表 */
  tags?: string[];
}
