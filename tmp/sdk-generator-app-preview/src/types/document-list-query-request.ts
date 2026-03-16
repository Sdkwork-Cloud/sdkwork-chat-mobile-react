/** List documents query request */
export interface DocumentListQueryRequest {
  /** Keyword for title/content search */
  keyword?: string;
  /** Folder id */
  folderId?: string;
  /** Disk id */
  diskId?: string;
  /** Whether include archived documents */
  includeArchived?: boolean;
  /** Whether include deleted documents */
  includeDeleted?: boolean;
  /** Whether only return favorited documents */
  favoriteOnly?: boolean;
  /** Sort field, allowed: createdAt, updatedAt, name, size */
  sortField?: string;
  /** Sort order, asc or desc */
  sortOrder?: string;
  /** Page number, starts from 1 */
  pageNum?: number;
  /** Page size */
  pageSize?: number;
}
