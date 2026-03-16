/** Contact query request */
export interface ContactQueryForm {
  /** Search keyword */
  keyword?: string;
  /** Region filter */
  region?: string;
  /** Online status filter */
  isOnline?: boolean;
}
