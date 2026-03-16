/** Update document request */
export interface DocumentUpdateRequest {
  /** New document title */
  title?: string;
  /** Target folder id */
  folderId?: string;
  /** Document description */
  description?: string;
  /** Tags */
  tags?: string[];
}
