import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  GigFilter,
  GigTaskOrder,
  IGigService,
  ServiceResult,
} from '../types';

export type {
  GigFilter,
  GigTaskOrder as GigOrder,
  GigTaskStatus as GigStatus,
  GigTaskType as GigType,
  ServiceResult,
} from '../types';

type GigOrder = GigTaskOrder;

const STORAGE_KEY = 'sys_commerce_gig_orders_v2';
const GIG_CENTER_SCROLL_KEY = 'sys_commerce_gig_center_scroll_v2';

const getGigCenterStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage || null;
};

const seedOrders = (now: number): GigOrder[] => {
  const buildTime = (offsetHours: number) => new Date(now - offsetHours * 3600 * 1000).toISOString();

  return [
    {
      id: 'gig_c1',
      type: 'design',
      title: 'Brand Logo Design',
      subTitle: 'Minimal tech style with vector source files',
      price: 520,
      distance: 0,
      location: 'Online task',
      status: 'available',
      urgency: 'normal',
      tags: ['AI drawing', 'branding'],
      requirements: 'Minimal tech logo, blue and silver, vector style',
      createdAt: buildTime(2),
      updatedAt: buildTime(2),
    },
    {
      id: 'gig_c2',
      type: 'video_edit',
      title: 'Short Ad Video Editing',
      subTitle: '15-second e-commerce promo with fast pacing',
      price: 860,
      distance: 0,
      location: 'Online task',
      status: 'available',
      urgency: 'high',
      tags: ['video generation', 'urgent'],
      requirements: 'Fast paced e-commerce ad, 15s, punchy transitions',
      createdAt: buildTime(4),
      updatedAt: buildTime(4),
    },
    {
      id: 'gig_d1',
      type: 'delivery',
      title: 'Coffee Delivery',
      subTitle: 'Two lattes, deliver within 30 minutes',
      price: 18,
      distance: 0.9,
      location: 'Starbucks Zhangjiang',
      destination: 'Microelectronics Port Building 3',
      status: 'available',
      urgency: 'high',
      tags: ['on-the-way', 'tip+3'],
      createdAt: buildTime(1),
      updatedAt: buildTime(1),
    },
    {
      id: 'gig_r1',
      type: 'ride',
      title: 'Ride Share Request',
      subTitle: 'Pudong Software Park -> Hongqiao Station',
      price: 56,
      distance: 1.8,
      location: 'Pudong Software Park',
      destination: 'Hongqiao Railway Station',
      status: 'available',
      urgency: 'normal',
      tags: ['private', 'high match'],
      createdAt: buildTime(9),
      updatedAt: buildTime(9),
    },
    {
      id: 'gig_s1',
      type: 'clean',
      title: 'Home Cleaning',
      subTitle: '2-hour basic cleaning service',
      price: 120,
      distance: 3.2,
      location: 'Biyun International Community',
      status: 'available',
      urgency: 'normal',
      tags: ['daily payout', 'bring tools'],
      createdAt: buildTime(20),
      updatedAt: buildTime(20),
    },
  ];
};

class GigServiceImpl implements IGigService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private nowIso(): string {
    return new Date(this.deps.clock.now()).toISOString();
  }

  private async ensureInitialized() {
    const list = await Promise.resolve(this.deps.storage.get<GigOrder[]>(STORAGE_KEY));
    if (!list || !list.length) {
      await Promise.resolve(this.deps.storage.set(STORAGE_KEY, seedOrders(this.deps.clock.now())));
    }
  }

  private async getAllOrders() {
    await this.ensureInitialized();
    return (await Promise.resolve(this.deps.storage.get<GigOrder[]>(STORAGE_KEY))) || [];
  }

  private async saveAllOrders(orders: GigOrder[]) {
    await Promise.resolve(this.deps.storage.set(STORAGE_KEY, orders));
  }

  async getAvailableOrders(filter: GigFilter = 'all'): Promise<ServiceResult<GigOrder[]>> {
    const all = await this.getAllOrders();
    let list = all.filter((item) => item.status === 'available');

    if (filter !== 'all') {
      if (filter === 'creative') {
        list = list.filter((item) => item.type === 'design' || item.type === 'video_edit');
      } else {
        list = list.filter((item) => item.type === filter);
      }
    }

    list.sort((a, b) => {
      const score = (item: GigOrder) => {
        const urgencyBonus = item.urgency === 'high' ? 40 : 0;
        const creativeBonus = item.type === 'design' || item.type === 'video_edit' ? 24 : 0;
        const distancePenalty = item.distance > 0 ? item.distance * 8 : 0;
        return item.price + urgencyBonus + creativeBonus - distancePenalty;
      };
      return score(b) - score(a);
    });

    return { success: true, data: list };
  }

  async takeOrder(id: string): Promise<ServiceResult<GigOrder>> {
    const orders = await this.getAllOrders();
    const index = orders.findIndex((item) => item.id === id);
    if (index < 0) return { success: false, message: 'Order not found' };
    if (orders[index].status !== 'available') return { success: false, message: 'Order already taken' };

    const nextOrder: GigOrder = {
      ...orders[index],
      status: 'taken',
      updatedAt: this.nowIso(),
    };
    orders[index] = nextOrder;
    await this.saveAllOrders(orders);
    return { success: true, data: nextOrder };
  }

  async getMyOrders(view: 'active' | 'history'): Promise<ServiceResult<GigOrder[]>> {
    const all = await this.getAllOrders();
    const list =
      view === 'active'
        ? all.filter((item) => item.status === 'taken' || item.status === 'submitted')
        : all.filter((item) => item.status === 'completed');

    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return { success: true, data: list };
  }

  async submitWork(id: string, deliverableUrl: string, deliverableType: 'image' | 'video'): Promise<ServiceResult<GigOrder>> {
    const orders = await this.getAllOrders();
    const index = orders.findIndex((item) => item.id === id);
    if (index < 0) return { success: false, message: 'Order not found' };
    if (orders[index].status !== 'taken') return { success: false, message: 'Order cannot be submitted in current state' };

    const nextOrder: GigOrder = {
      ...orders[index],
      status: 'submitted',
      deliverableUrl,
      deliverableType,
      updatedAt: this.nowIso(),
    };
    orders[index] = nextOrder;
    await this.saveAllOrders(orders);
    return { success: true, data: nextOrder };
  }

  async completeOrder(id: string): Promise<ServiceResult<GigOrder>> {
    const orders = await this.getAllOrders();
    const index = orders.findIndex((item) => item.id === id);
    if (index < 0) return { success: false, message: 'Order not found' };
    if (orders[index].status !== 'submitted' && orders[index].status !== 'taken') {
      return { success: false, message: 'Order cannot be completed in current state' };
    }

    const nextOrder: GigOrder = {
      ...orders[index],
      status: 'completed',
      updatedAt: this.nowIso(),
    };
    orders[index] = nextOrder;
    await this.saveAllOrders(orders);
    return { success: true, data: nextOrder };
  }

  async getEarnings() {
    const all = await this.getAllOrders();
    const completed = all.filter((item) => item.status === 'completed');
    const total = completed.reduce((sum, item) => sum + item.price, 0);
    const nowDate = new Date(this.deps.clock.now());
    const today = completed
      .filter((item) => {
        const updateDate = new Date(item.updatedAt);
        return (
          updateDate.getFullYear() === nowDate.getFullYear() &&
          updateDate.getMonth() === nowDate.getMonth() &&
          updateDate.getDate() === nowDate.getDate()
        );
      })
      .reduce((sum, item) => sum + item.price, 0);

    return { today, total };
  }

  async getGigCenterScrollOffset(): Promise<number> {
    const storage = getGigCenterStorage();
    if (!storage) return 0;
    const cached = storage.getItem(GIG_CENTER_SCROLL_KEY);
    const offset = Number(cached);
    return Number.isFinite(offset) && offset > 0 ? offset : 0;
  }

  async setGigCenterScrollOffset(offset: number): Promise<void> {
    const storage = getGigCenterStorage();
    if (!storage) return;
    storage.setItem(GIG_CENTER_SCROLL_KEY, String(offset));
  }

  async clearGigCenterScrollOffset(): Promise<void> {
    const storage = getGigCenterStorage();
    if (!storage) return;
    storage.removeItem(GIG_CENTER_SCROLL_KEY);
  }
}

export function createGigService(_deps?: ServiceFactoryDeps): IGigService {
  return new GigServiceImpl(_deps);
}

export const gigService: IGigService = createGigService();

