import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { FeedbackRecord, FeedbackStatus, FeedbackSubmitInput, FeedbackType } from '../types';

const TAG = 'FeedbackSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

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

  private resolveEnv(name: string): string | undefined {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[name];
  }

  private resolveBaseUrl(): string {
    return (this.resolveEnv('VITE_API_BASE_URL') || '').trim().replace(/\/+$/g, '');
  }

  hasSdkBaseUrl(): boolean {
    return this.resolveBaseUrl().length > 0;
  }

  getLastError(): FeedbackSdkError | null {
    return this.lastError;
  }

  private setLastError(error: FeedbackSdkError | null): void {
    this.lastError = error;
  }

  private buildAppApiPath(path: string): string {
    const normalizedPrefixRaw = APP_API_PREFIX.trim();
    const normalizedPrefix = normalizedPrefixRaw ? `/${normalizedPrefixRaw.replace(/^\/+|\/+$/g, '')}` : '';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (!normalizedPrefix || normalizedPrefix === '/') return normalizedPath;
    if (normalizedPath === normalizedPrefix || normalizedPath.startsWith(`${normalizedPrefix}/`)) return normalizedPath;
    return `${normalizedPrefix}${normalizedPath}`;
  }

  private buildUrl(path: string): string {
    return `${this.resolveBaseUrl()}${this.buildAppApiPath(path)}`;
  }

  private async resolveAuthHeaders(options?: { includeContentType?: boolean }): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (options?.includeContentType !== false) {
      headers['Content-Type'] = 'application/json';
    }

    const envToken = this.resolveEnv('VITE_ACCESS_TOKEN');
    const storageToken = await Promise.resolve(this.deps.storage.get<string>(AUTH_TOKEN_STORAGE_KEY));
    const accessToken = (envToken || storageToken || '').trim();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private async requestJson<T>(path: string, init: RequestInit, options?: { includeContentType?: boolean }): Promise<T> {
    if (typeof fetch !== 'function') {
      throw new Error('Global fetch is not available');
    }

    const headers = await this.resolveAuthHeaders(options);
    const response = await fetch(this.buildUrl(path), {
      ...init,
      headers: {
        ...headers,
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
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
      const result = await this.requestJson<SdkApiResult<SdkFeedbackVO>>('/feedback', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

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
      const result = await this.requestJson<SdkApiResult<unknown>>('/feedback', {
        method: 'GET',
      }, { includeContentType: false });

      if (!this.isSuccessCode(result.code)) {
        this.setLastError({ code: result.code, message: result.msg || 'Feedback list request failed' });
        this.deps.logger.warn(TAG, 'SDK listFeedback business failure', { code: result.code, message: result.msg });
        return null;
      }

      const mapped = this.extractFeedbackList(result.data)
        .map((item) => this.mapFeedback(item, { type: 'other', content: '' }))
        .filter((item): item is FeedbackRecord => item !== null)
        .sort((a, b) => b.submitTime - a.submitTime);

      return mapped;
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
