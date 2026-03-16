import type { DocumentBatchOperationRequest } from './document-batch-operation-request';

/** Batch update request similar to Google Docs batchUpdate */
export interface DocumentBatchUpdateRequest {
  /** Batch operation requests */
  requests: DocumentBatchOperationRequest[];
  /** Whether invalid operation should fail the whole batch */
  strict?: boolean;
}
