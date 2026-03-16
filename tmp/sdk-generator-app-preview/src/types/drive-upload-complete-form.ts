import type { DriveUploadedPart } from './drive-uploaded-part';

export interface DriveUploadCompleteForm {
  parts: DriveUploadedPart[];
  etag?: string;
}
