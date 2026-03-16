/** Feed create form */
export interface FeedCreateForm {
  /** moment content */
  content: string;
  /** optional title */
  title?: string;
  /** optional category id; default FEEDS category will be used if empty */
  categoryId?: number;
  /** image url list */
  images?: string[];
  /** source */
  source?: string;
  /** source url */
  sourceUrl?: string;
}
