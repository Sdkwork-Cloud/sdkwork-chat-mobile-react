/** Create drive folder form */
export interface DriveFolderCreateForm {
  /** Folder name */
  name: string;
  /** Parent folder id, keep null for root */
  parentId?: string;
  /** Disk id, keep null for parent disk or current user's primary disk */
  diskId?: string;
}
