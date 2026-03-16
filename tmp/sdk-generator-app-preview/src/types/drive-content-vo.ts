/** Drive file content */
export interface DriveContentVO {
  /** Created at */
  createdAt?: string;
  /** Updated at */
  updatedAt?: string;
  /** File id */
  fileId?: string;
  /** File uuid */
  fileUuid?: string;
  /** File version */
  fileVersion?: string;
  /** Content id */
  contentId?: string;
  /** Encoding */
  encoding?: string;
  /** Prompt */
  prompt?: string;
  /** Thinking content */
  thinkingContent?: string;
  /** Text */
  text?: string;
  /** Multiformat content map */
  contents?: Record<string, string>;
}
