/** Drive file content update form */
export interface DriveContentUpdateForm {
  /** Text content */
  text?: string;
  /** Multiformat content map */
  contents?: Record<string, string>;
  /** Prompt content */
  prompt?: string;
  /** Thinking content */
  thinkingContent?: string;
  /** Text encoding, e.g. UTF-8 */
  encoding?: string;
}
