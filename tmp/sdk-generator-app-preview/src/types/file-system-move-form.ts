/** Move node request */
export interface FileSystemMoveForm {
  /** Target parent folder id, null/0 for root */
  targetParentId?: string;
  /** Target disk id, only used when target parent is root */
  targetDiskId?: string;
}
