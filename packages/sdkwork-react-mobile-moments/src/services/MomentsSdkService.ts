import type {
  CommentCreateForm,
  FeedCreateForm,
  FeedItemVO,
  PlusApiResultCommentVO,
  PlusApiResultFeedItemVO,
  PlusApiResultListFeedItemVO,
  SdkworkAppClient,
} from '@sdkwork/app-sdk';
import {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  createAppSdkCoreConfig,
  getAppSdkCoreClientWithSession,
  resolveServiceFactoryRuntimeDeps,
} from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';

import type { Comment, Moment } from '../types';

const TAG = 'MomentsSdkService';
const SUCCESS_CODE = '2000';

interface ApiResultLike {
  code?: string;
  msg?: string;
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toId(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return toText(value);
}

function toEpoch(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 10_000_000_000 ? value : value * 1000;
  }
  const text = toText(value);
  if (!text) {
    return fallback;
  }
  const asNumber = Number(text);
  if (Number.isFinite(asNumber)) {
    return asNumber > 10_000_000_000 ? asNumber : asNumber * 1000;
  }
  const asDate = Date.parse(text);
  return Number.isNaN(asDate) ? fallback : asDate;
}

function isSuccess(result: ApiResultLike | null | undefined): boolean {
  return result?.code === SUCCESS_CODE;
}

function dedupeImages(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((item) => toText(item)).filter(Boolean))];
}

export interface IMomentsSdkService {
  hasSdkBaseUrl(): boolean;
  getFeed(page: number, size: number): Promise<Moment[] | null>;
  publish(content: string, images?: string[]): Promise<Moment | null>;
  likeMoment(id: string, liked: boolean): Promise<Moment | null>;
  commentMoment(id: string, text: string): Promise<Comment | null>;
}

class MomentsSdkServiceImpl implements IMomentsSdkService {
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

  private warnFailure(scope: string, result: ApiResultLike | null | undefined): void {
    if (isSuccess(result)) {
      return;
    }
    this.deps.logger.warn(TAG, `${scope} failed`, {
      code: result?.code,
      message: result?.msg,
    });
  }

  private mapFeedItem(item: Partial<FeedItemVO>): Moment | null {
    const now = this.deps.clock.now();
    const id = toId(item.id);
    if (!id) {
      return null;
    }

    const authorRecord = (item.author || {}) as { name?: unknown; nickname?: unknown; avatar?: unknown };
    const authorName = toText(authorRecord.name) || toText(authorRecord.nickname) || 'Unknown';
    const images = dedupeImages([
      item.coverImage,
      ...(Array.isArray((item as { images?: string[] }).images) ? (item as { images?: string[] }).images || [] : []),
    ]);
    const createTime = toEpoch(item.createdAt, now);
    const updateTime = toEpoch(item.updatedAt, createTime);

    return {
      id,
      author: authorName,
      avatar: toText(authorRecord.avatar) || authorName,
      content: toText(item.content) || toText(item.summary),
      images,
      comments: [],
      likes: typeof item.likeCount === 'number' ? item.likeCount : Number(item.likeCount || 0),
      hasLiked: item.isLiked === true,
      createTime,
      updateTime,
    };
  }

  async getFeed(page: number, size: number): Promise<Moment[] | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    try {
      const client = await this.getClient();
      const result = await client.feed.getFeedList({
        page: Math.max(0, page - 1),
        size,
        pageNum: page,
        pageSize: size,
      }) as PlusApiResultListFeedItemVO;
      this.warnFailure('get feed list', result);
      if (!isSuccess(result) || !Array.isArray(result.data)) {
        return null;
      }
      return result.data
        .map((item) => this.mapFeedItem(item))
        .filter((item): item is Moment => item !== null);
    } catch (error) {
      this.deps.logger.warn(TAG, 'getFeed request failed', error);
      return null;
    }
  }

  async publish(content: string, images: string[] = []): Promise<Moment | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    try {
      const client = await this.getClient();
      const body: FeedCreateForm = {
        content,
        images,
      };
      const result = await client.feed.create(body) as PlusApiResultFeedItemVO;
      this.warnFailure('create feed', result);
      if (!isSuccess(result)) {
        return null;
      }
      return this.mapFeedItem(result.data || {});
    } catch (error) {
      this.deps.logger.warn(TAG, 'publish request failed', error);
      return null;
    }
  }

  async likeMoment(id: string, liked: boolean): Promise<Moment | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    const normalizedId = toId(id);
    if (!normalizedId) {
      return null;
    }

    try {
      const client = await this.getClient();
      const result = liked
        ? await client.feed.unlike(normalizedId) as PlusApiResultFeedItemVO
        : await client.feed.like(normalizedId) as PlusApiResultFeedItemVO;
      this.warnFailure(liked ? 'unlike feed' : 'like feed', result);
      if (!isSuccess(result)) {
        return null;
      }
      return this.mapFeedItem(result.data || {});
    } catch (error) {
      this.deps.logger.warn(TAG, 'likeMoment request failed', {
        id: normalizedId,
        liked,
        error,
      });
      return null;
    }
  }

  async commentMoment(id: string, text: string): Promise<Comment | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    const normalizedId = Number(toId(id));
    if (!Number.isFinite(normalizedId)) {
      return null;
    }

    try {
      const client = await this.getClient();
      const body: CommentCreateForm = {
        contentType: 'feed',
        contentId: normalizedId,
        content: text,
      };
      const result = await client.comment.createComment(body) as PlusApiResultCommentVO;
      this.warnFailure('create comment', result);
      if (!isSuccess(result)) {
        return null;
      }
      return {
        user: 'AI User',
        text,
        createTime: this.deps.clock.now(),
      };
    } catch (error) {
      this.deps.logger.warn(TAG, 'commentMoment request failed', {
        id: normalizedId,
        error,
      });
      return null;
    }
  }
}

export function createMomentsSdkService(_deps?: ServiceFactoryDeps): IMomentsSdkService {
  return new MomentsSdkServiceImpl(_deps);
}

export const momentsSdkService: IMomentsSdkService = createMomentsSdkService();
