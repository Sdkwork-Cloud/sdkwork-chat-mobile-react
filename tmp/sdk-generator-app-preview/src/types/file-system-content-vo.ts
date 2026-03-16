/** Filesystem file content object */
export interface FileSystemContentVO {
  /** Created at */
  createdAt?: string;
  /** Updated at */
  updatedAt?: string;
  /** Node id */
  nodeId?: string;
  /** Node uuid */
  nodeUuid?: string;
  /** Content id */
  contentId?: string;
  /** File content version */
  fileVersion?: string;
  /** Encoding */
  encoding?: string;
  /** Prompt content */
  prompt?: string;
  /** Thinking content */
  thinkingContent?: string;
  /** Text content */
  text?: string;
  /** Multi-format content map */
  contents?: Record<string, string>;
  /** Character count */
  charCount?: number;
  /** Word count */
  wordCount?: number;
}
