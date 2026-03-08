export interface Comment {
  user: string;
  text: string;
  createTime?: number;
}

export interface Moment {
  id: string;
  createTime: number;
  updateTime: number;
  author: string;
  avatar: string;
  content: string;
  images: string[];
  comments: Comment[];
  likes: number;
  hasLiked: boolean;
  displayTime?: string;
}

export interface MomentsState {
  moments: Moment[];
  isLoading: boolean;
  error: string | null;
}

export type MomentsEventType =
  | 'social:moment_published'
  | 'social:moment_liked'
  | 'social:moment_commented';

export interface MomentsEventPayload {
  'social:moment_published': { moment: Moment };
  'social:moment_liked': { momentId: string; liked: boolean };
  'social:moment_commented': { momentId: string; comment: Comment };
}

export interface IMomentsService {
  getFeed(page?: number, size?: number): Promise<{ moments: Moment[]; hasMore: boolean }>;
  publish(content: string, images?: string[]): Promise<Moment>;
  likeMoment(id: string): Promise<void>;
  commentMoment(id: string, text: string): Promise<void>;
}
