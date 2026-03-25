import {
  AbstractStorageService,
  resolveServiceFactoryRuntimeDeps,
} from '@sdkwork/react-mobile-core';
import { getAppImSdk, getAppImSessionIdentity } from '@sdkwork/react-mobile-core/im';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function parseTimestamp(value: unknown): number | undefined {
  const direct = pickNumber(value);
  if (direct !== undefined) {
    return direct > 1_000_000_000_000 ? direct : direct * 1000;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function unwrapRemoteRtcRecords(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }
  if (!isRecord(payload)) {
    return [];
  }

  const candidates = [payload.data, payload.records, payload.items, payload.content];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(isRecord);
    }
  }
  return [];
}

function toCallType(record: Record<string, unknown>, metadata: Record<string, unknown>): CallRecord['type'] {
  const hint = (
    pickString(
      metadata.callType,
      metadata.mediaType,
      metadata.mode,
      record.type,
      record.callType,
      record.mediaType,
      record.mode,
    ) || 'audio'
  ).toLowerCase();

  return hint.includes('video') || hint.includes('camera') ? 'video' : 'audio';
}

function toCallStatus(record: Record<string, unknown>, metadata: Record<string, unknown>): CallRecord['status'] {
  const statusHint = (
    pickString(metadata.callStatus, record.callStatus, record.status) || ''
  ).toLowerCase();
  const directionHint = (
    pickString(metadata.direction, metadata.callDirection, record.direction, record.callDirection) || ''
  ).toLowerCase();

  if (
    statusHint.includes('missed') ||
    statusHint.includes('timeout') ||
    statusHint.includes('failed') ||
    statusHint.includes('cancel') ||
    statusHint.includes('reject')
  ) {
    return 'missed';
  }

  if (directionHint.includes('incoming') || directionHint.includes('inbound') || directionHint.includes('receive')) {
    return 'received';
  }

  return 'outgoing';
}

function toCallDuration(record: Record<string, unknown>): number {
  const direct = pickNumber(record.duration, record.durationSeconds, record.durationSec);
  if (direct !== undefined) {
    return Math.max(0, Math.round(direct));
  }

  const startTime = parseTimestamp(record.startTime);
  const endTime = parseTimestamp(record.endTime);
  if (startTime !== undefined && endTime !== undefined && endTime >= startTime) {
    return Math.round((endTime - startTime) / 1000);
  }

  return 0;
}

function mapRemoteCallRecord(record: Record<string, unknown>, now: number): CallRecord {
  const metadata = isRecord(record.metadata) ? record.metadata : {};
  const timestamp = parseTimestamp(record.startTime) ?? parseTimestamp(record.timestamp) ?? now;
  const id = pickString(record.id, record.recordId, metadata.recordId, record.roomId) || `rtc_${timestamp}`;

  return {
    id,
    contactName:
      pickString(
        metadata.contactName,
        metadata.peerName,
        metadata.targetName,
        record.contactName,
        record.peerName,
        record.targetName,
        record.userId,
        record.roomId,
      ) || 'OpenChat User',
    contactAvatar:
      pickString(
        metadata.contactAvatar,
        metadata.peerAvatar,
        record.contactAvatar,
        record.avatar,
      ) || '',
    type: toCallType(record, metadata),
    status: toCallStatus(record, metadata),
    duration: toCallDuration(record),
    timestamp,
    createTime: parseTimestamp(record.createTime) ?? timestamp,
    updateTime: parseTimestamp(record.updateTime) ?? parseTimestamp(record.endTime) ?? timestamp,
  };
}

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

  private async loadRemoteCallRecords(): Promise<CallRecord[] | null> {
    const sessionIdentity = getAppImSessionIdentity();
    if (!sessionIdentity?.userId) {
      return null;
    }

    const sdk = getAppImSdk();
    const listByUser = sdk?.rtc?.records?.listByUser;
    if (typeof listByUser !== 'function') {
      return null;
    }

    try {
      const remotePayload = await listByUser(sessionIdentity.userId);
      const now = this.deps.clock.now();
      const remoteRecords = unwrapRemoteRtcRecords(remotePayload)
        .map((item) => mapRemoteCallRecord(item, now))
        .sort((left, right) => right.timestamp - left.timestamp);

      this.cache = remoteRecords;
      await this.commit();
      return remoteRecords;
    } catch (error) {
      this.deps.logger.warn(TAG, 'Load remote RTC records failed', error);
      return null;
    }
  }

  async getCallRecords(): Promise<CallRecord[]> {
    const remoteRecords = await this.loadRemoteCallRecords();
    if (remoteRecords) {
      return remoteRecords;
    }

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
