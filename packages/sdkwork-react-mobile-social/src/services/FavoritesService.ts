import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { FavoriteItem, IFavoritesService } from '../types';
import { createFavoritesSdkService } from './FavoritesSdkService';
import type { IFavoritesSdkService } from './FavoritesSdkService';

const TAG = 'FavoritesService';
const FAVORITES_EVENTS = {
  ADDED: 'social:favorite_added',
  DELETED: 'social:favorite_deleted',
} as const;

const createSeedFavorites = (now: number): FavoriteItem[] => [
  {
    id: 'fav_1',
    title: 'React Performance Checklist',
    type: 'link',
    source: 'Tech Circle',
    content: 'In-depth look at render optimization patterns.',
    createTime: now - 86400000,
    updateTime: now - 86400000,
  },
  {
    id: 'fav_2',
    title: 'AI Industry Report 2024.pdf',
    type: 'file',
    source: 'File Assistant',
    size: '12.5 MB',
    createTime: now - 259200000,
    updateTime: now - 259200000,
  },
  {
    id: 'fav_3',
    title: 'Model Evaluation Notes',
    type: 'doc',
    source: 'Omni Intelligence Hub',
    content: 'Weekly benchmark notes.',
    createTime: now - 604800000,
    updateTime: now - 604800000,
  },
  {
    id: 'fav_4',
    title: 'Omni Vision Session Summary',
    type: 'chat',
    source: 'Chat History',
    content: '[image] [location]',
    createTime: now - 1209600000,
    updateTime: now - 1209600000,
  },
  {
    id: 'fav_5',
    title: 'Prompt Draft',
    type: 'text',
    source: 'My Notes',
    content: '1. Define role and objective...',
    createTime: now - 2592000000,
    updateTime: now - 2592000000,
  },
  {
    id: 'fav_6',
    title: 'Cyberpunk City Art',
    type: 'image',
    source: 'Midjourney Artist',
    url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200',
    createTime: now - 5184000000,
    updateTime: now - 5184000000,
  },
];

const looksLikeUrl = (value?: string) => {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
};

class FavoritesServiceImpl extends AbstractStorageService<FavoriteItem> implements IFavoritesService {
  protected STORAGE_KEY = 'sys_social_favorites_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: IFavoritesSdkService;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createFavoritesSdkService(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    const idSet = new Set(list.map((item) => item.id));
    let changed = false;

    list.forEach((item) => {
      if (item.type === 'image' && !item.url && looksLikeUrl(item.content)) {
        item.url = item.content;
        changed = true;
      }
    });

    if (!this.sdkService.hasSdkBaseUrl()) {
      const now = this.deps.clock.now();
      for (const seed of createSeedFavorites(now)) {
        if (!idSet.has(seed.id)) {
          list.push(seed);
          idSet.add(seed.id);
          changed = true;
        }
      }
    }

    if (changed) {
      this.cache = list;
      await this.commit();
      this.deps.logger.info(TAG, 'Favorites migrated from backup seed');
    }
  }

  private filterFavorites(list: FavoriteItem[], category: string, keyword?: string): FavoriteItem[] {
    let filtered = [...list];

    if (category !== 'all') {
      if (category === 'image') {
        filtered = filtered.filter((item) => item.type === 'image' || item.type === 'video');
      } else if (category === 'note') {
        filtered = filtered.filter((item) => item.type === 'text' || item.type === 'doc');
      } else {
        filtered = filtered.filter((item) => item.type === category);
      }
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter((item) => {
        const title = item.title || '';
        const content = item.content || '';
        const source = item.source || '';
        return (
          title.toLowerCase().includes(lowerKeyword) ||
          content.toLowerCase().includes(lowerKeyword) ||
          source.toLowerCase().includes(lowerKeyword)
        );
      });
    }

    return filtered.sort((a, b) => b.updateTime - a.updateTime);
  }

  async getFavorites(category: string, keyword?: string): Promise<FavoriteItem[]> {
    const remoteFavorites = await this.sdkService.listFavorites({
      category,
      keyword,
      page: 1,
      size: 200,
    });

    if (remoteFavorites !== null) {
      this.cache = [...remoteFavorites];
      await this.commit();
      return this.filterFavorites(remoteFavorites, category, keyword);
    }

    const list = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });
    return this.filterFavorites(list.content || [], category, keyword);
  }

  async addFavorite(item: Partial<FavoriteItem>): Promise<FavoriteItem> {
    const remoteFavorite = await this.sdkService.addFavorite(item);
    if (remoteFavorite) {
      const saved = await this.save({
        ...remoteFavorite,
        type: remoteFavorite.type || item.type || 'text',
      } as FavoriteItem);
      this.deps.eventBus.emit(FAVORITES_EVENTS.ADDED, { item: saved });
      this.deps.logger.info(TAG, 'Favorite added through SDK', { itemId: saved.id });
      return saved;
    }

    const now = this.deps.clock.now();
    const saved = await this.save({
      ...item,
      id: item.id || this.deps.idGenerator.next('fav'),
      type: item.type || 'text',
      createTime: (item as FavoriteItem).createTime || now,
      updateTime: now,
    } as FavoriteItem);
    this.deps.eventBus.emit(FAVORITES_EVENTS.ADDED, { item: saved });
    this.deps.logger.info(TAG, 'Favorite added', { itemId: saved.id });
    return saved;
  }

  async deleteFavorite(id: string): Promise<void> {
    const remoteResult = await this.sdkService.removeFavorite(id);
    if (remoteResult === false) {
      this.deps.logger.warn(TAG, 'SDK removeFavorite returned business failure, fallback to local delete', { id });
    }

    await this.deleteById(id);
    this.deps.eventBus.emit(FAVORITES_EVENTS.DELETED, { id });
    this.deps.logger.info(TAG, remoteResult ? 'Favorite deleted through SDK' : 'Favorite deleted', { itemId: id });
  }

  async removeFavorite(id: string): Promise<void> {
    await this.deleteFavorite(id);
  }

  async searchFavorites(keyword: string): Promise<FavoriteItem[]> {
    return this.getFavorites('all', keyword);
  }
}

export function createFavoritesService(_deps?: ServiceFactoryDeps): IFavoritesService {
  return new FavoritesServiceImpl(_deps);
}

export const favoritesService: IFavoritesService = createFavoritesService();
