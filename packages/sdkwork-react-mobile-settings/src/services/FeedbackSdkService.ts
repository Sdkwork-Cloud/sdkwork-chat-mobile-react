import { APP_SDK_AUTH_TOKEN_STORAGE_KEY, createAppSdkCoreConfig, getAppSdkCoreClientWithSession, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SdkworkAppClient } from '@sdkwork/app-sdk';
import type { FeedbackRecord, FeedbackStatus, FeedbackSubmitInput, FeedbackType } from '../types';

const TAG = 'FeedbackSdkService';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
  ip?: string;
  hostname?: string;
  errorName?: string;
}

interface SdkFeedbackVO {
  id?: string | number;
  feedbackId?: string | number;
  type?: string;
  content?: string;
  contact?: string;
  status?: string;
  submitTime?: string | number;
  processTime?: string | number;
  createdAt?: string | number;
  createTime?: string | number;
  updatedAt?: string | number;
  updateTime?: string | number;
}

export interface FeedbackSdkError {
  code?: string;
  message: string;
}

export interface IFeedbackSdkService {
  hasSdkBaseUrl(): boolean;
  getLastError(): FeedbackSdkError | null;
  submitFeedback(input: FeedbackSubmitInput): Promise<FeedbackRecord | null>;
  listFeedback(): Promise<FeedbackRecord[] | null>;
}

class FeedbackSdkServiceImpl implements IFeedbackSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private lastError: FeedbackSdkError | null = null;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private async getClient(): Promise<SdkworkAppClient> {
    return getAppSdkCoreClientWithSession({
      storage: this.deps.storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });
  }

  hasSdkBaseUrl(): boolean {
    const baseUrl = (createAppSdkCoreConfig().baseUrl || '').trim();
    if (!baseUrl) return false;
    const authToken = this.readAuthToken();
    return authToken.length > 0;
  }

  getLastError(): FeedbackSdkError | null {
    return this.lastError;
  }

  private setLastError(error: FeedbackSdkError | null): void {
    this.lastError = error;
  }

  private readAuthToken(): string {
    try {
      const raw = this.deps.storage.get<string | null | undefined>(APP_SDK_AUTH_TOKEN_STORAGE_KEY);
      if (typeof raw !== 'string') return '';
      const normalized = raw.trim();
      if (!normalized) return '';
      return normalized.toLowerCase().startsWith('bearer ')
        ? normalized.slice(7).trim()
        : normalized;
    } catch {
      // Platform runtime may be unavailable in tests or early bootstrap.
      return '';
    }
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private toTimestamp(value: unknown, fallback: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
  }

  private normalizeType(value: unknown, fallback: FeedbackType): FeedbackType {
    const raw = typeof value === 'string' ? value.toLowerCase() : '';
    const supported: FeedbackType[] = ['bug', 'suggestion', 'complaint', 'other'];
    return supported.includes(raw as FeedbackType) ? (raw as FeedbackType) : fallback;
  }

  private normalizeStatus(value: unknown): FeedbackStatus {
    const raw = typeof value === 'string' ? value.toLowerCase() : '';
    const supported: FeedbackStatus[] = ['submitted', 'processing', 'resolved', 'closed'];
    return supported.includes(raw as FeedbackStatus) ? (raw as FeedbackStatus) : 'submitted';
  }

  private extractFeedbackList(data: unknown): SdkFeedbackVO[] {
    if (Array.isArray(data)) return data as SdkFeedbackVO[];
    if (data && typeof data === 'object') {
      const source = data as Record<string, unknown>;
      const keys = ['content', 'items', 'records', 'list'];
      for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value as SdkFeedbackVO[];
      }
    }
    return [];
  }

  private mapFeedback(
    remote: SdkFeedbackVO | null | undefined,
    fallback: { type: FeedbackType; content: string; contact?: string }
  ): FeedbackRecord | null {
    if (!remote || typeof remote !== 'object') return null;

    const now = this.deps.clock.now();
    const idRaw = remote.id ?? remote.feedbackId ?? this.deps.idGenerator.next('feedback_remote');
    if (idRaw === undefined || idRaw === null) return null;

    const createTime = this.toTimestamp(remote.createTime ?? remote.createdAt, now);
    const submitTime = this.toTimestamp(remote.submitTime, createTime);
    const updateTime = this.toTimestamp(remote.updateTime ?? remote.updatedAt, submitTime);
    const processTime = this.toTimestamp(remote.processTime, 0);

    return {
      id: String(idRaw),
      createTime,
      updateTime,
      type: this.normalizeType(remote.type, fallback.type),
      content: (remote.content || '').trim() || fallback.content,
      contact: (remote.contact || '').trim() || fallback.contact,
      status: this.normalizeStatus(remote.status),
      submitTime,
      processTime: processTime > 0 ? processTime : undefined,
    };
  }

  async submitFeedback(input: FeedbackSubmitInput): Promise<FeedbackRecord | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);

    const payload = {
      type: input.type,
      content: input.content,
      contact: input.contact,
      attachmentUrl: input.attachmentUrl,
      screenshotUrl: input.screenshotUrl,
    };

    try {
      const client = await this.getClient();
      const result = await client.feedback.submit(payload) as SdkApiResult<SdkFeedbackVO>;

      if (!this.isSuccessCode(result.code)) {
        this.setLastError({ code: result.code, message: result.msg || 'Feedback submit failed' });
        this.deps.logger.warn(TAG, 'SDK submitFeedback business failure', { code: result.code, message: result.msg });
        return null;
      }

      const mapped = this.mapFeedback(result.data, {
        type: input.type,
        content: input.content,
        contact: input.contact,
      });

      if (!mapped) {
        this.setLastError({ message: 'Feedback response data is invalid' });
      }
      return mapped;
    } catch (error) {
      this.setLastError({
        message: error instanceof Error ? error.message : 'Feedback submit request failed',
      });
      this.deps.logger.warn(TAG, 'SDK submitFeedback request failed', error);
      return null;
    }
  }

  async listFeedback(): Promise<FeedbackRecord[] | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);

    try {
      const client = await this.getClient();
      const result = await client.feedback.listFeedback({ page: 0, size: 100 }) as SdkApiResult<unknown>;

      if (!this.isSuccessCode(result.code)) {
        this.setLastError({ code: result.code, message: result.msg || 'Feedback list request failed' });
        this.deps.logger.warn(TAG, 'SDK listFeedback business failure', { code: result.code, message: result.msg });
        return null;
      }

      return this.extractFeedbackList(result.data)
        .map((item) => this.mapFeedback(item, { type: 'other', content: '' }))
        .filter((item): item is FeedbackRecord => item !== null)
        .sort((a, b) => b.submitTime - a.submitTime);
    } catch (error) {
      this.setLastError({
        message: error instanceof Error ? error.message : 'Feedback list request failed',
      });
      this.deps.logger.warn(TAG, 'SDK listFeedback request failed', error);
      return null;
    }
  }
}

export function createFeedbackSdkService(_deps?: ServiceFactoryDeps): IFeedbackSdkService {
  return new FeedbackSdkServiceImpl(_deps);
}

export const feedbackSdkService: IFeedbackSdkService = createFeedbackSdkService();
