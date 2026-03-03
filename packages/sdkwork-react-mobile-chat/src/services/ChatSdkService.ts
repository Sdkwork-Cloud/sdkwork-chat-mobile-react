import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Agent } from '../config/agentRegistry';

const TAG = 'ChatSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

interface SdkChatSessionVO {
  id?: string | number;
  sessionId?: string | number;
  title?: string;
}

interface SdkChatMessageVO {
  id?: string | number;
  content?: string;
  text?: string;
  reply?: string;
  answer?: string;
  assistantMessage?: string;
  output?: string;
}

export interface ChatSdkImageInput {
  mimeType: string;
  data: string;
}

export interface ChatSdkRequest {
  localSessionId: string;
  prompt: string;
  agent: Agent;
  images?: ChatSdkImageInput[];
}

export interface ChatSdkReply {
  content: string;
  remoteSessionId?: string;
}

export interface IChatSdkService {
  hasSdkBaseUrl(): boolean;
  requestReply(request: ChatSdkRequest): Promise<ChatSdkReply | null>;
}

class ChatSdkServiceImpl implements IChatSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sessionMap = new Map<string, string>();

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private resolveEnv(name: string): string | undefined {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[name];
  }

  private resolveBaseUrl(): string {
    const value = this.resolveEnv('VITE_API_BASE_URL') || '';
    return value.trim().replace(/\/+$/g, '');
  }

  hasSdkBaseUrl(): boolean {
    return this.resolveBaseUrl().length > 0;
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

  private async resolveAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const accessTokenEnv = this.resolveEnv('VITE_ACCESS_TOKEN');
    const accessTokenStorage = await Promise.resolve(this.deps.storage.get<string>(AUTH_TOKEN_STORAGE_KEY));
    const accessToken = (accessTokenEnv || accessTokenStorage || '').trim();

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      return headers;
    }
    return headers;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private async requestJson<T>(path: string, init: RequestInit): Promise<T> {
    if (typeof fetch !== 'function') {
      throw new Error('Global fetch is not available');
    }

    const headers = await this.resolveAuthHeaders();
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

  private async ensureRemoteSession(request: ChatSdkRequest): Promise<string | null> {
    const mappedSessionId = this.sessionMap.get(request.localSessionId);
    if (mappedSessionId) return mappedSessionId;

    const sessionResult = await this.requestJson<SdkApiResult<SdkChatSessionVO>>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({
        title: request.agent?.name || 'Chat Session',
        agentId: request.agent?.id,
      }),
    });

    if (!this.isSuccessCode(sessionResult.code)) {
      this.deps.logger.warn(TAG, 'Create session failed', {
        code: sessionResult.code,
        message: sessionResult.msg,
      });
      return null;
    }

    const remoteIdRaw = sessionResult.data?.id ?? sessionResult.data?.sessionId;
    if (remoteIdRaw === undefined || remoteIdRaw === null) {
      this.deps.logger.warn(TAG, 'Create session success but session id is missing');
      return null;
    }

    const remoteId = String(remoteIdRaw);
    this.sessionMap.set(request.localSessionId, remoteId);
    return remoteId;
  }

  private extractReplyContent(payload: SdkChatMessageVO | undefined): string {
    if (!payload) return '';
    const candidates = [
      payload.content,
      payload.text,
      payload.reply,
      payload.answer,
      payload.assistantMessage,
      payload.output,
    ];
    for (const candidate of candidates) {
      const text = (candidate || '').trim();
      if (text) return text;
    }
    return '';
  }

  async requestReply(request: ChatSdkRequest): Promise<ChatSdkReply | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const remoteSessionId = await this.ensureRemoteSession(request);
      if (!remoteSessionId) return null;

      const payload = {
        role: 'user',
        content: request.prompt,
        images: (request.images || []).map((item) => ({
          mimeType: item.mimeType,
          data: item.data,
        })),
      };

      const messageResult = await this.requestJson<SdkApiResult<SdkChatMessageVO>>(
        `/chat/sessions/${encodeURIComponent(remoteSessionId)}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      if (!this.isSuccessCode(messageResult.code)) {
        this.deps.logger.warn(TAG, 'Send message failed', {
          code: messageResult.code,
          message: messageResult.msg,
          remoteSessionId,
        });
        return null;
      }

      const content = this.extractReplyContent(messageResult.data);
      if (!content) return null;

      return {
        content,
        remoteSessionId,
      };
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK chat request failed', error);
      return null;
    }
  }
}

export function createChatSdkService(_deps?: ServiceFactoryDeps): IChatSdkService {
  return new ChatSdkServiceImpl(_deps);
}

export const chatSdkService: IChatSdkService = createChatSdkService();
