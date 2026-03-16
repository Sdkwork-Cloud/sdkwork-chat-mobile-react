export interface DriveUploadInitForm {
  name: string;
  size: number;
  mimeType?: string;
  parentId?: string;
  conflictPolicy?: 'rename' | 'overwrite' | 'reject';
  chunkSize?: number;
}
