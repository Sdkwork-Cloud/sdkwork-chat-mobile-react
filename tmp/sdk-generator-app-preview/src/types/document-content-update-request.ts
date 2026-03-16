/** Update document content request */
export interface DocumentContentUpdateRequest {
  /** Document text content */
  text?: string;
  /** Multiformat content map */
  contents?: Record<string, string>;
  /** Prompt content */
  prompt?: string;
  /** Thinking content */
  thinkingContent?: string;
  /** Encoding, e.g. UTF-8 */
  encoding?: string;
}
