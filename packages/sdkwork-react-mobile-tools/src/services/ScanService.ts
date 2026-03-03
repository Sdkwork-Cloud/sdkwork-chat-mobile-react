import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ScanRecord, ScanType, IScanService } from '../types';

const TAG = 'ScanService';

const createSeedScans = (now: number): Partial<ScanRecord>[] => [
  { id: 'scan_1', content: 'https://example.com', type: 'qrcode', timestamp: now - 3600000 },
  { id: 'scan_2', content: '123456789012', type: 'barcode', timestamp: now - 7200000 },
];

class ScanServiceImpl extends AbstractStorageService<ScanRecord> implements IScanService {
  protected STORAGE_KEY = 'sys_scan_records_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0) {
      const now = this.deps.clock.now();
      this.cache = createSeedScans(now).map((item) => ({
        ...item,
        createTime: now,
        updateTime: now,
      })) as ScanRecord[];
      await this.commit();
      this.deps.logger.info(TAG, 'Seed scan records initialized');
    }
  }

  async getScanRecords(): Promise<ScanRecord[]> {
    const list = await this.findAll({
      sort: { field: 'timestamp', order: 'desc' },
    });
    return list.content || [];
  }

  async addScanRecord(content: string, type: ScanType): Promise<ScanRecord> {
    const now = this.deps.clock.now();
    const newRecord: ScanRecord = {
      id: this.deps.idGenerator.next('scan'),
      content,
      type,
      timestamp: now,
      createTime: now,
      updateTime: now,
    };

    await this.save(newRecord);
    this.deps.logger.info(TAG, 'Scan record added', { id: newRecord.id });
    return newRecord;
  }

  async deleteScanRecord(id: string): Promise<void> {
    await this.deleteById(id);
    this.deps.logger.info(TAG, 'Scan record deleted', { id });
  }
}

export function createScanService(_deps?: ServiceFactoryDeps): IScanService {
  return new ScanServiceImpl(_deps);
}

export const scanService: IScanService = createScanService();
