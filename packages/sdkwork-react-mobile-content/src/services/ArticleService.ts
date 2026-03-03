import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Article, ContentFilter, ContentStats, IContentService } from '../types';

const createSeedArticles = (now: number): Article[] => [
  {
    id: 'feed-1',
    title: '5 Practical Patterns for AI Product Design',
    summary: 'A compact playbook for building robust AI experiences with clear service boundaries.',
    content: 'AI collaboration products need architecture-first engineering and clear interfaces.',
    coverImage: 'https://picsum.photos/seed/discover-feed-1/900/560',
    author: 'OpenChat Design Weekly',
    authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=OpenChat-Design',
    tags: ['design', 'architecture', 'experience'],
    category: 'article',
    views: 12880,
    likes: 2480,
    comments: 268,
    isPublished: true,
    publishTime: new Date(now - 1000 * 60 * 60 * 8),
    readTime: 8,
    createTime: now - 1000 * 60 * 60 * 8,
    updateTime: now - 1000 * 60 * 60 * 2,
  },
  {
    id: 'feed-2',
    title: 'How to Design Task-Oriented Agent Workflows',
    summary: 'A practical guide to separating context understanding from execution pipelines.',
    content: 'When building agent systems, separate conversation context from task execution to maximize reuse.',
    coverImage: 'https://picsum.photos/seed/discover-feed-2/900/560',
    author: 'Product Lab',
    authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Product-Lab',
    tags: ['agent', 'workflow', 'sdk'],
    category: 'tutorial',
    views: 9680,
    likes: 1960,
    comments: 145,
    isPublished: true,
    publishTime: new Date(now - 1000 * 60 * 60 * 14),
    readTime: 6,
    createTime: now - 1000 * 60 * 60 * 14,
    updateTime: now - 1000 * 60 * 60 * 4,
  },
  {
    id: 'feed-3',
    title: 'Mobile Chat Performance Optimization Checklist',
    summary: 'Techniques to keep chat pages smooth by reducing unnecessary rerender and expensive updates.',
    content: 'For mobile chat performance, split state domains and avoid page-wide rerenders on local updates.',
    coverImage: 'https://picsum.photos/seed/discover-feed-3/900/560',
    author: 'Frontend Core',
    authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Frontend-Core',
    tags: ['performance', 'chat', 'frontend'],
    category: 'blog',
    views: 7530,
    likes: 1730,
    comments: 108,
    isPublished: true,
    publishTime: new Date(now - 1000 * 60 * 60 * 22),
    readTime: 7,
    createTime: now - 1000 * 60 * 60 * 22,
    updateTime: now - 1000 * 60 * 60 * 3,
  },
  {
    id: 'feed-4',
    title: 'Key Abstractions for Multi-Agent Collaboration',
    summary: 'Define protocol, permission model, and observability first for scalable multi-agent systems.',
    content: 'A multi-agent system should include a unified task protocol, clear permissions, and traceable execution logs.',
    coverImage: 'https://picsum.photos/seed/discover-feed-4/900/560',
    author: 'Agent Research Group',
    authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Agent-Research',
    tags: ['multi-agent', 'protocol', 'governance'],
    category: 'news',
    views: 11220,
    likes: 2105,
    comments: 188,
    isPublished: true,
    publishTime: new Date(now - 1000 * 60 * 60 * 30),
    readTime: 5,
    createTime: now - 1000 * 60 * 60 * 30,
    updateTime: now - 1000 * 60 * 60 * 6,
  },
];

const ARTICLE_EVENTS = {
  CREATED: 'content:article_created',
  UPDATED: 'content:article_updated',
  DELETED: 'content:article_deleted',
  LIKED: 'content:article_liked',
} as const;

class ArticleServiceImpl extends AbstractStorageService<Article> implements IContentService {
  protected STORAGE_KEY = 'sys_articles_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    const existingIds = new Set(list.map((item) => item.id));
    let changed = false;

    for (const seed of createSeedArticles(this.deps.clock.now())) {
      if (existingIds.has(seed.id)) continue;
      list.push(seed);
      changed = true;
    }

    if (changed) {
      this.cache = list;
      await this.commit();
    }
  }

  async getArticles(filter?: ContentFilter): Promise<Article[]> {
    let result = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });
    
    let articles = result.content || [];

    if (filter) {
      if (filter.type) {
        articles = articles.filter(a => a.category === filter.type);
      }
      if (filter.category) {
        articles = articles.filter(a => a.category === filter.category);
      }
      if (filter.tags && filter.tags.length > 0) {
        articles = articles.filter(a => 
          filter.tags!.some(tag => a.tags?.includes(tag))
        );
      }
      if (filter.author) {
        articles = articles.filter(a => a.author === filter.author);
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        articles = articles.filter(a => 
          a.title?.toLowerCase().includes(query) ||
          a.summary?.toLowerCase().includes(query) ||
          a.content?.toLowerCase().includes(query)
        );
      }
    }

    return articles;
  }

  async getArticleById(id: string): Promise<Article | null> {
    return this.findById(id);
  }

  async createArticle(articleData: Omit<Article, 'id' | 'createTime' | 'updateTime'>): Promise<Article> {
    const now = this.deps.clock.now();
    const article: Article = {
      ...articleData,
      id: this.deps.idGenerator.next('article'),
      createTime: now,
      updateTime: now,
    };

    await this.save(article);
    this.deps.eventBus.emit(ARTICLE_EVENTS.CREATED, article);
    return article;
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const article = await this.findById(id);
    if (!article) {
      throw new Error('Article not found');
    }

    const updatedArticle = {
      ...article,
      ...updates,
      updateTime: this.deps.clock.now(),
    };

    await this.save(updatedArticle);
    this.deps.eventBus.emit(ARTICLE_EVENTS.UPDATED, updatedArticle);
    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<void> {
    await this.deleteById(id);
    this.deps.eventBus.emit(ARTICLE_EVENTS.DELETED, { id });
  }

  async likeArticle(id: string): Promise<void> {
    const article = await this.findById(id);
    if (article) {
      article.likes = (article.likes || 0) + 1;
      await this.save(article);
      this.deps.eventBus.emit(ARTICLE_EVENTS.LIKED, { id, likes: article.likes });
    }
  }

  async viewArticle(id: string): Promise<void> {
    const article = await this.findById(id);
    if (article) {
      article.views = (article.views || 0) + 1;
      await this.save(article);
    }
  }

  async getContentStats(): Promise<ContentStats> {
    const result = await this.findAll();
    const articles = result.content || [];
    const categories = new Set<string>();
    articles.forEach(a => {
      if (a.category) categories.add(a.category);
    });
    
    return {
      totalArticles: articles.length,
      totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
      totalLikes: articles.reduce((sum, a) => sum + (a.likes || 0), 0),
      popularCategories: Array.from(categories),
    };
  }

  async searchArticles(query: string): Promise<Article[]> {
    return this.getArticles({ searchQuery: query });
  }
}

export function createArticleService(_deps?: ServiceFactoryDeps): IContentService {
  return new ArticleServiceImpl(_deps);
}

export const articleService: IContentService = createArticleService();



