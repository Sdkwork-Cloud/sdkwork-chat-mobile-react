import type { DriveUploadInitVO } from './drive-upload-init-vo';

export interface PlusApiResultDriveUploadInitVO {
  code: string;
  msg: string;
  data?: DriveUploadInitVO;
}
