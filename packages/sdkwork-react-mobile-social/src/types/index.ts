import type { BaseEntity } from '@sdkwork/react-mobile-core';

/**
 * 评论
 */
export interface Comment {
  user: string;
  text: string;
  createTime?: number;
}

/**
 * 朋友圈动态
 */
export interface Moment extends BaseEntity {
  author: string;
  avatar: string;
  content: string;
  images: string[];
  comments: Comment[];
  likes: number;
  hasLiked: boolean;
  displayTime?: string;
}

/**
 * 收藏类型
 */
export type FavoriteType = 'link' | 'file' | 'doc' | 'chat' | 'text' | 'image' | 'video';

/**
 * 收藏项
 */
export interface FavoriteItem extends BaseEntity {
  title?: string;
  type: FavoriteType;
  content?: string;
  url?: string;
  source?: string;
  size?: string;
  tags?: string[];
}

/**
 * 社交状态
 */
export interface SocialState {
  moments: Moment[];
  favorites: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * 社交事件类型
 */
export type SocialEventType =
  | 'social:moment_published'
  | 'social:moment_liked'
  | 'social:moment_commented'
  | 'social:favorite_added'
  | 'social:favorite_removed';

/**
 * 社交事件载荷
 */
export interface SocialEventPayload {
  'social:moment_published': { moment: Moment };
  'social:moment_liked': { momentId: string; liked: boolean };
  'social:moment_commented': { momentId: string; comment: Comment };
  'social:favorite_added': { favorite: FavoriteItem };
  'social:favorite_removed': { favoriteId: string };
}

/**
 * 朋友圈服务接口
 */
export interface IMomentsService {
  getFeed(page?: number, size?: number): Promise<{ moments: Moment[]; hasMore: boolean }>;
  publish(content: string, images?: string[]): Promise<Moment>;
  likeMoment(id: string): Promise<void>;
  commentMoment(id: string, text: string): Promise<void>;
}

/**
 * 收藏服务接口
 */
export interface IFavoritesService {
  getFavorites(category: string, keyword?: string): Promise<FavoriteItem[]>;
  addFavorite(item: Partial<FavoriteItem>): Promise<FavoriteItem>;
  removeFavorite(id: string): Promise<void>;
}
