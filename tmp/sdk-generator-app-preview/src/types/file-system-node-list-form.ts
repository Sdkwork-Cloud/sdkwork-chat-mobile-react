/** Filesystem node list query form */
export interface FileSystemNodeListForm {
  /** Disk id, null means primary disk */
  diskId?: string;
  /** Parent folder id, null/0 means root */
  parentId?: string;
  /** Fuzzy keyword for node name/description */
  keyword?: string;
  /** Sort field: updatedAt, createdAt, name, size */
  sortField?: string;
  /** Sort order: ASC or DESC */
  sortOrder?: string;
  /** Page number, starts from 1 */
  pageNum?: number;
  /** Page size, max 200 */
  pageSize?: number;
}
