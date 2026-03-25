import { APP_SDK_AUTH_TOKEN_STORAGE_KEY, createAppSdkCoreConfig, getAppSdkCoreClientWithSession, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SdkworkAppClient } from '@sdkwork/app-sdk';
import type { Address } from '../types';

const TAG = 'AddressSdkService';

interface SdkApiResult<T> {
  data: T;
  code: string | number;
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

  private async getClient(): Promise<SdkworkAppClient> {
    return getAppSdkCoreClientWithSession({
      storage: this.deps.storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });
  }

  hasSdkBaseUrl(): boolean {
    return (createAppSdkCoreConfig().baseUrl || '').trim().length > 0;
  }

  private isSuccessCode(code: string | number | undefined): boolean {
    return String(code ?? '').trim() === '2000';
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

    try {
      const client = await this.getClient();
      const result = await client.user.listAddresses() as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK listAddresses business failure', {
          code: result.code,
          message: result.msg,
        });
        return null;
      }

      return this.extractAddressList(result.data)
        .map((item) => this.mapRemoteAddress(item))
        .filter((item): item is Address => item !== null);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK listAddresses request failed', { error });
      return null;
    }
  }

  async saveAddress(address: Partial<Address>): Promise<Address | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const isUpdate = typeof address.id === 'string' && address.id.trim().length > 0;
    const addressDetail = (address.detail || '').trim();
    const createBody = {
      name: (address.name || '').trim(),
      phone: (address.phone || '').trim(),
      addressDetail,
      isDefault: address.isDefault,
    };
    const updateBody = {
      name: address.name,
      phone: address.phone,
      addressDetail: addressDetail || undefined,
      isDefault: address.isDefault,
    };

    try {
      const client = await this.getClient();
      const result = isUpdate
        ? await client.user.updateAddress(String(address.id), updateBody) as SdkApiResult<SdkAddressVO>
        : await client.user.createAddress(createBody) as SdkApiResult<SdkAddressVO>;
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

    try {
      const client = await this.getClient();
      const result = await client.user.deleteAddress(id) as SdkApiResult<unknown>;
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

    try {
      const client = await this.getClient();
      const result = await client.user.setDefaultAddress(id) as SdkApiResult<SdkAddressVO>;
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
