declare module '@sdkwork/im-backend-sdk' {
  export interface SdkworkBackendConfig {
    baseUrl: string;
    apiKey?: string;
    authToken?: string;
    accessToken?: string;
    tenantId?: string;
    organizationId?: string;
    platform?: string;
    tokenManager?: unknown;
    timeout?: number;
    authMode?: unknown;
    headers?: Record<string, string>;
  }

  export interface SdkworkBackendHttpClient {
    get<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T>;
    post<T = unknown>(path: string, body?: unknown, params?: Record<string, unknown>): Promise<T>;
    put<T = unknown>(path: string, body?: unknown, params?: Record<string, unknown>): Promise<T>;
    delete<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T>;
    request<T = unknown>(
      path: string,
      options?: {
        method?: string;
        body?: unknown;
        params?: Record<string, unknown>;
      },
    ): Promise<T>;
  }

  export class SdkworkBackendClient {
    readonly auth: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly users: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly friends: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly contacts: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly messages: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly messageSearch: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly groups: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly conversations: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly rtc: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly wukongim: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly aiBot: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly agent: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly agentMemory: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly bots: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly botsOpen: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly thirdParty: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly iot: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly craw: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly timeline: Record<string, (...args: unknown[]) => Promise<unknown>>;
    readonly http: SdkworkBackendHttpClient;

    constructor(config: SdkworkBackendConfig);

    setApiKey(apiKey: string): this;
    setAuthToken(token: string): this;
    setAccessToken(token: string): this;
    setTokenManager(manager: unknown): this;
  }

  export function createClient(config: SdkworkBackendConfig): SdkworkBackendClient;
}
