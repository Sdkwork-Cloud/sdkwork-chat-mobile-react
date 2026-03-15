import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Comment, IMomentsService, Moment } from '../types';
import { formatMomentRelativeTime } from '../utils/momentTime';
import { createMomentsSdkService } from './MomentsSdkService';
import type { IMomentsSdkService } from './MomentsSdkService';

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
  private readonly sdkService: IMomentsSdkService;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createMomentsSdkService(deps);
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

  private decorateMoment(moment: Moment): Moment {
    return {
      ...moment,
      displayTime: this.formatTime(moment.createTime),
    };
  }

  private async replaceCache(moments: Moment[]): Promise<void> {
    this.cache = moments;
    await this.commit();
  }

  async getFeed(page = 1, size = 10): Promise<{ moments: Moment[]; hasMore: boolean }> {
    const remoteMoments = await this.sdkService.getFeed(page, size);
    if (remoteMoments && remoteMoments.length > 0) {
      const decoratedRemote = remoteMoments
        .sort((left, right) => right.createTime - left.createTime)
        .map((item) => this.decorateMoment(item));
      await this.replaceCache(decoratedRemote);
      return {
        moments: decoratedRemote,
        hasMore: remoteMoments.length >= size,
      };
    }

    const result = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });
    const allMoments = (result.content || []).map((item: Moment) => this.decorateMoment(item));

    const start = (page - 1) * size;
    const moments = allMoments.slice(start, start + size);
    const hasMore = start + size < allMoments.length;

    return { moments, hasMore };
  }

  async publish(content: string, images: string[] = []): Promise<Moment> {
    const remoteMoment = await this.sdkService.publish(content, images);
    if (remoteMoment) {
      const created = this.decorateMoment(remoteMoment);
      await this.save(created);
      this.deps.eventBus.emit(MOMENTS_EVENTS.PUBLISHED, { moment: created });
      this.deps.logger.info(TAG, 'Moment published through sdk', { momentId: created.id });
      return created;
    }

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

    const remoteMoment = await this.sdkService.likeMoment(id, moment.hasLiked);
    if (remoteMoment) {
      await this.save({
        ...moment,
        ...remoteMoment,
        comments: moment.comments,
      });
      this.deps.eventBus.emit(MOMENTS_EVENTS.LIKED, { momentId: id, liked: remoteMoment.hasLiked });
      return;
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

    const remoteComment = await this.sdkService.commentMoment(id, text);
    const comment: Comment = remoteComment || {
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
    return formatMomentRelativeTime(timestamp, this.deps.clock.now());
  }
}

export function createMomentsService(_deps?: ServiceFactoryDeps): IMomentsService {
  return new MomentsServiceImpl(_deps);
}

export const momentsService: IMomentsService = createMomentsService();
