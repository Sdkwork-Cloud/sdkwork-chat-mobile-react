import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Comment, IMomentsService, Moment } from '../types';

const TAG = 'MomentsService';
const MOMENTS_EVENTS = {
  PUBLISHED: 'social:moment_published',
  LIKED: 'social:moment_liked',
  COMMENTED: 'social:moment_commented',
} as const;

const createSeedMoments = (): Array<Partial<Moment>> => [
  {
    id: '101',
    author: 'Omni Vision',
    avatar: 'Omni',
    content: 'Today we tested a new Omni AI architecture with a smooth interaction experience.',
    images: ['https://picsum.photos/600/600?random=11', 'https://picsum.photos/600/600?random=12'],
    comments: [{ user: 'Elon', text: 'Looks amazing!' }],
    likes: 42,
    hasLiked: false,
  },
  {
    id: '102',
    author: 'Creative AI',
    avatar: 'Creative',
    content: 'Generated concept art with AI. #GenerativeAI',
    images: ['https://picsum.photos/600/600?random=21', 'https://picsum.photos/600/600?random=22'],
    comments: [],
    likes: 128,
    hasLiked: true,
  },
  {
    id: '103',
    author: 'Tech Lead',
    avatar: 'Tech',
    content: 'Optimized timeline rendering with Virtual List and incremental updates.',
    images: [],
    comments: [],
    likes: 8,
    hasLiked: false,
  },
];

class MomentsServiceImpl extends AbstractStorageService<Moment> implements IMomentsService {
  protected STORAGE_KEY = 'sys_moments_v2';
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length > 0) return;

    const now = this.deps.clock.now();
    this.cache = createSeedMoments().map((item) => {
      const offset = Math.floor(Math.random() * 86400000);
      return {
        ...item,
        createTime: now - offset,
        updateTime: now,
      } as Moment;
    });
    await this.commit();
    this.deps.logger.info(TAG, 'Seed moments initialized');
  }

  async getFeed(page = 1, size = 10): Promise<{ moments: Moment[]; hasMore: boolean }> {
    const result = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });
    const allMoments = (result.content || []).map((item) => ({
      ...item,
      displayTime: this.formatTime(item.createTime),
    }));

    const start = (page - 1) * size;
    const moments = allMoments.slice(start, start + size);
    const hasMore = start + size < allMoments.length;

    return { moments, hasMore };
  }

  async publish(content: string, images: string[] = []): Promise<Moment> {
    const now = this.deps.clock.now();
    const created = await this.save({
      id: this.deps.idGenerator.next('moment'),
      author: 'AI User',
      avatar: 'Felix',
      content,
      images,
      comments: [],
      likes: 0,
      hasLiked: false,
      createTime: now,
      updateTime: now,
    } as Moment);

    this.deps.eventBus.emit(MOMENTS_EVENTS.PUBLISHED, { moment: created });
    this.deps.logger.info(TAG, 'Moment published', { momentId: created.id });
    return created;
  }

  async likeMoment(id: string): Promise<void> {
    const moment = await this.findById(id);
    if (!moment) {
      throw new Error('Moment not found');
    }

    moment.hasLiked = !moment.hasLiked;
    moment.likes += moment.hasLiked ? 1 : -1;
    moment.updateTime = this.deps.clock.now();
    await this.save(moment);

    this.deps.eventBus.emit(MOMENTS_EVENTS.LIKED, { momentId: id, liked: moment.hasLiked });
  }

  async commentMoment(id: string, text: string): Promise<void> {
    const moment = await this.findById(id);
    if (!moment) {
      throw new Error('Moment not found');
    }

    const comment: Comment = {
      user: 'AI User',
      text,
      createTime: this.deps.clock.now(),
    };
    moment.comments.push(comment);
    moment.updateTime = this.deps.clock.now();
    await this.save(moment);

    this.deps.eventBus.emit(MOMENTS_EVENTS.COMMENTED, { momentId: id, comment });
  }

  private formatTime(timestamp: number): string {
    const diff = this.deps.clock.now() - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return 'Just now';
    if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
    if (diff < day) return `${Math.floor(diff / hour)} h ago`;
    return `${Math.floor(diff / day)} d ago`;
  }
}

export function createMomentsService(_deps?: ServiceFactoryDeps): IMomentsService {
  return new MomentsServiceImpl(_deps);
}

export const momentsService: IMomentsService = createMomentsService();
