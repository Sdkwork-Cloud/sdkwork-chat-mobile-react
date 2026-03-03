import type { BaseEntity } from '@sdkwork/react-mobile-core';

export type CallType = 'audio' | 'video';
export type CallStatus = 'missed' | 'received' | 'outgoing';

export interface CallRecord extends BaseEntity {
  contactName: string;
  contactAvatar: string;
  type: CallType;
  status: CallStatus;
  duration: number;
  timestamp: number;
}

export interface CommunicationState {
  callRecords: CallRecord[];
  isLoading: boolean;
  error: string | null;
}

export interface ICallService {
  getCallRecords(): Promise<CallRecord[]>;
  addCallRecord(record: Partial<CallRecord>): Promise<CallRecord>;
  deleteCallRecord(id: string): Promise<void>;
}
