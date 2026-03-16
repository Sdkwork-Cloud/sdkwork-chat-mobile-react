/** Copy drive item form */
export interface DriveCopyForm {
  /** Target folder id, use 0 or null for root */
  targetFolderId?: string;
  /** Optional copied item name */
  newName?: string;
}
