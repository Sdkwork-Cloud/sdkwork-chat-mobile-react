/** 笔记批量操作请求 */
export interface NoteBatchOperationRequest {
  /** 操作类型：INSERT_TEXT、DELETE_RANGE、REPLACE_ALL_TEXT、REPLACE_RANGE */
  type: string;
  /** INSERT_TEXT 的插入索引 */
  index?: number;
  /** DELETE_RANGE/REPLACE_RANGE 的起始索引 */
  startIndex?: number;
  /** DELETE_RANGE/REPLACE_RANGE 的结束索引 */
  endIndex?: number;
  /** INSERT_TEXT/REPLACE_RANGE 的文本 */
  text?: string;
  /** REPLACE_ALL_TEXT 的查找文本 */
  searchText?: string;
  /** REPLACE_ALL_TEXT 的替换文本 */
  replaceText?: string;
}
