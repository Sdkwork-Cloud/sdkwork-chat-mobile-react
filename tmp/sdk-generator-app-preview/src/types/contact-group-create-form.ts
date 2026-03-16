/** Create contact group request */
export interface ContactGroupCreateForm {
  /** Group name */
  name: string;
  /** Member ids */
  memberIds?: string[];
}
