declare module '@openchat/sdkwork-im-sdk' {
  export type OpenChatConnectionState =
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'error';

  export interface OpenChatRealtimeSession {
    uid: string;
    token: string;
    wsUrl: string;
    deviceId?: string;
    deviceFlag?: number | string;
    [key: string]: unknown;
  }

  export interface OpenChatBackendHttpLike {
    get<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T>;
    post<T = unknown>(
      path: string,
      body?: unknown,
      params?: Record<string, unknown>,
    ): Promise<T>;
    put?<T = unknown>(
      path: string,
      body?: unknown,
      params?: Record<string, unknown>,
    ): Promise<T>;
    delete?<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T>;
    request?<T = unknown>(
      path: string,
      options?: {
        method?: string;
        body?: unknown;
        params?: Record<string, unknown>;
      },
    ): Promise<T>;
  }

  export interface OpenChatBackendClientLike {
    setAuthToken?(token: string): unknown;
    setAccessToken?(token: string): unknown;
    http?: OpenChatBackendHttpLike;
    auth?: Record<string, (...args: unknown[]) => Promise<unknown>>;
    messages?: Record<string, (...args: unknown[]) => Promise<unknown>>;
    friends?: Record<string, (...args: unknown[]) => Promise<unknown>>;
    conversations?: Record<string, (...args: unknown[]) => Promise<unknown>>;
    groups?: Record<string, (...args: unknown[]) => Promise<unknown>>;
    contacts?: Record<string, (...args: unknown[]) => Promise<unknown>>;
    rtc?: Record<string, (...args: unknown[]) => Promise<unknown>>;
  }

  export interface OpenChatRealtimeAdapterLike {
    connect(session?: OpenChatRealtimeSession): Promise<OpenChatRealtimeSession>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getSession(): OpenChatRealtimeSession | undefined;
    onMessage(listener: (frame: unknown) => void): () => void;
    onEvent(listener: (frame: unknown) => void): () => void;
    onRaw(listener: (frame: unknown) => void): () => void;
    onConnectionStateChange(listener: (state: OpenChatConnectionState) => void): () => void;
  }

  export interface OpenChatImSdkOptions {
    backendClient: OpenChatBackendClientLike;
    realtimeAdapter?: OpenChatRealtimeAdapterLike;
  }

  export class OpenChatImSdk {
    constructor(options: OpenChatImSdkOptions);
    readonly session: {
      setAccessToken(token: string): unknown;
      setAuthToken(token: string): unknown;
      connectRealtime(session?: OpenChatRealtimeSession): Promise<OpenChatRealtimeSession>;
      disconnectRealtime(): Promise<boolean | void>;
    };
    readonly realtime: {
      onConnectionStateChange(
        listener: (state: OpenChatConnectionState) => void,
      ): () => void;
    };
    readonly rtc: {
      records: {
        listByUser(userId?: string): Promise<unknown>;
      };
    };
  }
}

declare module '@openchat/sdkwork-im-wukongim-adapter' {
  import type { OpenChatConnectionState, OpenChatRealtimeAdapterLike, OpenChatRealtimeSession } from '@openchat/sdkwork-im-sdk';

  export class OpenChatWukongimAdapter implements OpenChatRealtimeAdapterLike {
    connect(session?: OpenChatRealtimeSession): Promise<OpenChatRealtimeSession>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getSession(): OpenChatRealtimeSession | undefined;
    onMessage(listener: (frame: unknown) => void): () => void;
    onEvent(listener: (frame: unknown) => void): () => void;
    onRaw(listener: (frame: unknown) => void): () => void;
    onConnectionStateChange(listener: (state: OpenChatConnectionState) => void): () => void;
  }
}
