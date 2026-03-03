import { getPlatform, isPlatformInitialized } from '../platform';
import { eventBus, EVENTS } from '../events';
import type { IBaseService, Page, QueryParams, BaseEntity, FilterCriterion } from '../types';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Abstract Storage Service
 * Base class for all storage services with caching, write locks, and event emission
 */
export abstract class AbstractStorageService<T extends BaseEntity> implements IBaseService<T> {
  protected abstract readonly STORAGE_KEY: string;

  protected cache: T[] | null = null;
  private writeLock: Promise<void> = Promise.resolve();
  private initialized = false;

  protected async onInitialize?(): Promise<void>;

  private async ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;

    if (this.onInitialize) {
      try {
        await this.onInitialize();
      } catch (e) {
        console.error(`[${this.STORAGE_KEY}] onInitialize failed`, e);
      }
    }
  }

  protected async loadData(): Promise<T[]> {
    if (this.cache) return this.cache;

    // If platform is not initialized, use memory-only storage
    if (!isPlatformInitialized()) {
      console.warn(`[${this.STORAGE_KEY}] Platform not initialized, using memory-only storage`);
      this.cache = [];
      await this.ensureInitialized();
      return this.cache;
    }

    try {
      const platform = getPlatform();
      const data = await platform.storage.get(this.STORAGE_KEY);
      if (!data) {
        this.cache = [];
      } else {
        this.cache = (typeof data === 'string' ? JSON.parse(data) : data) as T[];
      }
      await this.ensureInitialized();
    } catch (e) {
      this.cache = this.cache || [];
    }

    return this.cache || [];
  }

  protected async commit(): Promise<void> {
    if (!this.cache) return;

    // If platform is not initialized, skip persistence (memory-only mode)
    if (!isPlatformInitialized()) {
      console.warn(`[${this.STORAGE_KEY}] Platform not initialized, skipping persistence`);
      return;
    }

    const platform = getPlatform();
    await platform.storage.set(this.STORAGE_KEY, this.cache);
  }

  private async withWriteLock<R>(task: () => Promise<R>): Promise<R> {
    const currentLock = this.writeLock;
    let releaseLock: () => void;
    const nextLock = new Promise<void>(resolve => { releaseLock = resolve; });
    this.writeLock = nextLock;

    await currentLock.catch(() => {}); 

    try {
      await this.loadData(); 
      const result = await task();
      await this.commit();
      return result;
    } finally {
      releaseLock!();
    }
  }

  public subscribe(callback: (event: any) => void): () => void {
    const handler = (payload: any) => {
      if (payload.key === this.STORAGE_KEY && !payload.silent) {
        callback(payload);
      }
    };
    return eventBus.on(EVENTS.DATA_CHANGE, handler);
  }

  async findById(id: string): Promise<T | null> {
    const list = await this.loadData();
    const item = list.find(i => i.id === id);
    return item || null;
  }

  async save(entity: Partial<T>, options: { silent?: boolean } = {}): Promise<T> {
    const result = await this.withWriteLock(async () => {
      const list = this.cache!; 
      const now = Date.now();
      let target: T;
      const id = entity.id || createId();
      const index = list.findIndex(item => item.id === id);

      if (index > -1) {
        target = { ...list[index], ...entity, updateTime: now };
        list[index] = target;
      } else {
        target = { ...entity, id, createTime: now, updateTime: now } as T;
        list.push(target);
      }
      return target;
    });

    eventBus.emit(EVENTS.DATA_CHANGE, { 
      key: this.STORAGE_KEY, 
      action: 'save', 
      id: result.id,
      silent: options.silent 
    });
    
    return result;
  }

  async saveAll(entities: T[]): Promise<boolean> {
    await this.withWriteLock(async () => {
      const list = this.cache!;
      const now = Date.now();
      
      for (const entity of entities) {
        const id = entity.id || createId();
        const index = list.findIndex(item => item.id === id);
        if (index > -1) {
          list[index] = { ...list[index], ...entity, updateTime: now };
        } else {
          list.push({ ...entity, id, createTime: now, updateTime: now } as T);
        }
      }
      return true;
    });

    eventBus.emit(EVENTS.DATA_CHANGE, { 
      key: this.STORAGE_KEY, 
      action: 'save'
    });
    
    return true;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.withWriteLock(async () => {
      const list = this.cache!;
      const initialLen = list.length;
      this.cache = list.filter(item => item.id !== id);
      return this.cache.length !== initialLen;
    });
    
    if (result) {
      eventBus.emit(EVENTS.DATA_CHANGE, { key: this.STORAGE_KEY, action: 'delete', id });
    }
    
    return result;
  }

  async findAll(params?: QueryParams): Promise<Page<T>> {
    let list = [...await this.loadData()];
    if (params?.filters?.length) {
      list = list.filter(item => params.filters!.every(c => this.evaluateCriterion(item, c)));
    }
    if (params?.keywords) {
      const lowerKey = params.keywords.toLowerCase();
      list = list.filter(item => JSON.stringify(item).toLowerCase().includes(lowerKey));
    }
    if (params?.sort) {
      const { field, order } = params.sort;
      list.sort((a, b) => {
        const valA = (a as any)[field];
        const valB = (b as any)[field];
        return valA < valB ? (order === 'asc' ? -1 : 1) : (order === 'asc' ? 1 : -1);
      });
    } else {
      list.sort((a, b) => b.createTime - a.createTime);
    }
    const page = params?.pageRequest?.page || 1;
    const size = params?.pageRequest?.size || 1000;
    const total = list.length;
    const startIndex = (page - 1) * size;
    return { content: list.slice(startIndex, startIndex + size), total, page, size, totalPages: Math.ceil(total / size) };
  }

  async count(params?: QueryParams): Promise<number> {
    const res = await this.findAll(params);
    return res.total || 0;
  }

  private evaluateCriterion(item: T, criterion: FilterCriterion): boolean {
    const itemValue = (item as any)[criterion.field];
    const targetValue = criterion.value;
    switch (criterion.operator) {
      case 'eq': return itemValue === targetValue;
      case 'neq': return itemValue !== targetValue;
      case 'gt': return itemValue > targetValue;
      case 'gte': return itemValue >= targetValue;
      case 'lt': return itemValue < targetValue;
      case 'lte': return itemValue <= targetValue;
      case 'contains': return String(itemValue).includes(String(targetValue));
      case 'startsWith': return String(itemValue).startsWith(String(targetValue));
      case 'endsWith': return String(itemValue).endsWith(String(targetValue));
      default: return false;
    }
  }
}
