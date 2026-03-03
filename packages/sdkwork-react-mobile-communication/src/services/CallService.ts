import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { CallRecord, ICallService } from '../types';

const TAG = 'CallService';

const createSeedCalls = (now: number): Partial<CallRecord>[] => [
  {
    id: 'call_1',
    contactName: 'Alice',
    contactAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Alice',
    type: 'video',
    status: 'received',
    duration: 125,
    timestamp: now - 3600000,
  },
  {
    id: 'call_2',
    contactName: 'Bob',
    contactAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Bob',
    type: 'audio',
    status: 'missed',
    duration: 0,
    timestamp: now - 7200000,
  },
  {
    id: 'call_3',
    contactName: 'Charlie',
    contactAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Charlie',
    type: 'video',
    status: 'outgoing',
    duration: 300,
    timestamp: now - 86400000,
  },
];

class CallServiceImpl extends AbstractStorageService<CallRecord> implements ICallService {
  protected STORAGE_KEY = 'sys_call_records_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0) {
      const now = this.deps.clock.now();
      this.cache = createSeedCalls(now).map((item) => ({
        ...item,
        createTime: now,
        updateTime: now,
      })) as CallRecord[];
      await this.commit();
      this.deps.logger.info(TAG, 'Seed call records initialized');
    }
  }

  async getCallRecords(): Promise<CallRecord[]> {
    const page = await this.findAll({
      sort: { field: 'timestamp', order: 'desc' },
    });
    return page.content || [];
  }

  async addCallRecord(record: Partial<CallRecord>): Promise<CallRecord> {
    const now = this.deps.clock.now();
    const newRecord: CallRecord = {
      id: this.deps.idGenerator.next('call'),
      contactName: record.contactName || '',
      contactAvatar: record.contactAvatar || '',
      type: record.type || 'audio',
      status: record.status || 'outgoing',
      duration: record.duration || 0,
      timestamp: record.timestamp || now,
      createTime: now,
      updateTime: now,
    };

    await this.save(newRecord);
    this.deps.logger.info(TAG, 'Call record added', { id: newRecord.id });
    return newRecord;
  }

  async deleteCallRecord(id: string): Promise<void> {
    await this.deleteById(id);
    this.deps.logger.info(TAG, 'Call record deleted', { id });
  }
}

export function createCallService(_deps?: ServiceFactoryDeps): ICallService {
  return new CallServiceImpl(_deps);
}

export const callService: ICallService = createCallService();
