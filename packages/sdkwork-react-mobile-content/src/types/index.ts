import { BaseEntity } from '@sdkwork/react-mobile-core';

export type ContentType = 'article' | 'news' | 'blog' | 'tutorial';

export interface Article extends BaseEntity {
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  author: string;
  authorAvatar?: string;
  tags: string[];
  category: string;
  views: number;
  likes: number;
  comments: number;
  isPublished: boolean;
  publishTime?: Date;
  readTime: number;
}

export interface ContentFilter {
  type?: ContentType;
  category?: string;
  tags?: string[];
  author?: string;
  searchQuery?: string;
}

export interface ContentStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  popularCategories: string[];
}

export interface IContentService {
  getArticles(filter?: ContentFilter): Promise<Article[]>;
  getArticleById(id: string): Promise<Article | null>;
  createArticle(article: Omit<Article, 'id' | 'createTime' | 'updateTime'>): Promise<Article>;
  updateArticle(id: string, updates: Partial<Article>): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  likeArticle(id: string): Promise<void>;
  viewArticle(id: string): Promise<void>;
  getContentStats(): Promise<ContentStats>;
  searchArticles(query: string): Promise<Article[]>;
}
