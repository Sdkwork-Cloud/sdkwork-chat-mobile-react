import type { AuthorInfo } from './author-info';

/** Feed项响应 */
export interface FeedItemVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** Feed ID */
  id?: string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 摘要 */
  summary?: string;
  /** 封面图 */
  coverImage?: string;
  /** 内容类型 */
  contentType?: string;
  /** 标签 */
  tags?: string[];
  /** 作者信息 */
  author?: AuthorInfo;
  /** 阅读量 */
  viewCount?: number;
  /** 点赞数 */
  likeCount?: number;
  /** 评论数 */
  commentCount?: number;
  /** 分享数 */
  shareCount?: number;
  /** 是否点赞 */
  isLiked?: boolean;
  /** 是否收藏 */
  isCollected?: boolean;
  type?: string;
  payload?: Record<string, unknown>;
}
