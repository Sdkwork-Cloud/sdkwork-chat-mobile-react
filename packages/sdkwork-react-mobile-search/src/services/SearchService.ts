import { AbstractStorageService, EVENTS, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import { AGENT_REGISTRY, chatService } from '@sdkwork/react-mobile-chat';
import { articleService } from '@sdkwork/react-mobile-content';
import { creationService } from '@sdkwork/react-mobile-creation';
import { fileService } from '@sdkwork/react-mobile-drive';
import type { ChatSession, Message } from '@sdkwork/react-mobile-chat';
import type { ISearchService, SearchHistory, SearchResultItem, SearchResults } from '../types';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import { createSearchSdkService } from './SearchSdkService';
import type { ISearchSdkService } from './SearchSdkService';

const TAG = 'SearchService';
const MAX_HISTORY = 20;
const MAX_AGENT_RESULTS = 8;
const MAX_CHAT_RESULTS = 30;
const MAX_OTHER_RESULTS = 30;

const SEARCH_SYNC_EVENTS = {
  ARTICLE_CREATED: 'content:article_created',
  ARTICLE_UPDATED: 'content:article_updated',
  ARTICLE_DELETED: 'content:article_deleted',
  CREATION_CREATED: 'creation:created',
  CREATION_UPDATED: 'creation:updated',
  CREATION_DELETED: 'creation:deleted',
} as const;

const SESSION_CACHE_TTL_MS = 1200;
const SNAPSHOT_CACHE_TTL_MS = 12000;

type CacheEntry<T> = {
  value: T;
  expireAt: number;
};

type DriveFileSnapshot = {
  id: string;
  name: string;
  type: string;
  updateTime?: number;
};

type ArticleSnapshot = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  updateTime?: unknown;
  createTime?: unknown;
};

type CreationSnapshot = {
  id: string;
  title: string;
  prompt?: string;
  tags?: string[];
  type?: string;
  updatedAt?: unknown;
  createdAt?: unknown;
};

type SearchAgentEntry = {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  tags?: string[];
};

const EMPTY_RESULTS: SearchResults = { agents: [], chats: [], others: [] };

const normalize = (value: string) => value.trim().toLowerCase();
const includesKeyword = (source: string, keyword: string) => source.toLowerCase().includes(keyword);

const toTimestamp = (value: unknown, fallbackNow: number): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const time = Date.parse(value);
    return Number.isNaN(time) ? fallbackNow : time;
  }
  if (value instanceof Date) return value.getTime();
  return fallbackNow;
};

class SearchServiceImpl extends AbstractStorageService<SearchHistory> implements ISearchService {
  protected STORAGE_KEY = 'sys_search_history_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: ISearchSdkService;

  private sessionsCache: CacheEntry<ChatSession[]> | null = null;
  private filesCache: CacheEntry<DriveFileSnapshot[]> | null = null;
  private articlesCache: CacheEntry<ArticleSnapshot[]> | null = null;
  private creationsCache: CacheEntry<CreationSnapshot[]> | null = null;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createSearchSdkService(deps);

    this.deps.eventBus.on(EVENTS.DATA_CHANGE, (payload: any) => {
      const key = payload?.key;
      if (!key) return;

      if (key === 'sys_chat_sessions_v4') this.sessionsCache = null;
      if (key === 'sys_drive_files_v1') this.filesCache = null;
      if (key === 'sys_articles_v1') this.articlesCache = null;
      if (key === 'sys_creations_list_v1') this.creationsCache = null;
    });

    this.deps.eventBus.on(SEARCH_SYNC_EVENTS.ARTICLE_CREATED, () => {
      this.articlesCache = null;
    });
    this.deps.eventBus.on(SEARCH_SYNC_EVENTS.ARTICLE_UPDATED, () => {
      this.articlesCache = null;
    });
    this.deps.eventBus.on(SEARCH_SYNC_EVENTS.ARTICLE_DELETED, () => {
      this.articlesCache = null;
    });
    this.deps.eventBus.on(SEARCH_SYNC_EVENTS.CREATION_CREATED, () => {
      this.creationsCache = null;
    });
    this.deps.eventBus.on(SEARCH_SYNC_EVENTS.CREATION_UPDATED, () => {
      this.creationsCache = null;
    });
    this.deps.eventBus.on(SEARCH_SYNC_EVENTS.CREATION_DELETED, () => {
      this.creationsCache = null;
    });
  }

  private async syncHistoryFromRemote(): Promise<SearchHistory[] | null> {
    const remoteHistory = await this.sdkService.getHistory();
    if (!remoteHistory) return null;

    this.cache = remoteHistory;
    await this.commit();
    return remoteHistory;
  }

  async getHistory(): Promise<SearchHistory[]> {
    const remoteHistory = await this.syncHistoryFromRemote();
    if (remoteHistory) {
      return remoteHistory.slice(0, MAX_HISTORY);
    }

    const list = await this.findAll({
      sort: { field: 'updateTime', order: 'desc' },
    });
    return (list.content || []).slice(0, MAX_HISTORY);
  }

  async addHistory(keyword: string): Promise<void> {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    const remoteResult = await this.sdkService.addHistory(trimmed);
    if (remoteResult) {
      const remoteHistory = await this.syncHistoryFromRemote();
      if (remoteHistory) return;
    }

    const list = await this.findAll();
    const existing = list.content.find((item: SearchHistory) => item.keyword === trimmed);

    if (existing) {
      existing.count += 1;
      existing.updateTime = this.deps.clock.now();
      await this.save(existing);
    } else {
      const now = this.deps.clock.now();
      await this.save({
        id: this.deps.idGenerator.next('search_history'),
        keyword: trimmed,
        count: 1,
        createTime: now,
        updateTime: now,
      } as Partial<SearchHistory>);
    }

    const updatedList = await this.findAll({
      sort: { field: 'updateTime', order: 'desc' },
    });
    if (updatedList.content.length > MAX_HISTORY) {
      for (const item of updatedList.content.slice(MAX_HISTORY)) {
        await this.deleteById(item.id);
      }
    }
  }

  async clearHistory(): Promise<void> {
    const remoteResult = await this.sdkService.clearHistory();
    if (remoteResult) {
      this.cache = [];
      await this.commit();
      return;
    }

    this.cache = [];
    await this.commit();
  }

  private readCache<T>(entry: CacheEntry<T> | null): T | null {
    if (!entry) return null;
    if (entry.expireAt <= this.deps.clock.now()) return null;
    return entry.value;
  }

  private writeCache<T>(value: T, ttlMs: number): CacheEntry<T> {
    const now = this.deps.clock.now();
    return {
      value,
      expireAt: now + ttlMs,
    };
  }

  private async loadSessionSnapshot(): Promise<ChatSession[]> {
    const cached = this.readCache(this.sessionsCache);
    if (cached) return cached;

    const sessionResult = await chatService.getSessionList().catch(() => ({ success: false, data: [] as ChatSession[] }));
    const sessions = Array.isArray(sessionResult.data) ? sessionResult.data : [];
    this.sessionsCache = this.writeCache(sessions, SESSION_CACHE_TTL_MS);
    return sessions;
  }

  private async loadFileSnapshot(): Promise<DriveFileSnapshot[]> {
    const cached = this.readCache(this.filesCache);
    if (cached) return cached;

    let list: DriveFileSnapshot[] = [];
    try {
      const page = await (fileService as any).findAll?.({
        sort: { field: 'updateTime', order: 'desc' },
      });
      if (Array.isArray(page?.content)) {
        list = page.content.map((item: any) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          updateTime: item.updateTime,
        }));
      }
    } catch (error) {
      this.deps.logger.warn(TAG, 'loadFiles.findAll failed', error as Error);
    }

    if (list.length === 0) {
      const rootFiles = await fileService.getFiles(null).catch(() => [] as Array<DriveFileSnapshot>);
      list = rootFiles.map((item: DriveFileSnapshot) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        updateTime: item.updateTime,
      }));
    }

    this.filesCache = this.writeCache(list, SNAPSHOT_CACHE_TTL_MS);
    return list;
  }

  private async loadArticleSnapshot(): Promise<ArticleSnapshot[]> {
    const cached = this.readCache(this.articlesCache);
    if (cached) return cached;

    const articles = await articleService.getArticles().catch(() => []);
    const list = Array.isArray(articles) ? (articles as ArticleSnapshot[]) : [];
    this.articlesCache = this.writeCache(list, SNAPSHOT_CACHE_TTL_MS);
    return list;
  }

  private async loadCreationSnapshot(): Promise<CreationSnapshot[]> {
    const cached = this.readCache(this.creationsCache);
    if (cached) return cached;

    const creations = await creationService.getCreations().catch(() => []);
    const list = Array.isArray(creations) ? (creations as CreationSnapshot[]) : [];
    this.creationsCache = this.writeCache(list, SNAPSHOT_CACHE_TTL_MS);
    return list;
  }

  private createSnippet(content: string, keyword: string): string {
    const text = (content || '').trim();
    if (!text) return '';
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const hit = lowerText.indexOf(lowerKeyword);
    if (hit < 0) return text.slice(0, 40);

    const start = Math.max(0, hit - 14);
    const end = Math.min(text.length, hit + keyword.length + 26);
    return `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`;
  }

  private collectChatResults(
    sessions: ChatSession[],
    keyword: string,
    contextSessionId?: string
  ): SearchResultItem[] {
    const chatResults: SearchResultItem[] = [];

    for (const session of sessions) {
      if (contextSessionId && session.id !== contextSessionId) continue;

      const agent = AGENT_REGISTRY[session.agentId];
      const sessionTitle = session.type === 'group'
        ? (session.groupName || 'Group Chat')
        : (agent?.name || 'Conversation');

      const messages = Array.isArray(session.messages) ? session.messages : [];
      const matchedByTitle = includesKeyword(sessionTitle, keyword);

      let matchedMessage: Message | undefined;
      if (!matchedByTitle) {
        for (let i = messages.length - 1; i >= 0; i -= 1) {
          const message = messages[i];
          const content = (message?.content || '').trim();
          if (!content || message.role === 'system') continue;
          if (includesKeyword(content, keyword)) {
            matchedMessage = message;
            break;
          }
        }
      } else {
        matchedMessage = messages[messages.length - 1];
      }

      if (!matchedByTitle && !matchedMessage) continue;

      const subtitleSource = matchedMessage?.content || session.lastMessageContent || '';
      chatResults.push({
        id: matchedMessage?.id || session.id,
        title: sessionTitle,
        subTitle: this.createSnippet(subtitleSource, keyword),
        avatar: agent?.avatar || '[CHAT]',
        type: 'chat',
        sessionId: session.id,
        messageId: matchedMessage?.id,
        score: matchedByTitle ? 95 : 88,
        timestamp: matchedMessage?.createTime || session.lastMessageTime || this.deps.clock.now(),
      });
    }

    return chatResults
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_CHAT_RESULTS);
  }

  async search(keyword: string, contextSessionId?: string): Promise<SearchResults> {
    const normalized = normalize(keyword);
    if (!normalized) return EMPTY_RESULTS;

    const [sessions, files, articles, creations] = await Promise.all([
      this.loadSessionSnapshot(),
      this.loadFileSnapshot(),
      this.loadArticleSnapshot(),
      this.loadCreationSnapshot(),
    ]);

    const now = this.deps.clock.now();
    const agents = Object.values(AGENT_REGISTRY) as SearchAgentEntry[];

    const agentResults: SearchResultItem[] = agents
      .filter((agent) => {
        const source = `${agent.name} ${agent.description} ${(agent.tags || []).join(' ')}`;
        return includesKeyword(source, normalized);
      })
      .map((agent) => ({
        id: agent.id,
        title: agent.name,
        subTitle: agent.description,
        avatar: agent.avatar,
        type: 'agent' as const,
        score: 100,
        timestamp: now,
      }))
      .slice(0, MAX_AGENT_RESULTS);

    const chatResults = this.collectChatResults(sessions, normalized, contextSessionId);

    const fileResults: SearchResultItem[] = files
      .filter((file) => includesKeyword(`${file.name} ${file.type}`, normalized))
      .map((file) => ({
        id: file.id,
        title: file.name,
        subTitle: 'File',
        avatar: '[FILE]',
        type: 'file' as const,
        score: 70,
        timestamp: toTimestamp(file.updateTime, now),
      }));

    const articleResults: SearchResultItem[] = articles
      .filter((item) => includesKeyword(`${item.title || ''} ${item.summary || ''} ${item.content || ''}`, normalized))
      .map((item) => ({
        id: item.id,
        title: item.title,
        subTitle: item.summary || 'Article',
        avatar: '[ARTICLE]',
        type: 'article' as const,
        score: 68,
        timestamp: toTimestamp(item.updateTime || item.createTime, now),
      }));

    const creationResults: SearchResultItem[] = creations
      .filter((item) => {
        const source = `${item.title || ''} ${item.prompt || ''} ${(item.tags || []).join(' ')}`;
        return includesKeyword(source, normalized);
      })
      .map((item) => ({
        id: item.id,
        title: item.title,
        subTitle: item.prompt || 'Creation',
        avatar: item.type === 'music' ? '[MUSIC]' : item.type === 'video' ? '[VIDEO]' : '[CREATION]',
        type: 'creation' as const,
        score: 66,
        timestamp: toTimestamp(item.updatedAt || item.createdAt, now),
      }));

    let others = [...fileResults, ...articleResults, ...creationResults]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_OTHER_RESULTS);

    if (!contextSessionId) {
      const remoteOthers = await this.sdkService.searchContent(normalized);
      if (remoteOthers && remoteOthers.length > 0) {
        others = remoteOthers.slice(0, MAX_OTHER_RESULTS);
      }
    }

    return {
      agents: agentResults,
      chats: chatResults,
      others,
    };
  }
}

export function createSearchService(_deps?: ServiceFactoryDeps): ISearchService {
  return new SearchServiceImpl(_deps);
}

export const searchService: ISearchService = createSearchService();


