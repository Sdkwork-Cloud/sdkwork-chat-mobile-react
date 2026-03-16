/** Update file content request */
export interface FileSystemContentUpdateForm {
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
  /** Whether bumping file content version */
  bumpVersion?: boolean;
}
