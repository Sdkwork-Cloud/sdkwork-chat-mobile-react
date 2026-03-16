import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, Page, Toast } from '@sdkwork/react-mobile-commons';
import { AGENT_REGISTRY, chatService } from '@sdkwork/react-mobile-chat';
import { useSearch } from '../hooks/useSearch';
import type { SearchResultItem, SearchResultType } from '../types';
import './SearchPage.css';

interface SearchPageProps {
  t?: (key: string) => string;
  onCancel?: () => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
  onResultClick?: (result: { type: string }) => void;
}

type LocaleCode = 'zh-CN' | 'en-US';

type LocaleCopy = {
  placeholder: string;
  contextPlaceholder: string;
  addFriendPlaceholder: string;
  addFriendHint: string;
  addFriendTipsTitle: string;
  addFriendTipScan: string;
  addFriendTipQrcode: string;
  addFriendTipRequests: string;
  addFriendAction: string;
  addFriendSending: string;
  addFriendSuccess: string;
  addFriendOpenRequests: string;
  addFriendAlreadySent: string;
  addFriendAlreadyContact: string;
  addFriendInvalid: string;
  addFriendFailed: string;
  cancel: string;
  recentSearch: string;
  clear: string;
  clearConfirm: string;
  searchScope: string;
  quickAgents: string;
  quickMoments: string;
  quickFiles: string;
  sectionAgents: string;
  sectionChats: string;
  sectionContextChats: string;
  sectionOthers: string;
  searching: string;
  noResults: string;
  webSearch: string;
  webSearchDesc: string;
  createSessionFailed: string;
  locateFileHint: string;
  groupChat: string;
  conversation: string;
};

const COPY: Record<LocaleCode, LocaleCopy> = {
  'zh-CN': {
    placeholder: '搜索智能体、聊天记录、内容',
    contextPlaceholder: '搜索“{name}”聊天记录',
    addFriendPlaceholder: '微信号/手机号',
    addFriendHint: '输入微信号、手机号或昵称，向对方发送好友申请',
    addFriendTipsTitle: '你还可以通过以下方式添加',
    addFriendTipScan: '扫一扫名片二维码',
    addFriendTipQrcode: '出示我的二维码',
    addFriendTipRequests: '查看新的朋友',
    addFriendAction: '发送添加申请',
    addFriendSending: '发送中...',
    addFriendSuccess: '已向“{account}”发送好友申请',
    addFriendOpenRequests: '查看新的朋友',
    addFriendAlreadySent: '该账号已有待处理申请',
    addFriendAlreadyContact: '该账号已在通讯录中',
    addFriendInvalid: '请输入有效账号',
    addFriendFailed: '发送失败，请稍后重试',
    cancel: '取消',
    recentSearch: '最近搜索',
    clear: '清空',
    clearConfirm: '确定清空搜索历史？',
    searchScope: '搜索指定内容',
    quickAgents: '智能体',
    quickMoments: '朋友圈',
    quickFiles: '文件',
    sectionAgents: '智能体',
    sectionChats: '聊天记录',
    sectionContextChats: '找到 {count} 条相关记录',
    sectionOthers: '内容（文件/文章/创作）',
    searching: '搜索中...',
    noResults: '未找到“{keyword}”相关结果',
    webSearch: '搜一搜',
    webSearchDesc: '网络搜索、百科、视频',
    createSessionFailed: '创建会话失败，请稍后重试',
    locateFileHint: '已进入云盘，请在列表中查看文件：{title}',
    groupChat: '群聊',
    conversation: '会话',
  },
  'en-US': {
    placeholder: 'Search agents, chats and content',
    contextPlaceholder: 'Search messages in "{name}"',
    addFriendPlaceholder: 'WeChat ID / Phone',
    addFriendHint: 'Enter WeChat ID, phone number, or nickname to send a friend request',
    addFriendTipsTitle: 'You can also add friends via',
    addFriendTipScan: 'Scan a QR code',
    addFriendTipQrcode: 'Show my QR code',
    addFriendTipRequests: 'Open New Friends',
    addFriendAction: 'Send Request',
    addFriendSending: 'Sending...',
    addFriendSuccess: 'Friend request sent to "{account}"',
    addFriendOpenRequests: 'Open New Friends',
    addFriendAlreadySent: 'A pending request already exists',
    addFriendAlreadyContact: 'This account is already in contacts',
    addFriendInvalid: 'Please enter a valid account',
    addFriendFailed: 'Failed to send request. Please try again.',
    cancel: 'Cancel',
    recentSearch: 'Recent Searches',
    clear: 'Clear',
    clearConfirm: 'Clear all search history?',
    searchScope: 'Search specific content',
    quickAgents: 'Agents',
    quickMoments: 'Moments',
    quickFiles: 'Files',
    sectionAgents: 'Agents',
    sectionChats: 'Chats',
    sectionContextChats: '{count} related records',
    sectionOthers: 'Content (Files / Articles / Creations)',
    searching: 'Searching...',
    noResults: 'No results found for "{keyword}"',
    webSearch: 'Search Web',
    webSearchDesc: 'Web, encyclopedia and videos',
    createSessionFailed: 'Failed to create conversation. Please try again.',
    locateFileHint: 'Cloud drive opened, file: {title}',
    groupChat: 'Group Chat',
    conversation: 'Conversation',
  },
};

const resolveLocale = (): LocaleCode => {
  const htmlLang = (document.documentElement.lang || '').toLowerCase();
  const navLang = (navigator.language || '').toLowerCase();
  const language = htmlLang || navLang;
  return language.startsWith('en') ? 'en-US' : 'zh-CN';
};

const interpolate = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ''));
};

const resolveIconEmoji = (type: SearchResultType): string => {
  if (type === 'file') return '📁';
  if (type === 'article') return '📰';
  if (type === 'creation') return '🎨';
  if (type === 'chat') return '💬';
  return '🤖';
};

const HighlightText = React.memo(({ text, keyword }: { text: string; keyword: string }) => {
  const value = text || '';
  const target = keyword.trim();
  if (!target || !value) return <>{value}</>;

  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = value.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, index) => (
        part.toLowerCase() === target.toLowerCase()
          ? <span key={`${part}-${index}`} className="search-page__highlight">{part}</span>
          : <span key={`${part}-${index}`}>{part}</span>
      ))}
    </>
  );
});

const formatTimestamp = (value: number, locale: LocaleCode): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
  });
};

export const SearchPage: React.FC<SearchPageProps> = ({ t, onCancel, onNavigate, onResultClick }) => {
  const locale = useMemo(resolveLocale, []);
  const copy = COPY[locale];
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const rawQueryValue = useMemo(() => query.trim(), [query]);
  const searchQueryValue = useMemo(() => deferredQuery.trim(), [deferredQuery]);
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search));
  const [contextName, setContextName] = useState('');

  const { history, results, isLoading, error, search, addHistory, clearHistory } = useSearch();

  const contextSessionId = params.get('sessionId') || undefined;
  const isAddFriendMode = params.get('from') === 'add-friend';
  const [requestState, setRequestState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [requestTarget, setRequestTarget] = useState('');

  const text = useCallback(
    (key: keyof LocaleCopy, i18nKey?: string, vars?: Record<string, string | number>) => {
      if (i18nKey && t) {
        const external = t(i18nKey);
        if (external && external !== i18nKey) {
          return interpolate(external, vars);
        }
      }
      return interpolate(copy[key], vars);
    },
    [copy, t]
  );

  const navigate = useCallback(
    (path: string, routeParams?: Record<string, string>) => {
      if (onNavigate) {
        onNavigate(path, routeParams);
        return;
      }

      const searchPart = routeParams && Object.keys(routeParams).length > 0
        ? `?${new URLSearchParams(routeParams).toString()}`
        : '';
      const nextUrl = `${path}${searchPart}`;
      window.history.pushState({}, '', nextUrl);
      window.dispatchEvent(new CustomEvent('routechange', {
        detail: { path, params: routeParams || {} },
      }));
    },
    [onNavigate]
  );

  useEffect(() => {
    const syncParams = () => setParams(new URLSearchParams(window.location.search));
    window.addEventListener('popstate', syncParams);
    window.addEventListener('routechange', syncParams as EventListener);
    return () => {
      window.removeEventListener('popstate', syncParams);
      window.removeEventListener('routechange', syncParams as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isAddFriendMode) {
      setRequestState('idle');
      setRequestTarget('');
      return;
    }
    const value = query.trim();
    if (!value || value !== requestTarget) {
      setRequestState('idle');
    }
  }, [isAddFriendMode, query, requestTarget]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!contextSessionId) {
      setContextName('');
      return;
    }

    let active = true;
    const loadContext = async () => {
      const sessionResult = await chatService.getSessionList().catch(() => null);
      const sessions = Array.isArray(sessionResult?.data) ? sessionResult.data : [];
      const current = sessions.find((item) => item.id === contextSessionId);

      if (!active || !current) return;

      if (current.type === 'group') {
        setContextName(current.groupName || text('groupChat'));
        return;
      }

      const agent = AGENT_REGISTRY[current.agentId];
      setContextName(agent?.name || text('conversation'));
    };

    void loadContext();
    return () => {
      active = false;
    };
  }, [contextSessionId, text]);

  useEffect(() => {
    if (isAddFriendMode) return;
    const timer = window.setTimeout(() => {
      void search(searchQueryValue, contextSessionId);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [contextSessionId, isAddFriendMode, search, searchQueryValue]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    navigate('/discover');
  }, [navigate, onCancel]);

  const handleClearHistory = useCallback(async () => {
    const confirmed = window.confirm(text('clearConfirm'));
    if (!confirmed) return;
    await clearHistory();
  }, [clearHistory, text]);

  const handleSendFriendRequest = useCallback(async () => {
    const account = query.trim();
    if (!account || account.length < 2) {
      Toast.info(text('addFriendInvalid'));
      return;
    }

    setRequestState('sending');
    try {
      const { contactsService } = await import('@sdkwork/react-mobile-contacts');
      const contact = await contactsService.findByName(account);
      if (contact?.id) {
        setRequestState('idle');
        Toast.info(text('addFriendAlreadyContact'));
        return;
      }

      const requests = await contactsService.getFriendRequests();
      const duplicate = requests.find((item: { status: string; fromUserId?: string; fromUserName?: string }) => (
        item.status === 'pending' &&
        (item.fromUserId === account || item.fromUserName === account)
      ));
      if (duplicate) {
        setRequestState('sent');
        setRequestTarget(account);
        Toast.info(text('addFriendAlreadySent'));
        return;
      }

      await contactsService.sendFriendRequest(account, '你好，想添加你为好友');
      setRequestState('sent');
      setRequestTarget(account);
      Toast.success(text('addFriendSuccess', undefined, { account }));
    } catch (_error) {
      setRequestState('idle');
      Toast.error(text('addFriendFailed'));
    }
  }, [query, text]);

  const handleOpenNewFriends = useCallback(() => {
    navigate('/new-friends');
  }, [navigate]);

  const openAgentChat = useCallback(
    async (agentId: string): Promise<boolean> => {
      const createResult = await chatService.createSession(agentId).catch(() => null);
      const createdSessionId = createResult?.data?.id;
      if (createResult?.success && createdSessionId) {
        navigate('/chat', { id: createdSessionId });
        return true;
      }

      const listResult = await chatService.getSessionList().catch(() => null);
      const sessions = Array.isArray(listResult?.data) ? listResult.data : [];
      const matchedSession = sessions.find((item) => item.agentId === agentId);
      if (matchedSession?.id) {
        navigate('/chat', { id: matchedSession.id });
        return true;
      }

      return false;
    },
    [navigate]
  );

  const handleItemClick = useCallback(
    async (item: SearchResultItem) => {
      const keyword = rawQueryValue;
      if (keyword) {
        await addHistory(keyword);
      }

      if (item.type === 'agent') {
        const ok = await openAgentChat(item.id);
        if (!ok) {
          Toast.error(text('createSessionFailed'));
        }
        return;
      }

      if (item.type === 'chat') {
        if (item.sessionId) {
          const chatParams: Record<string, string> = { id: item.sessionId };
          if (item.messageId) {
            chatParams.msgId = item.messageId;
          }
          navigate('/chat', chatParams);
        } else {
          navigate('/conversation-list');
        }
        return;
      }

      if (item.type === 'file') {
        navigate('/drive');
        Toast.info(text('locateFileHint', undefined, { title: item.title }));
        return;
      }

      if (item.type === 'article') {
        navigate('/article/detail', { id: item.id });
        return;
      }

      if (item.type === 'creation') {
        navigate('/creation/detail', { id: item.id });
        return;
      }

      onResultClick?.({ type: item.type });
    },
    [addHistory, navigate, onResultClick, openAgentChat, rawQueryValue, text]
  );

  const handleWebSearch = useCallback(async () => {
    const keyword = rawQueryValue;
    if (!keyword) return;
    await addHistory(keyword);
    const toast = Toast.loading(text('searching'));
    window.setTimeout(() => toast.close(), 850);
  }, [addHistory, rawQueryValue, text]);

  const hasQuery = (isAddFriendMode ? rawQueryValue : searchQueryValue).length > 0;
  const hasResults = results.agents.length > 0 || results.chats.length > 0 || results.others.length > 0;

  const placeholder = isAddFriendMode
    ? text('addFriendPlaceholder')
    : (contextName
      ? text('contextPlaceholder', undefined, { name: contextName })
      : text('placeholder', 'search.placeholder'));

  return (
    <Page noNavbar noPadding background="var(--bg-body)">
      <div className="search-page">
        <div className="search-page__header">
          <div className="search-page__input-wrap">
            <Icon name="search" size={16} color="var(--text-secondary)" />
            <input
              ref={inputRef}
              className="search-page__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                const value = query.trim();
                if (!value) return;
                if (isAddFriendMode) {
                  void handleSendFriendRequest();
                  return;
                }
                void addHistory(value);
              }}
            />
            {query.length > 0 ? (
              <button
                type="button"
                className="search-page__clear-btn"
                onClick={() => setQuery('')}
                aria-label="clear"
              >
                <Icon name="clear" size={18} color="var(--text-secondary)" />
              </button>
            ) : null}
          </div>

          <button type="button" className="search-page__cancel-btn" onClick={handleCancel}>
            {text('cancel', 'search.cancel')}
          </button>
        </div>

        <div className="search-page__content">
          {isAddFriendMode ? (
            <div className="search-page__add-friend">
              <div className="search-page__add-hint">
                <Icon name="addUser" size={16} color="#ffffff" />
                <span>{text('addFriendHint')}</span>
              </div>

              {!hasQuery ? (
                <div className="search-page__add-empty">
                  <div className="search-page__add-title">{text('addFriendTipsTitle')}</div>
                  <div className="search-page__add-grid">
                    <button type="button" onClick={() => navigate('/scan')}>
                      <Icon name="scan" size={18} color="var(--primary-color)" />
                      <span>{text('addFriendTipScan')}</span>
                    </button>
                    <button type="button" onClick={() => navigate('/my-qrcode')}>
                      <Icon name="qrcode" size={18} color="var(--primary-color)" />
                      <span>{text('addFriendTipQrcode')}</span>
                    </button>
                    <button type="button" onClick={handleOpenNewFriends}>
                      <Icon name="addUser" size={18} color="var(--primary-color)" />
                      <span>{text('addFriendTipRequests')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="search-page__add-result">
                  <div className="search-page__add-account">账号：{rawQueryValue}</div>
                  <button
                    type="button"
                    className="search-page__add-submit"
                    disabled={requestState === 'sending'}
                    onClick={() => {
                      void handleSendFriendRequest();
                    }}
                  >
                    {requestState === 'sending' ? text('addFriendSending') : text('addFriendAction')}
                  </button>
                  {requestState === 'sent' && requestTarget === rawQueryValue ? (
                    <button type="button" className="search-page__add-open" onClick={handleOpenNewFriends}>
                      {text('addFriendOpenRequests')}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            !hasQuery ? (
            <div className="search-page__empty">
              {history.length > 0 ? (
                <section className="search-page__history">
                  <div className="search-page__history-head">
                    <span>{text('recentSearch', 'search.history')}</span>
                    <button type="button" onClick={handleClearHistory}>
                      {text('clear', 'search.clear')}
                    </button>
                  </div>
                  <div className="search-page__history-tags">
                    {history.map((item) => (
                      <button
                        type="button"
                        key={item.keyword}
                        className="search-page__history-tag"
                        onClick={() => setQuery(item.keyword)}
                      >
                        {item.keyword}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {!contextSessionId ? (
                <section className="search-page__quick-links">
                  <div className="search-page__quick-title">{text('searchScope')}</div>
                  <div className="search-page__quick-grid">
                    <button type="button" onClick={() => navigate('/agents')}>
                      <Icon name="agents" size={18} color="var(--primary-color)" />
                      <span>{text('quickAgents')}</span>
                    </button>
                    <button type="button" onClick={() => navigate('/moments')}>
                      <Icon name="moments" size={18} color="var(--primary-color)" />
                      <span>{text('quickMoments')}</span>
                    </button>
                    <button type="button" onClick={() => navigate('/drive')}>
                      <span className="search-page__emoji-icon">📁</span>
                      <span>{text('quickFiles')}</span>
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
            ) : (
            <div className="search-page__results">
              {isLoading ? (
                <div className="search-page__status">{text('searching')}</div>
              ) : null}

              {error ? (
                <div className="search-page__status search-page__status--error">{error}</div>
              ) : null}

              {!isLoading && results.agents.length > 0 ? (
                <section className="search-page__group">
                  <div className="search-page__group-title">{text('sectionAgents')}</div>
                  <div className="search-page__group-content">
                    {results.agents.map((item) => (
                      <button
                        key={`agent-${item.id}`}
                        type="button"
                        className="search-page__cell"
                        onClick={() => {
                          void handleItemClick(item);
                        }}
                      >
                        <div className="search-page__cell-icon">
                          {typeof item.avatar === 'string' && item.avatar.startsWith('http')
                            ? <img src={item.avatar} alt={item.title} />
                            : <span>{item.avatar || resolveIconEmoji(item.type)}</span>}
                        </div>
                        <div className="search-page__cell-main">
                          <div className="search-page__cell-title">
                            <HighlightText text={item.title} keyword={searchQueryValue} />
                          </div>
                          <div className="search-page__cell-subtitle">{item.subTitle}</div>
                        </div>
                        <Icon name="arrow-right" size={16} color="var(--text-placeholder)" />
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {!isLoading && results.chats.length > 0 ? (
                <section className="search-page__group">
                  <div className="search-page__group-title">
                    {contextSessionId
                      ? text('sectionContextChats', undefined, { count: results.chats.length })
                      : text('sectionChats')}
                  </div>
                  <div className="search-page__group-content">
                    {results.chats.map((item) => (
                      <button
                        key={`chat-${item.sessionId || item.id}-${item.messageId || 'latest'}`}
                        type="button"
                        className="search-page__cell"
                        onClick={() => {
                          void handleItemClick(item);
                        }}
                      >
                        <div className="search-page__cell-icon">
                          {typeof item.avatar === 'string' && item.avatar.startsWith('http')
                            ? <img src={item.avatar} alt={item.title} />
                            : <span>{item.avatar || resolveIconEmoji(item.type)}</span>}
                        </div>
                        <div className="search-page__cell-main">
                          <div className="search-page__cell-title">
                            <HighlightText text={item.title} keyword={searchQueryValue} />
                          </div>
                          <div className="search-page__cell-subtitle">
                            <HighlightText text={item.subTitle} keyword={searchQueryValue} />
                          </div>
                        </div>
                        <div className="search-page__cell-tail">
                          <span>{formatTimestamp(item.timestamp, locale)}</span>
                          <Icon name="arrow-right" size={16} color="var(--text-placeholder)" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {!isLoading && results.others.length > 0 ? (
                <section className="search-page__group">
                  <div className="search-page__group-title">{text('sectionOthers')}</div>
                  <div className="search-page__group-content">
                    {results.others.map((item) => (
                      <button
                        key={`other-${item.type}-${item.id}`}
                        type="button"
                        className="search-page__cell"
                        onClick={() => {
                          void handleItemClick(item);
                        }}
                      >
                        <div className="search-page__cell-icon">
                          <span>{item.avatar || resolveIconEmoji(item.type)}</span>
                        </div>
                        <div className="search-page__cell-main">
                          <div className="search-page__cell-title">
                            <HighlightText text={item.title} keyword={searchQueryValue} />
                          </div>
                          <div className="search-page__cell-subtitle">{item.subTitle}</div>
                        </div>
                        <div className="search-page__cell-tail">
                          <span>{formatTimestamp(item.timestamp, locale)}</span>
                          <Icon name="arrow-right" size={16} color="var(--text-placeholder)" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {!isLoading && !hasResults ? (
                <div className="search-page__no-result">
                  <Icon name="search" size={28} color="var(--text-placeholder)" />
                  <p>{text('noResults', 'search.noResults', { keyword: searchQueryValue })}</p>
                </div>
              ) : null}

              {!contextSessionId && !isLoading ? (
                <section className="search-page__group search-page__group--web">
                  <div className="search-page__group-content">
                    <button
                      type="button"
                      className="search-page__cell search-page__cell--web"
                      onClick={() => {
                        void handleWebSearch();
                      }}
                    >
                      <div className="search-page__web-icon">
                        <Icon name="search" size={18} color="#ffffff" />
                      </div>
                      <div className="search-page__cell-main">
                        <div className="search-page__cell-title">
                          {text('webSearch')}
                          <span className="search-page__web-keyword"> "{rawQueryValue}"</span>
                        </div>
                        <div className="search-page__cell-subtitle">{text('webSearchDesc')}</div>
                      </div>
                      <Icon name="arrow-right" size={16} color="var(--text-placeholder)" />
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
            )
          )}
        </div>
      </div>
    </Page>
  );
};

export default SearchPage;
