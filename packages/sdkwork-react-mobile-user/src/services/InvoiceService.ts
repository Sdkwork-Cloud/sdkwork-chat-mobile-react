import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { InvoiceTitle, IInvoiceService } from '../types';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';

const TAG = 'InvoiceService';
const INVOICE_EVENTS = {
  UPDATED: 'user:invoice_updated',
  ADDED: 'user:invoice_added',
} as const;

class InvoiceServiceImpl extends AbstractStorageService<InvoiceTitle> implements IInvoiceService {
  protected STORAGE_KEY = 'sys_user_invoices_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0) {
      const now = this.deps.clock.now();
      const defaultInvoice: InvoiceTitle = {
        id: 'inv_default',
        type: 'company',
        title: 'AI科技有限公司',
        taxNo: '91310000XXXXXXXXXX',
        isDefault: true,
        createTime: now,
        updateTime: now,
      };
      list.push(defaultInvoice);
      this.cache = list;
      await this.commit();
      this.deps.logger.info(TAG, 'Default invoice created');
    }
  }

  async getInvoices(): Promise<InvoiceTitle[]> {
    const invoices = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });

    return (invoices.content || []).sort((a: InvoiceTitle, b: InvoiceTitle) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  }

  /**
   * 保存发票抬头
   */
  async saveInvoice(invoice: Partial<InvoiceTitle>): Promise<InvoiceTitle> {
    // 如果设置为默认，取消其他默认发票
    if (invoice.isDefault) {
      const list = await this.findAll();
      for (const inv of list.content) {
        if (inv.isDefault && inv.id !== invoice.id) {
          inv.isDefault = false;
          await this.save(inv);
        }
      }
    }

    const now = this.deps.clock.now();
    const newInvoice: InvoiceTitle = {
      id: invoice.id || this.deps.idGenerator.next('inv'),
      type: invoice.type || 'personal',
      title: invoice.title || '',
      taxNo: invoice.taxNo || invoice.taxNumber,
      isDefault: invoice.isDefault || false,
      createTime: invoice.id ? invoice.createTime || now : now,
      updateTime: now,
    };

    await this.save(newInvoice);

    if (invoice.id) {
      this.deps.eventBus.emit(INVOICE_EVENTS.UPDATED, { invoice: newInvoice });
    } else {
      this.deps.eventBus.emit(INVOICE_EVENTS.ADDED, { invoice: newInvoice });
    }

    this.deps.logger.info(TAG, 'Invoice saved', { invoiceId: newInvoice.id });
    return newInvoice;
  }

  /**
   * 删除发票抬头
   */
  async deleteInvoice(id: string): Promise<void> {
    await this.deleteById(id);
    this.deps.logger.info(TAG, 'Invoice deleted', { invoiceId: id });
  }

  /**
   * 设置默认发票
   */
  async setDefaultInvoice(id: string): Promise<void> {
    const list = await this.findAll();

    for (const inv of list.content) {
      if (inv.id === id) {
        inv.isDefault = true;
      } else if (inv.isDefault) {
        inv.isDefault = false;
      }
      await this.save(inv);
    }

    this.deps.logger.info(TAG, 'Default invoice set', { invoiceId: id });
  }
}

export function createInvoiceService(_deps?: ServiceFactoryDeps): IInvoiceService {
  return new InvoiceServiceImpl(_deps);
}

export const invoiceService: IInvoiceService = createInvoiceService();
