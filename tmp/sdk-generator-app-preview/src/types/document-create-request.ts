/** Create document request */
export interface DocumentCreateRequest {
  /** Document title */
  title?: string;
  /** Document content text */
  content?: string;
  /** Target folder id */
  folderId?: string;
  /** Disk id, null means parent folder disk or primary disk */
  diskId?: string;
  /** Document description */
  description?: string;
  /** Document mime type */
  mimeType?: string;
  /** Tags */
  tags?: string[];
}
