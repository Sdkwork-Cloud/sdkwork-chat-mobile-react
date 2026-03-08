import { ROUTE_PATHS, ROUTE_PREFIXES, type RoutePath } from '../../router/paths';

export type TabId = 'chat' | 'agents' | 'creation' | 'discover' | 'me';

export interface AppTabConfig {
  id: TabId;
  path: RoutePath;
  labelKey: string;
}

export const APP_TABS: ReadonlyArray<AppTabConfig> = [
  { id: 'chat', path: ROUTE_PATHS.conversationList, labelKey: 'tab_chat' },
  { id: 'agents', path: ROUTE_PATHS.agents, labelKey: 'tab_agents' },
  { id: 'creation', path: ROUTE_PATHS.creation, labelKey: 'tab_creation' },
  { id: 'discover', path: ROUTE_PATHS.discover, labelKey: 'tab_discover' },
  { id: 'me', path: ROUTE_PATHS.me, labelKey: 'tab_me' },
];

type TabRouteRule = {
  id: TabId;
  match: (path: string) => boolean;
};

const matchesPathSegment = (path: string, base: string): boolean =>
  path === base || path.startsWith(`${base}/`);

const TAB_ROUTE_RULES: ReadonlyArray<TabRouteRule> = [
  {
    id: 'me',
    match: (path) =>
      matchesPathSegment(path, ROUTE_PATHS.me) ||
      matchesPathSegment(path, ROUTE_PATHS.vip) ||
      matchesPathSegment(path, ROUTE_PATHS.accountSecurity) ||
      path.startsWith(ROUTE_PREFIXES.profile) ||
      path.startsWith(ROUTE_PREFIXES.settings) ||
      matchesPathSegment(path, ROUTE_PATHS.theme) ||
      matchesPathSegment(path, ROUTE_PATHS.modelSettings) ||
      matchesPathSegment(path, ROUTE_PATHS.modelConfig) ||
      matchesPathSegment(path, ROUTE_PATHS.feedback) ||
      matchesPathSegment(path, ROUTE_PATHS.chatBackground) ||
      path.startsWith(ROUTE_PATHS.wallet) ||
      path.startsWith(ROUTE_PREFIXES.my) ||
      matchesPathSegment(path, ROUTE_PATHS.favorites) ||
      path.startsWith(ROUTE_PATHS.orders) ||
      path.startsWith(ROUTE_PATHS.distribution) ||
      path.startsWith(ROUTE_PATHS.shoppingCart) ||
      path.startsWith(ROUTE_PATHS.orderConfirmation) ||
      path.startsWith(ROUTE_PATHS.orderDetail) ||
      path.startsWith(ROUTE_PATHS.withdraw) ||
      path.startsWith(ROUTE_PATHS.sharePoster) ||
      path.startsWith(ROUTE_PATHS.myTeam) ||
      path.startsWith(ROUTE_PATHS.commission) ||
      path.startsWith(ROUTE_PATHS.general) ||
      path.startsWith(ROUTE_PATHS.appointments),
  },
  {
    id: 'discover',
    match: (path) =>
      matchesPathSegment(path, ROUTE_PATHS.discover) ||
      matchesPathSegment(path, ROUTE_PATHS.app) ||
      matchesPathSegment(path, ROUTE_PATHS.skills) ||
      matchesPathSegment(path, ROUTE_PATHS.nearby) ||
      matchesPathSegment(path, ROUTE_PATHS.shopping) ||
      matchesPathSegment(path, ROUTE_PATHS.orderCenter) ||
      matchesPathSegment(path, ROUTE_PATHS.gigCenter) ||
      matchesPathSegment(path, ROUTE_PATHS.moments) ||
      matchesPathSegment(path, ROUTE_PATHS.videoDetails) ||
      matchesPathSegment(path, ROUTE_PATHS.shake) ||
      matchesPathSegment(path, ROUTE_PATHS.content) ||
      matchesPathSegment(path, ROUTE_PATHS.articleDetail) ||
      matchesPathSegment(path, ROUTE_PATHS.video) ||
      matchesPathSegment(path, ROUTE_PATHS.look) ||
      matchesPathSegment(path, ROUTE_PATHS.media) ||
      matchesPathSegment(path, ROUTE_PATHS.category) ||
      matchesPathSegment(path, ROUTE_PATHS.product) ||
      matchesPathSegment(path, ROUTE_PATHS.drive) ||
      matchesPathSegment(path, ROUTE_PATHS.communication),
  },
  {
    id: 'creation',
    match: (path) => path.startsWith(ROUTE_PATHS.creation),
  },
  {
    id: 'agents',
    match: (path) => path.startsWith(ROUTE_PATHS.agents) || path.startsWith(ROUTE_PREFIXES.agent),
  },
  {
    id: 'chat',
    match: (path) =>
      path === ROUTE_PATHS.root ||
      path.startsWith(ROUTE_PREFIXES.conversation) ||
      path.startsWith(ROUTE_PATHS.chat) ||
      path.startsWith(ROUTE_PATHS.contacts) ||
      path.startsWith(ROUTE_PATHS.contactProfile) ||
      path.startsWith(ROUTE_PATHS.groupDetails) ||
      path.startsWith(ROUTE_PATHS.joinGroup) ||
      path.startsWith(ROUTE_PATHS.newFriends) ||
      path.startsWith(ROUTE_PATHS.addFriend) ||
      path.startsWith(ROUTE_PATHS.search) ||
      path.startsWith(ROUTE_PATHS.notifications) ||
      path.startsWith(ROUTE_PATHS.scan),
  },
];

export const TAB_DEFAULT_PATHS: Record<TabId, RoutePath> = APP_TABS.reduce(
  (acc, tab) => {
    acc[tab.id] = tab.path;
    return acc;
  },
  {} as Record<TabId, RoutePath>
);

export interface TabPathResolution {
  tabId: TabId;
  matchedRule: boolean;
}

export const resolveTabByPathMeta = (path: string): TabPathResolution => {
  const matched = TAB_ROUTE_RULES.find((rule) => rule.match(path));
  if (matched) {
    return { tabId: matched.id, matchedRule: true };
  }
  return { tabId: 'chat', matchedRule: false };
};

export const resolveTabByPath = (path: string): TabId => {
  return resolveTabByPathMeta(path).tabId;
};
