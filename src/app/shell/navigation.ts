export type TabId = 'chat' | 'agents' | 'creation' | 'discover' | 'me';

export interface AppTabConfig {
  id: TabId;
  path: string;
  labelKey: string;
}

export const APP_TABS: ReadonlyArray<AppTabConfig> = [
  { id: 'chat', path: '/conversation-list', labelKey: 'tab_chat' },
  { id: 'agents', path: '/agents', labelKey: 'tab_agents' },
  { id: 'creation', path: '/creation', labelKey: 'tab_creation' },
  { id: 'discover', path: '/discover', labelKey: 'tab_discover' },
  { id: 'me', path: '/me', labelKey: 'tab_me' },
];

type TabRouteRule = {
  id: TabId;
  match: (path: string) => boolean;
};

const TAB_ROUTE_RULES: ReadonlyArray<TabRouteRule> = [
  {
    id: 'me',
    match: (path) =>
      path.startsWith('/me') ||
      path.startsWith('/profile') ||
      path.startsWith('/settings') ||
      path.startsWith('/wallet') ||
      path.startsWith('/my-') ||
      path.startsWith('/orders') ||
      path.startsWith('/distribution') ||
      path.startsWith('/commerce/distribution') ||
      path.startsWith('/shopping-cart') ||
      path.startsWith('/commerce/cart') ||
      path.startsWith('/order-confirmation') ||
      path.startsWith('/commerce/checkout') ||
      path.startsWith('/order-detail') ||
      path.startsWith('/withdraw') ||
      path.startsWith('/share-poster') ||
      path.startsWith('/my-team') ||
      path.startsWith('/commission') ||
      path.startsWith('/general') ||
      path.startsWith('/appointments'),
  },
  {
    id: 'discover',
    match: (path) =>
      path.startsWith('/discover') ||
      path.startsWith('/commerce/mall') ||
      path.startsWith('/commerce/product') ||
      path.startsWith('/mall') ||
      path.startsWith('/shop') ||
      path.startsWith('/gig-center') ||
      path.startsWith('/moments') ||
      path.startsWith('/channels') ||
      path.startsWith('/shake') ||
      path.startsWith('/content') ||
      path.startsWith('/article') ||
      path.startsWith('/video') ||
      path.startsWith('/drive') ||
      path.startsWith('/call') ||
      path.startsWith('/communication'),
  },
  {
    id: 'creation',
    match: (path) => path.startsWith('/creation'),
  },
  {
    id: 'agents',
    match: (path) => path.startsWith('/agents') || path.startsWith('/agent'),
  },
  {
    id: 'chat',
    match: (path) =>
      path === '/' ||
      path.startsWith('/conversation') ||
      path.startsWith('/chat') ||
      path.startsWith('/contacts') ||
      path.startsWith('/contact-profile') ||
      path.startsWith('/contact/profile') ||
      path.startsWith('/contact-details') ||
      path.startsWith('/new-friends') ||
      path.startsWith('/add-friend') ||
      path.startsWith('/search') ||
      path.startsWith('/notifications') ||
      path.startsWith('/scan'),
  },
];

export const TAB_DEFAULT_PATHS: Record<TabId, string> = APP_TABS.reduce(
  (acc, tab) => {
    acc[tab.id] = tab.path;
    return acc;
  },
  {} as Record<TabId, string>
);

export const resolveTabByPath = (path: string): TabId => {
  const matched = TAB_ROUTE_RULES.find((rule) => rule.match(path));
  return matched?.id || 'chat';
};
