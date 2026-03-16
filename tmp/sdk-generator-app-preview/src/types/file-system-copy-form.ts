/** Copy node request */
export interface FileSystemCopyForm {
  /** Target parent folder id, null/0 for root */
  targetParentId?: string;
  /** Target disk id, only same-disk copy is currently supported */
  targetDiskId?: string;
  /** Rename copied node */
  name?: string;
  /** Whether copy PlusFileContent together */
  copyContent?: boolean;
}
