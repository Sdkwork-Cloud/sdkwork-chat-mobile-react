import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Address } from '../types';

const TAG = 'AddressSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

interface SdkAddressVO {
  id?: string | number;
  addressId?: string | number;
  name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
  addressDetail?: string;
  fullAddress?: string;
  tag?: string;
  label?: string;
  isDefault?: boolean;
  default?: boolean;
  createTime?: number | string;
  updateTime?: number | string;
}

export interface IAddressSdkService {
  hasSdkBaseUrl(): boolean;
  listAddresses(): Promise<Address[] | null>;
  saveAddress(address: Partial<Address>): Promise<Address | null>;
  deleteAddress(id: string): Promise<boolean | null>;
  setDefaultAddress(id: string): Promise<Address | null>;
}

class AddressSdkServiceImpl implements IAddressSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;

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
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }

  private extractAddressList(data: unknown): SdkAddressVO[] {
    if (Array.isArray(data)) return data as SdkAddressVO[];
    if (data && typeof data === 'object') {
      const source = data as Record<string, unknown>;
      const keys = ['list', 'items', 'records', 'content'];
      for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value as SdkAddressVO[];
      }
    }
    return [];
  }

  private mapRemoteAddress(remote: SdkAddressVO | null | undefined, fallback?: Partial<Address>): Address | null {
    if (!remote || typeof remote !== 'object') return null;
    const idRaw = remote.id ?? remote.addressId ?? fallback?.id;
    if (idRaw === undefined || idRaw === null) return null;

    const now = this.deps.clock.now();
    const detail = (remote.detail || remote.addressDetail || remote.fullAddress || fallback?.detail || '').trim();
    if (!detail) return null;

    return {
      id: String(idRaw),
      name: (remote.name || fallback?.name || '').trim(),
      phone: (remote.phone || fallback?.phone || '').trim(),
      province: (remote.province || fallback?.province || '').trim() || undefined,
      city: (remote.city || fallback?.city || '').trim() || undefined,
      district: (remote.district || fallback?.district || '').trim() || undefined,
      detail,
      tag: (remote.tag || remote.label || fallback?.tag || '').trim() || undefined,
      isDefault: typeof remote.isDefault === 'boolean' ? remote.isDefault : (remote.default ?? fallback?.isDefault ?? false),
      createTime: this.toTimestamp(remote.createTime, fallback?.createTime || now),
      updateTime: this.toTimestamp(remote.updateTime, now),
    };
  }

  async listAddresses(): Promise<Address[] | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const endpoints = ['/user/address', '/user/addresses'];
    for (const endpoint of endpoints) {
      try {
        const result = await this.requestJson<SdkApiResult<unknown>>(endpoint, { method: 'GET' }, { includeContentType: false });
        if (!this.isSuccessCode(result.code)) {
          this.deps.logger.warn(TAG, 'SDK listAddresses business failure', {
            endpoint,
            code: result.code,
            message: result.msg,
          });
          continue;
        }

        const mapped = this.extractAddressList(result.data)
          .map((item) => this.mapRemoteAddress(item))
          .filter((item): item is Address => item !== null);

        return mapped;
      } catch (error) {
        this.deps.logger.warn(TAG, 'SDK listAddresses request failed', { endpoint, error });
      }
    }

    return null;
  }

  async saveAddress(address: Partial<Address>): Promise<Address | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const isUpdate = typeof address.id === 'string' && address.id.trim().length > 0;
    const endpoint = isUpdate
      ? `/user/address/${encodeURIComponent(String(address.id))}`
      : '/user/address';
    const method = isUpdate ? 'PUT' : 'POST';

    const body = {
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      tag: address.tag,
      isDefault: address.isDefault,
    };

    try {
      const result = await this.requestJson<SdkApiResult<SdkAddressVO>>(endpoint, {
        method,
        body: JSON.stringify(body),
      });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK saveAddress business failure', { code: result.code, message: result.msg });
        return null;
      }
      return this.mapRemoteAddress(result.data, address);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK saveAddress request failed', error);
      return null;
    }
  }

  async deleteAddress(id: string): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const endpoint = `/user/address/${encodeURIComponent(id)}`;
    try {
      const result = await this.requestJson<SdkApiResult<unknown>>(endpoint, {
        method: 'DELETE',
      });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK deleteAddress business failure', { code: result.code, message: result.msg, id });
        return false;
      }
      return true;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK deleteAddress request failed', { id, error });
      return false;
    }
  }

  async setDefaultAddress(id: string): Promise<Address | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const endpoint = `/user/address/${encodeURIComponent(id)}/default`;
    try {
      const result = await this.requestJson<SdkApiResult<SdkAddressVO>>(endpoint, {
        method: 'PUT',
      });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK setDefaultAddress business failure', { code: result.code, message: result.msg, id });
        return null;
      }
      return this.mapRemoteAddress(result.data, { id, isDefault: true });
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK setDefaultAddress request failed', { id, error });
      return null;
    }
  }
}

export function createAddressSdkService(_deps?: ServiceFactoryDeps): IAddressSdkService {
  return new AddressSdkServiceImpl(_deps);
}

export const addressSdkService: IAddressSdkService = createAddressSdkService();
