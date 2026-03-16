import type { DriveUploadPartUrlVO } from './drive-upload-part-url-vo';

export interface DriveUploadInitVO {
  uploadId: string;
  uploadUrls?: DriveUploadPartUrlVO[];
  expireAt?: string;
}
