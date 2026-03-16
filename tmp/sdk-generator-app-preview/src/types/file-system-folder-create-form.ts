/** Create folder request */
export interface FileSystemFolderCreateForm {
  /** Folder name */
  name: string;
  /** Parent folder id, null/0 for root */
  parentId?: string;
  /** Disk id, null means inferred by parent or primary disk */
  diskId?: string;
  /** Folder description */
  description?: string;
  /** Folder tags */
  tags?: string[];
}
