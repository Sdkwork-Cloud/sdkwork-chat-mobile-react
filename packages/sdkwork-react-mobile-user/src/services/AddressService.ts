import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Address, IAddressService } from '../types';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import { createAddressSdkService } from './AddressSdkService';
import type { IAddressSdkService } from './AddressSdkService';

const TAG = 'AddressService';
const ADDRESS_EVENTS = {
  UPDATED: 'user:address_updated',
  ADDED: 'user:address_added',
} as const;

/**
 * 地址服务实现
 */
class AddressServiceImpl extends AbstractStorageService<Address> implements IAddressService {
  protected STORAGE_KEY = 'sys_user_addresses_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: IAddressSdkService;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createAddressSdkService(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0) {
      const now = this.deps.clock.now();
      const defaultAddress: Address = {
        id: 'addr_default',
        name: 'AI User',
        phone: '13800138000',
        detail: 'No. 888 Innovation Avenue, Hangzhou',
        tag: '公司',
        isDefault: true,
        createTime: now,
        updateTime: now,
      };
      list.push(defaultAddress);
      this.cache = list;
      await this.commit();
      this.deps.logger.info(TAG, 'Default address created');
    }
  }

  /**
   * 获取所有地址
   */
  async getAddresses(): Promise<Address[]> {
    const remoteList = await this.sdkService.listAddresses();
    if (remoteList) {
      const list = [...remoteList];
      this.cache = list;
      await this.commit();
      return list.sort((a: Address, b: Address) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return 0;
      });
    }

    const page = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });

    const addresses = page.content;

    return addresses.sort((a: Address, b: Address) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  }

  /**
   * 保存地址
   */
  async saveAddress(address: Partial<Address>): Promise<Address> {
    const remoteAddress = await this.sdkService.saveAddress(address);
    if (remoteAddress) {
      if (remoteAddress.isDefault) {
        const page = await this.findAll();
        for (const addr of page.content) {
          if (addr.isDefault && addr.id !== remoteAddress.id) {
            addr.isDefault = false;
            await this.save(addr);
          }
        }
      }

      await this.save(remoteAddress);

      if (address.id) {
        this.deps.eventBus.emit(ADDRESS_EVENTS.UPDATED, { address: remoteAddress });
      } else {
        this.deps.eventBus.emit(ADDRESS_EVENTS.ADDED, { address: remoteAddress });
      }

      this.deps.logger.info(TAG, 'Address saved through SDK', { addressId: remoteAddress.id });
      return remoteAddress;
    }

    // 如果设置为默认，取消其他默认地址
    if (address.isDefault) {
      const page = await this.findAll();
      for (const addr of page.content) {
        if (addr.isDefault && addr.id !== address.id) {
          addr.isDefault = false;
          await this.save(addr);
        }
      }
    }

    const now = this.deps.clock.now();
    const newAddress: Address = {
      id: address.id || this.deps.idGenerator.next('addr'),
      name: address.name || '',
      phone: address.phone || '',
      detail: address.detail || '',
      tag: address.tag,
      isDefault: address.isDefault || false,
      createTime: address.id ? address.createTime || now : now,
      updateTime: now,
    };

    await this.save(newAddress);

    if (address.id) {
      this.deps.eventBus.emit(ADDRESS_EVENTS.UPDATED, { address: newAddress });
    } else {
      this.deps.eventBus.emit(ADDRESS_EVENTS.ADDED, { address: newAddress });
    }

    this.deps.logger.info(TAG, 'Address saved', { addressId: newAddress.id });
    return newAddress;
  }

  /**
   * 删除地址
   */
  async deleteAddress(id: string): Promise<void> {
    const sdkDeleteResult = await this.sdkService.deleteAddress(id);
    if (sdkDeleteResult) {
      await this.deleteById(id);
      this.deps.logger.info(TAG, 'Address deleted through SDK', { addressId: id });
      return;
    }

    await this.deleteById(id);
    this.deps.logger.info(TAG, 'Address deleted', { addressId: id });
  }

  /**
   * 设置默认地址
   */
  async setDefaultAddress(id: string): Promise<void> {
    const remoteDefault = await this.sdkService.setDefaultAddress(id);
    if (remoteDefault) {
      const page = await this.findAll();
      for (const addr of page.content) {
        await this.save({
          ...addr,
          isDefault: addr.id === remoteDefault.id,
          updateTime: this.deps.clock.now(),
        });
      }

      await this.save(remoteDefault);
      this.deps.logger.info(TAG, 'Default address set through SDK', { addressId: remoteDefault.id });
      return;
    }

    const page = await this.findAll();

    for (const addr of page.content) {
      if (addr.id === id) {
        addr.isDefault = true;
      } else if (addr.isDefault) {
        addr.isDefault = false;
      }
      await this.save(addr);
    }

    this.deps.logger.info(TAG, 'Default address set', { addressId: id });
  }
}

export function createAddressService(_deps?: ServiceFactoryDeps): IAddressService {
  return new AddressServiceImpl(_deps);
}

export const addressService: IAddressService = createAddressService();
