import { APP_SDK_AUTH_TOKEN_STORAGE_KEY, createAppSdkCoreConfig, getAppSdkCoreClientWithSession, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SdkworkAppClient } from '@sdkwork/app-sdk';
import type { Agent } from '../config/agentRegistry';

const TAG = 'ChatSdkService';

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

  private async getClient(): Promise<SdkworkAppClient> {
    return getAppSdkCoreClientWithSession({
      storage: this.deps.storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });
  }

  hasSdkBaseUrl(): boolean {
    return (createAppSdkCoreConfig().baseUrl || '').trim().length > 0;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private async ensureRemoteSession(request: ChatSdkRequest): Promise<string | null> {
    const mappedSessionId = this.sessionMap.get(request.localSessionId);
    if (mappedSessionId) return mappedSessionId;

    const client = await this.getClient();
    const sessionResult = await client.chat.createSession({
      name: request.agent?.name || 'Chat Session',
      type: 'chat',
      description: request.agent?.description,
      modelId: request.agent?.id,
    }) as SdkApiResult<SdkChatSessionVO>;

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

      const client = await this.getClient();
      const messageResult = await client.chat.sendMessage(remoteSessionId, {
        content: request.prompt,
        type: request.images && request.images.length > 0 ? 'image' : 'text',
        format: 'markdown',
      }) as SdkApiResult<SdkChatMessageVO>;

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
