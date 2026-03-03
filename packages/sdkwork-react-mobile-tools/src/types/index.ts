import type { BaseEntity } from '@sdkwork/react-mobile-core';

export type ScanType = 'qrcode' | 'barcode';

export interface ScanRecord extends BaseEntity {
  content: string;
  type: ScanType;
  timestamp: number;
}

export interface ToolsState {
  scanRecords: ScanRecord[];
  isLoading: boolean;
  error: string | null;
}

export interface IScanService {
  getScanRecords(): Promise<ScanRecord[]>;
  addScanRecord(content: string, type: ScanType): Promise<ScanRecord>;
  deleteScanRecord(id: string): Promise<void>;
}
