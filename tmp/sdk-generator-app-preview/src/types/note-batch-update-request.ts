import type { NoteBatchOperationRequest } from './note-batch-operation-request';

/** 笔记批量更新请求 */
export interface NoteBatchUpdateRequest {
  /** 批量操作请求列表 */
  requests: NoteBatchOperationRequest[];
  /** 是否严格模式，true=任一操作失败则整体失败 */
  strict?: boolean;
}
