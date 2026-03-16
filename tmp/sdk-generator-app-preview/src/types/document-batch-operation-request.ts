/** Batch operation request for document content */
export interface DocumentBatchOperationRequest {
  /** Operation type: INSERT_TEXT, DELETE_RANGE, REPLACE_ALL_TEXT, REPLACE_RANGE */
  type: string;
  /** Insert index for INSERT_TEXT */
  index?: number;
  /** Range start index for DELETE_RANGE/REPLACE_RANGE */
  startIndex?: number;
  /** Range end index for DELETE_RANGE/REPLACE_RANGE */
  endIndex?: number;
  /** Text for INSERT_TEXT/REPLACE_RANGE */
  text?: string;
  /** Search text for REPLACE_ALL_TEXT */
  searchText?: string;
  /** Replace text for REPLACE_ALL_TEXT */
  replaceText?: string;
}
