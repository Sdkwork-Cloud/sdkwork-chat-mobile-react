import { AbstractStorageService, EVENTS, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Result, ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import { DEFAULT_AGENT_ID, resolveAgentProfile, resolveSessionAgent } from '../config/agentRegistry';
import type { Agent } from '../config/agentRegistry';
import type { IChatService, Message, ChatSession, ChatStatusChangePayload, CreateChatSessionOptions } from '../types';

const toSessionPreview = (content: string): string => {
  const value = (content || '').trim();
  if (!value) return '';
  if (value.startsWith('data:image')) return '[图片]';
  if (value.includes('[商品]') || value.includes('[product]')) return '[商品推荐]';
  if (value.startsWith('[语音]') || value.startsWith('🎤')) return '[语音消息]';
  if (value.startsWith('[文件]') || value.startsWith('📂') || value.startsWith('📁')) return '[文件]';
  if (value.startsWith('[位置]') || value.startsWith('📍')) return '[位置]';
  return value.length > 120 ? `${value.slice(0, 120)}...` : value;
};

const FORWARD_CONTENT_KEY = 'forward_content';
const CHAT_EVENTS = {
  STATUS_CHANGE: 'status:change',
} as const;

const normalizeSessionTitle = (value?: string): string => (value || '').trim();

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readThreadOrdinal = (title: string | undefined, baseTitle: string): number | null => {
  const normalizedTitle = normalizeSessionTitle(title);
  if (!normalizedTitle) return 1;
  if (normalizedTitle === baseTitle) return 1;

  const matched = normalizedTitle.match(new RegExp(`^${escapeRegExp(baseTitle)} #(\\d+)$`));
  if (!matched) return null;

  const ordinal = Number.parseInt(matched[1] || '', 10);
  return Number.isFinite(ordinal) && ordinal > 1 ? ordinal : null;
};

const resolveNextAgentSessionTitle = (
  agent: Agent,
  sessions: ChatSession[],
  requestedTitle?: string,
): string => {
  const explicitTitle = normalizeSessionTitle(requestedTitle);
  if (explicitTitle) return explicitTitle;

  const baseTitle = normalizeSessionTitle(agent.name) || 'OpenChat';
  const takenOrdinals = new Set<number>();

  for (const session of sessions) {
    if (session.type !== 'agent' || session.agentId !== agent.id) continue;
    const ordinal = readThreadOrdinal(session.title, baseTitle);
    if (ordinal) takenOrdinals.add(ordinal);
  }

  if (!takenOrdinals.size) return baseTitle;

  let nextOrdinal = 1;
  while (takenOrdinals.has(nextOrdinal)) {
    nextOrdinal += 1;
  }
  return nextOrdinal === 1 ? baseTitle : `${baseTitle} #${nextOrdinal}`;
};

const backfillMissingAgentSessionTitles = (sessions: ChatSession[]): { sessions: ChatSession[]; changed: boolean } => {
  let changed = false;
  const nextSessions = [...sessions];
  const missingSessions = nextSessions
    .map((session, index) => ({ session, index }))
    .filter(({ session }) => session.type === 'agent' && !normalizeSessionTitle(session.title))
    .sort((left, right) => left.session.createTime - right.session.createTime);

  for (const { session, index } of missingSessions) {
    const agent = resolveSessionAgent(session);
    const nextTitle = resolveNextAgentSessionTitle(
      agent,
      nextSessions.filter((candidate) => candidate.id !== session.id),
    );

    if (nextTitle === session.title) continue;
    nextSessions[index] = { ...session, title: nextTitle };
    changed = true;
  }

  return changed ? { sessions: nextSessions, changed } : { sessions, changed };
};

const getLatestAgentSession = (sessions: ChatSession[], agentId: string): ChatSession | undefined =>
  sessions
    .filter((session) => session.type === 'agent' && session.agentId === agentId)
    .sort((left, right) => {
      const rightActivity = right.lastMessageTime || right.updateTime || right.createTime;
      const leftActivity = left.lastMessageTime || left.updateTime || left.createTime;
      if (rightActivity !== leftActivity) return rightActivity - leftActivity;
      return right.createTime - left.createTime;
    })[0];

const getForwardStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage || null;
};

class ChatServiceImpl extends AbstractStorageService<ChatSession> implements IChatService {
  protected STORAGE_KEY = 'sys_chat_sessions_v4';
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private now(): number {
    return this.deps.clock.now();
  }

  private createId(prefix: string): string {
    return this.deps.idGenerator.next(prefix);
  }

  protected async onInitialize() {
    let list = this.cache || [];
    const titledState = backfillMissingAgentSessionTitles(list);
    if (titledState.changed) {
      list = titledState.sessions;
      this.cache = list;
      await this.commit();
    }

    if (list.length === 0) {
      const agent = resolveAgentProfile(DEFAULT_AGENT_ID);
      const now = this.now();
      const initialMsg: Message = {
        id: this.createId('msg'),
        sessionId: 'session_default',
        role: 'model',
        content: agent.initialMessage,
        createTime: now,
        updateTime: now,
        status: 'sent',
      };

      const defaultSession: ChatSession = {
        id: 'session_default',
        type: 'agent',
        agentId: DEFAULT_AGENT_ID,
        agentProfile: agent,
        title: resolveNextAgentSessionTitle(agent, list),
        lastMessageContent: agent.initialMessage,
        lastMessageTime: now,
        unreadCount: 1,
        isPinned: true,
        messages: [initialMsg],
        createTime: now,
        updateTime: now,
        sessionConfig: { showAvatar: false },
      };

      list.push(defaultSession);
      this.cache = list;
      await this.commit();
    }
  }

  async getSessionList(): Promise<Result<ChatSession[]>> {
    const page = await this.findAll({
      sort: { field: 'lastMessageTime', order: 'desc' },
    });

    const sorted = (page.content || []).sort((a: ChatSession, b: ChatSession) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    return { success: true, data: sorted };
  }

  async createSession(
    agentId: string,
    agentProfile?: Partial<Agent>,
    options?: CreateChatSessionOptions,
  ): Promise<Result<ChatSession>> {
    const list = await this.loadData();
    const shouldReuseExisting = options?.reuseExisting !== false;
    if (shouldReuseExisting) {
      const existing = getLatestAgentSession(list, agentId);
      if (existing) return { success: true, data: existing };
    }

    const agent = resolveAgentProfile(agentId, agentProfile);
    const now = this.now();
    const sessionId = this.createId('session');

    const newSession: ChatSession = {
      id: sessionId,
      type: 'agent',
      agentId: agent.id,
      agentProfile: agent,
      title: resolveNextAgentSessionTitle(agent, list, options?.title),
      lastMessageContent: agent.initialMessage,
      lastMessageTime: now,
      unreadCount: 0,
      isPinned: false,
      createTime: now,
      updateTime: now,
      messages: [
        {
          id: this.createId('msg'),
          sessionId,
          role: 'model',
          content: agent.initialMessage,
          createTime: now,
          updateTime: now,
          status: 'sent',
        },
      ],
    };

    const saved = await this.save(newSession);
    return { success: true, data: saved };
  }

  async addMessage(sessionId: string, messageData: Partial<Message>): Promise<Result<ChatSession>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false, message: 'Session not found' };

    const now = this.now();
    const newMessage: Message = {
      id: messageData.id || this.createId('msg'),
      sessionId,
      role: messageData.role || 'user',
      content: messageData.content || '',
      createTime: now,
      updateTime: now,
      status: messageData.status || 'sent',
      ...messageData,
    };

    if (!session.messages) session.messages = [];
    session.messages.push(newMessage);
    session.lastMessageContent = toSessionPreview(newMessage.content);
    session.lastMessageTime = now;
    session.updateTime = now;
    const saved = await this.save(session);
    return { success: true, data: saved };
  }

  async clearHistory(sessionId: string): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false };

    session.messages = [];
    session.lastMessageContent = '';
    await this.save(session);
    return { success: true };
  }

  async togglePin(sessionId: string): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false };

    session.isPinned = !session.isPinned;
    await this.save(session);
    return { success: true };
  }

  async deleteMessages(sessionId: string, messageIds: string[]): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false, message: 'Session not found' };

    session.messages = session.messages.filter((m) => !messageIds.includes(m.id));
    session.lastMessageContent =
      session.messages.length > 0 ? toSessionPreview(session.messages[session.messages.length - 1].content) : '';
    await this.save(session);
    return { success: true };
  }

  async updateMessage(sessionId: string, messageId: string, updates: Partial<Message>): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false };

    const index = session.messages.findIndex((m) => m.id === messageId);
    if (index < 0) return { success: false };

    session.messages[index] = { ...session.messages[index], ...updates };
    if (index === session.messages.length - 1 && updates.content) {
      session.lastMessageContent = toSessionPreview(updates.content);
    }
    await this.save(session);
    return { success: true };
  }

  async recallMessage(sessionId: string, messageId: string): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false };

    const index = session.messages.findIndex((m) => m.id === messageId);
    if (index < 0) return { success: false };

    session.messages[index] = {
      ...session.messages[index],
      role: 'system',
      content: 'You recalled a message',
      status: 'sent',
    } as Message;
    if (index === session.messages.length - 1) {
      session.lastMessageContent = 'You recalled a message';
    }

    await this.save(session);
    return { success: true };
  }

  async updateSessionConfig(sessionId: string, config: { showAvatar?: boolean; backgroundImage?: string }): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false };

    session.sessionConfig = { ...session.sessionConfig, ...config } as ChatSession['sessionConfig'];
    await this.save(session);
    return { success: true };
  }

  async markAsRead(sessionId: string): Promise<Result<void>> {
    return this.setUnreadCount(sessionId, 0);
  }

  async setUnreadCount(sessionId: string, count: number): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false };

    session.unreadCount = count;
    await this.save(session);
    return { success: true };
  }

  async toggleMute(sessionId: string): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false };

    session.isMuted = !session.isMuted;
    await this.save(session);
    return { success: true };
  }

  async clearAll(): Promise<Result<void>> {
    this.cache = [];
    await this.commit();
    return { success: true };
  }

  async addMembers(sessionId: string, memberIds: string[]): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false };

    session.memberIds = [...(session.memberIds || []), ...memberIds];
    await this.save(session);
    return { success: true };
  }

  async updateGroupInfo(sessionId: string, info: { groupName?: string; groupAnnouncement?: string }): Promise<Result<void>> {
    const session = await this.findById(sessionId);
    if (!session) return { success: false };

    if (info.groupName) session.groupName = info.groupName;
    if (info.groupAnnouncement) session.groupAnnouncement = info.groupAnnouncement;
    await this.save(session);
    return { success: true };
  }

  async createGroupSession(groupName: string, memberIds: string[]): Promise<Result<ChatSession>> {
    const now = this.now();
    const sessionId = this.createId('session');
    const systemText = 'You created a group chat';

    const newSession: ChatSession = {
      id: sessionId,
      type: 'group',
      agentId: DEFAULT_AGENT_ID,
      groupName,
      memberIds,
      lastMessageContent: systemText,
      lastMessageTime: now,
      unreadCount: 0,
      isPinned: false,
      createTime: now,
      updateTime: now,
      messages: [
        {
          id: this.createId('msg'),
          sessionId,
          role: 'system',
          content: systemText,
          createTime: now,
          updateTime: now,
          status: 'sent',
        },
      ],
    };

    const saved = await this.save(newSession);
    return { success: true, data: saved };
  }

  async setForwardContent(content: string): Promise<Result<void>> {
    const storage = getForwardStorage();
    if (!storage) return { success: false, message: 'Session storage unavailable' };
    try {
      storage.setItem(FORWARD_CONTENT_KEY, content);
      return { success: true };
    } catch {
      return { success: false, message: 'Failed to cache forward content' };
    }
  }

  async getForwardContent(): Promise<Result<string | null>> {
    const storage = getForwardStorage();
    if (!storage) return { success: false, message: 'Session storage unavailable' };
    try {
      return { success: true, data: storage.getItem(FORWARD_CONTENT_KEY) };
    } catch {
      return { success: false, message: 'Failed to read forward content' };
    }
  }

  async clearForwardContent(): Promise<Result<void>> {
    const storage = getForwardStorage();
    if (!storage) return { success: false, message: 'Session storage unavailable' };
    try {
      storage.removeItem(FORWARD_CONTENT_KEY);
      return { success: true };
    } catch {
      return { success: false, message: 'Failed to clear forward content' };
    }
  }

  emitStatusChange(payload: ChatStatusChangePayload): void {
    this.deps.eventBus.emit(CHAT_EVENTS.STATUS_CHANGE, payload);
  }

  onStatusChange(handler: (payload: ChatStatusChangePayload) => void): () => void {
    return this.deps.eventBus.on(CHAT_EVENTS.STATUS_CHANGE, handler);
  }

  onSessionDataChanged(handler: () => void): () => void {
    return this.deps.eventBus.on(EVENTS.DATA_CHANGE, (payload: { key?: string; action?: string } | undefined) => {
      if (payload?.key !== this.STORAGE_KEY) return;
      if (payload.action !== 'save' && payload.action !== 'delete') return;
      handler();
    });
  }
}

export function createChatService(_deps?: ServiceFactoryDeps): IChatService {
  return new ChatServiceImpl(_deps);
}

export const chatService: IChatService = createChatService();

