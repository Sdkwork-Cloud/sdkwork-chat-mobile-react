/** Create file request */
export interface FileSystemFileCreateForm {
  /** File name */
  name: string;
  /** Parent folder id, null/0 for root */
  parentId?: string;
  /** Disk id, null means inferred by parent or primary disk */
  diskId?: string;
  /** Mime type */
  mimeType?: string;
  /** Asset type, e.g. DOCUMENT/IMAGE/VIDEO */
  assetType?: string;
  /** File description */
  description?: string;
  /** File tags */
  tags?: string[];
  /** Text content */
  text?: string;
  /** Multi-format content map */
  contents?: Record<string, string>;
  /** Prompt content */
  prompt?: string;
  /** Thinking content */
  thinkingContent?: string;
  /** Encoding */
  encoding?: string;
}
