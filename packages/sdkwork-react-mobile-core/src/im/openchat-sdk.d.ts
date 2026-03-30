declare module '@openchat/sdkwork-im-sdk' {
  export interface OpenChatActionResult {
    success: boolean;
    requestId?: string;
  }

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
      getState(): Record<string, unknown>;
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
    readonly messages: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly conversations: {
      create(payload: Record<string, unknown>): Promise<unknown>;
      list(params?: Record<string, unknown>): Promise<unknown>;
      getSyncState(params: Record<string, unknown>): Promise<unknown>;
      getSyncStates(payload: Record<string, unknown>): Promise<unknown>;
      deleteDeviceSyncState(deviceId: string): Promise<unknown>;
      getDeviceSyncStateSummaries(params?: Record<string, unknown>): Promise<unknown>;
      deleteStaleDeviceSyncStates(params?: Record<string, unknown>): Promise<unknown>;
      getByTarget(targetId: string, params: Record<string, unknown>): Promise<unknown>;
      getTotalUnreadCount(): Promise<unknown>;
      get(id: string): Promise<unknown>;
      update(id: string, payload: Record<string, unknown>): Promise<unknown>;
      delete(id: string): Promise<boolean>;
      pin(id: string, isPinned: boolean): Promise<boolean>;
      mute(id: string, isMuted: boolean): Promise<boolean>;
      clearUnreadCount(id: string): Promise<boolean>;
      batchDelete(ids: string[]): Promise<unknown>;
    };
    readonly groups: {
      create(payload: Record<string, unknown>): Promise<unknown>;
      get(id: string): Promise<unknown>;
      update(id: string, payload: Record<string, unknown>): Promise<unknown>;
      delete(id: string): Promise<boolean>;
      addMember(groupId: string, payload: Record<string, unknown>): Promise<unknown>;
      members(groupId: string): Promise<unknown>;
      removeMember(groupId: string, userId: string): Promise<boolean>;
      updateMemberRole(groupId: string, userId: string, role: string): Promise<boolean>;
      listByUser(userId?: string): Promise<unknown>;
      sendInvitation(payload: Record<string, unknown>): Promise<unknown>;
      acceptInvitation(invitationId: string): Promise<boolean>;
      rejectInvitation(invitationId: string): Promise<boolean>;
      cancelInvitation(invitationId: string): Promise<boolean>;
      addToBlacklist(groupId: string, userId: string): Promise<boolean>;
      getBlacklist(groupId: string): Promise<unknown>;
      removeFromBlacklist(groupId: string, userId: string): Promise<boolean>;
      addToWhitelist(groupId: string, userId: string): Promise<boolean>;
      getWhitelist(groupId: string): Promise<unknown>;
      removeFromWhitelist(groupId: string, userId: string): Promise<boolean>;
      kickMember(groupId: string, userId: string): Promise<boolean>;
      quit(groupId: string, userId?: string): Promise<boolean>;
      updateAnnouncement(groupId: string, announcement: string): Promise<unknown>;
      setMuteAll(groupId: string, muteAll: boolean): Promise<unknown>;
      muteMember(groupId: string, userId: string, duration: number): Promise<boolean>;
      transfer(groupId: string, newOwnerId: string): Promise<unknown>;
    };
    readonly contacts: {
      create(payload: Record<string, unknown>): Promise<unknown>;
      list(params?: Record<string, unknown>): Promise<unknown>;
      get(id: string): Promise<unknown>;
      update(id: string, payload: Record<string, unknown>): Promise<unknown>;
      delete(id: string): Promise<boolean>;
      batchDelete(ids: string[]): Promise<unknown>;
      setFavorite(id: string, isFavorite: boolean): Promise<boolean>;
      setRemark(id: string, remark: string): Promise<boolean>;
      addTag(id: string, tag: string): Promise<boolean>;
      removeTag(id: string, tag: string): Promise<boolean>;
      search(userId: string, keyword: string): Promise<unknown>;
      getStats(userId?: string): Promise<unknown>;
    };
    readonly friends: {
      request(payload: { toUserId: string; message?: string }): Promise<OpenChatActionResult>;
      accept(requestId: string): Promise<boolean>;
      reject(requestId: string): Promise<boolean>;
      cancel(requestId: string): Promise<boolean>;
      remove(friendId: string): Promise<boolean>;
      list(): Promise<unknown>;
      requests(params?: Record<string, unknown>): Promise<unknown>;
      sentRequests(): Promise<unknown>;
      checkFriendship(friendId: string): Promise<unknown>;
      block(friendId: string): Promise<boolean>;
      unblock(friendId: string): Promise<boolean>;
      checkBlocked(friendId: string): Promise<unknown>;
    };
    readonly rtc: {
      connection: {
        get(roomId: string, request?: Record<string, unknown>): Promise<unknown>;
        prepareCall(
          roomId: string,
          request?: Record<string, unknown>,
          applyRealtimeSession?: boolean,
        ): Promise<unknown>;
      };
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
