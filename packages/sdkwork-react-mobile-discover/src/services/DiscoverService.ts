import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { DiscoverItem, IDiscoverService } from '../types';

const TAG = 'DiscoverService';

class DiscoverServiceImpl implements IDiscoverService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  async getDiscoverItems(): Promise<DiscoverItem[]> {
    const now = this.deps.clock.now();
    const items: DiscoverItem[] = [
      {
        id: '1',
        title: 'Moments',
        icon: 'moments',
        path: '/moments',
        color: '#4080ff',
        bgColor: 'rgba(64, 128, 255, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '2',
        title: 'Video Channel',
        icon: 'video-channel',
        path: '/video',
        color: '#FF9C6E',
        bgColor: 'rgba(255, 156, 110, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '3',
        title: 'Scan',
        icon: 'scan',
        path: '/scan',
        color: '#2979FF',
        bgColor: 'rgba(41, 121, 255, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '4',
        title: 'Search',
        icon: 'search',
        path: '/search',
        color: '#ffc300',
        bgColor: 'rgba(255, 195, 0, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '5',
        title: 'Mall',
        icon: 'shop',
        path: '/shopping',
        color: '#fa5151',
        bgColor: 'rgba(250, 81, 81, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '6',
        title: 'Order Center',
        icon: 'gig',
        path: '/order-center',
        color: '#07c160',
        bgColor: 'rgba(7, 193, 96, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '7',
        title: 'Nearby',
        icon: 'location',
        path: '/nearby',
        color: '#13c2c2',
        bgColor: 'rgba(19, 194, 194, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '8',
        title: 'App Center',
        icon: 'miniapp',
        path: '/app',
        color: '#7928CA',
        bgColor: 'rgba(121, 40, 202, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '9',
        title: 'Drive',
        icon: 'drive',
        path: '/drive',
        color: '#5b8ff9',
        bgColor: 'rgba(91, 143, 249, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '10',
        title: 'Skills Center',
        icon: 'sparkles',
        path: '/skills',
        color: '#6f42c1',
        bgColor: 'rgba(111, 66, 193, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '11',
        title: 'Look',
        icon: 'book',
        path: '/look',
        color: '#ff8f1f',
        bgColor: 'rgba(255, 143, 31, 0.08)',
        createTime: now,
        updateTime: now,
      },
      {
        id: '12',
        title: 'Media Center',
        icon: 'voice',
        path: '/media',
        color: '#ff7a45',
        bgColor: 'rgba(255, 122, 69, 0.08)',
        createTime: now,
        updateTime: now,
      },
    ];

    this.deps.logger.info(TAG, 'Discover items loaded', { count: items.length });
    return items;
  }
}

export function createDiscoverService(_deps?: ServiceFactoryDeps): IDiscoverService {
  return new DiscoverServiceImpl(_deps);
}

export const discoverService: IDiscoverService = createDiscoverService();
