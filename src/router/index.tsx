import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { MobileLayout } from '../layouts/MobileLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../core/i18n/I18nContext';
import { normalizePathname, resolveInitialPath, resolveRouteTarget } from './navigationPolicy';
import { ROUTE_PATHS, type RoutePath, type RoutePathInput } from './paths';
import { resolveScanRouteIntent } from './scanRouteIntent';

const lazyExport = <TModule, TComponent extends React.ComponentType<any>>(
  loader: () => Promise<TModule>,
  pick: (module: TModule) => TComponent
) =>
  lazy(() =>
    loader().then((module) => ({
      default: pick(module),
    }))
  );

const scheduleIdleTask = (task: () => void): (() => void) => {
  const withWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof withWindow.requestIdleCallback === 'function') {
    const idleId = withWindow.requestIdleCallback(task, { timeout: 1500 });
    return () => withWindow.cancelIdleCallback?.(idleId);
  }

  const timer = window.setTimeout(task, 900);
  return () => window.clearTimeout(timer);
};

const prefetchCoreBundles = () => {
  void Promise.allSettled([
    import('@sdkwork/react-mobile-discover'),
    import('@sdkwork/react-mobile-skills'),
    import('@sdkwork/react-mobile-moments'),
    import('@sdkwork/react-mobile-shopping'),
    import('@sdkwork/react-mobile-order-center'),
    import('@sdkwork/react-mobile-look'),
    import('@sdkwork/react-mobile-media'),
    import('@sdkwork/react-mobile-app'),
    import('@sdkwork/react-mobile-agents'),
    import('@sdkwork/react-mobile-nearby'),
    import('@sdkwork/react-mobile-email'),
    import('@sdkwork/react-mobile-notes'),
    import('@sdkwork/react-mobile-creation'),
    import('@sdkwork/react-mobile-user'),
    import('@sdkwork/react-mobile-contacts'),
    import('@sdkwork/react-mobile-commerce'),
  ]);
};

const CreationPage = lazyExport(() => import('@sdkwork/react-mobile-creation'), (m) => m.CreationPage);
const CreationDetailPage = lazyExport(() => import('@sdkwork/react-mobile-creation'), (m) => m.CreationDetailPage);
const CreationSearchPage = lazyExport(() => import('@sdkwork/react-mobile-creation'), (m) => m.CreationSearchPage);

const LoginPage = lazyExport(() => import('@sdkwork/react-mobile-auth'), (m) => m.LoginPage);
const OAuthCallbackPage = lazyExport(() => import('@sdkwork/react-mobile-auth'), (m) => m.OAuthCallbackPage);
const RegisterPage = lazyExport(() => import('@sdkwork/react-mobile-auth'), (m) => m.RegisterPage);
const ForgotPasswordPage = lazyExport(() => import('@sdkwork/react-mobile-auth'), (m) => m.ForgotPasswordPage);

const ChatPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.ChatPage);
const ConversationListPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.ConversationListPage);
const ChatDetailsPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.ChatDetailsPage);
const ChatFilesPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.ChatFilesPage);
const GroupJoinPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.GroupJoinPage);

const MePage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MePage);
const AccountSecurityPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.AccountSecurityPage);
const ProfileInfoPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.ProfileInfoPage);
const ProfileEditPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.ProfileEditPage);
const ProfileBindingEditPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.ProfileBindingEditPage);
const MyQRCodePage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyQRCodePage);
const MyAddressPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyAddressPage);
const MyAgentsPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyAgentsPage);
const MyCreationsPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyCreationsPage);
const MyInvoiceTitlePage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyInvoiceTitlePage);
const MyActivityHistoryPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyActivityHistoryPage);
const MyUserSettingsPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyUserSettingsPage);
const VipPage = lazyExport(() => import('@sdkwork/react-mobile-vip'), (m) => m.VipPage);

const SettingsPage = lazyExport(() => import('@sdkwork/react-mobile-settings'), (m) => m.SettingsPage);
const ThemePage = lazyExport(() => import('@sdkwork/react-mobile-settings'), (m) => m.ThemePage);
const SettingsGeneralPage = lazyExport(() => import('@sdkwork/react-mobile-settings'), (m) => m.GeneralPage);
const ModelSettingsPage = lazyExport(() => import('@sdkwork/react-mobile-settings'), (m) => m.ModelSettingsPage);
const ModelConfigDetailPage = lazyExport(() => import('@sdkwork/react-mobile-settings'), (m) => m.ModelConfigDetailPage);
const ChatBackgroundPage = lazyExport(() => import('@sdkwork/react-mobile-settings'), (m) => m.ChatBackgroundPage);
const FeedbackPage = lazyExport(() => import('@sdkwork/react-mobile-settings'), (m) => m.FeedbackPage);

const ContactsPage = lazyExport(() => import('@sdkwork/react-mobile-contacts'), (m) => m.ContactsPage);
const ContactProfilePage = lazyExport(() => import('@sdkwork/react-mobile-contacts'), (m) => m.ContactProfilePage);
const NewFriendsPage = lazyExport(() => import('@sdkwork/react-mobile-contacts'), (m) => m.NewFriendsPage);
const AddFriendPage = lazyExport(() => import('@sdkwork/react-mobile-contacts'), (m) => m.AddFriendPage);
const AgentsPage = lazyExport(() => import('@sdkwork/react-mobile-agents'), (m) => m.AgentsPage);
const DiscoverPage = lazyExport(() => import('@sdkwork/react-mobile-discover'), (m) => m.DiscoverPage);
const ShakePage = lazyExport(() => import('@sdkwork/react-mobile-discover'), (m) => m.ShakePage);
const SkillsCenterPage = lazyExport(() => import('@sdkwork/react-mobile-skills'), (m) => m.SkillsCenterPage);
const SkillDetailPage = lazyExport(() => import('@sdkwork/react-mobile-skills'), (m) => m.SkillDetailPage);
const NotificationPage = lazyExport(() => import('@sdkwork/react-mobile-notification'), (m) => m.NotificationPage);
const WalletPage = lazyExport(() => import('@sdkwork/react-mobile-wallet'), (m) => m.WalletPage);
const CloudDrivePage = lazyExport(() => import('@sdkwork/react-mobile-drive'), (m) => m.CloudDrivePage);
const EmailPage = lazyExport(() => import('@sdkwork/react-mobile-email'), (m) => m.EmailPage);
const EmailThreadPage = lazyExport(() => import('@sdkwork/react-mobile-email'), (m) => m.EmailThreadPage);
const EmailComposePage = lazyExport(() => import('@sdkwork/react-mobile-email'), (m) => m.EmailComposePage);
const NotesPage = lazyExport(() => import('@sdkwork/react-mobile-notes'), (m) => m.NotesPage);
const NotesDocPage = lazyExport(() => import('@sdkwork/react-mobile-notes'), (m) => m.NotesDocPage);
const NotesCreatePage = lazyExport(() => import('@sdkwork/react-mobile-notes'), (m) => m.NotesCreatePage);
const NearbyPage = lazyExport(() => import('@sdkwork/react-mobile-nearby'), (m) => m.NearbyPage);
const VideosPage = lazyExport(() => import('@sdkwork/react-mobile-video'), (m) => m.VideosPage);
const ShoppingPage = lazyExport(() => import('@sdkwork/react-mobile-shopping'), (m) => m.ShoppingPage);
const OrderCenterPage = lazyExport(() => import('@sdkwork/react-mobile-order-center'), (m) => m.OrderCenterPage);
const LookPage = lazyExport(() => import('@sdkwork/react-mobile-look'), (m) => m.LookPage);
const MediaCenterPage = lazyExport(() => import('@sdkwork/react-mobile-media'), (m) => m.MediaCenterPage);
const AppCenterPage = lazyExport(() => import('@sdkwork/react-mobile-app'), (m) => m.AppCenterPage);
const SearchPage = lazyExport(() => import('@sdkwork/react-mobile-search'), (m) => m.SearchPage);
const ScanPage = lazyExport(() => import('@sdkwork/react-mobile-tools'), (m) => m.ScanPage);
const FavoritesPage = lazyExport(() => import('@sdkwork/react-mobile-social'), (m) => m.FavoritesPage);
const MomentsPage = lazyExport(() => import('@sdkwork/react-mobile-moments'), (m) => m.MomentsPage);
const ArticlesPage = lazyExport(() => import('@sdkwork/react-mobile-content'), (m) => m.ArticlesPage);
const CallsPage = lazyExport(() => import('@sdkwork/react-mobile-communication'), (m) => m.CallsPage);
const AppointmentsPage = lazyExport(() => import('@sdkwork/react-mobile-appointments'), (m) => m.AppointmentsPage);
const CategoryPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.CategoryPage);
const CommerceProductDetailPage = lazyExport(
  () => import('@sdkwork/react-mobile-commerce'),
  (m) => m.ProductDetailPage
);
const ShoppingCartPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.ShoppingCartPage);
const OrderConfirmationPage = lazyExport(
  () => import('@sdkwork/react-mobile-commerce'),
  (m) => m.OrderConfirmationPage
);
const OrderListPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.OrderListPage);
const OrderDetailPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.OrderDetailPage);
const GigCenterPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.GigCenterPage);
const MyGigsPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.MyGigsPage);
const DistributionCenterPage = lazyExport(
  () => import('@sdkwork/react-mobile-commerce'),
  (m) => m.DistributionCenterPage
);
const DistributionGoodsPage = lazyExport(
  () => import('@sdkwork/react-mobile-commerce'),
  (m) => m.DistributionGoodsPage
);
const MyTeamPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.MyTeamPage);
const CommissionPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.CommissionPage);
const DistributionRankPage = lazyExport(
  () => import('@sdkwork/react-mobile-commerce'),
  (m) => m.DistributionRankPage
);
const WithdrawPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.WithdrawPage);
const SharePosterPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.SharePosterPage);

const Redirect: React.FC<{ to: RoutePathInput }> = ({ to }) => {
  useEffect(() => {
    navigate(to);
  }, [to]);
  return null;
};

interface RouteConfig {
  component: React.ComponentType<any> | React.LazyExoticComponent<React.ComponentType<any>>;
  useLayout?: boolean;
  public?: boolean;
  showTabbar?: boolean;
}

const AGENT_TO_CHAT_AGENT_ID: Record<string, string> = {
  agent_gpt4: 'omni_core',
  agent_claude: 'agent_writer',
  agent_dalle: 'agent_image',
  agent_coder: 'agent_coder',
  agent_translator: 'agent_english',
};

const resolveChatAgentId = (agentId: string) => {
  const normalized = (agentId || '').trim();
  if (!normalized) return 'omni_core';
  return AGENT_TO_CHAT_AGENT_ID[normalized] || normalized;
};

const openAgentConversation = async (agentId: string) => {
  const { chatService, DEFAULT_AGENT_ID } = await import('@sdkwork/react-mobile-chat');
  const chatAgentId = resolveChatAgentId(agentId);

  const createResult = await chatService.createSession(chatAgentId).catch(() => null);
  const createdSessionId = createResult?.data?.id;
  if (createResult?.success && createdSessionId) {
    navigate(ROUTE_PATHS.chat, { id: createdSessionId });
    return;
  }

  const listResult = await chatService.getSessionList().catch(() => null);
  const sessions = Array.isArray(listResult?.data) ? listResult.data : [];
  const matchedSessionId = sessions.find((item: any) => item?.agentId === chatAgentId)?.id;
  const latestSessionId = sessions[0]?.id;

  if (matchedSessionId || latestSessionId) {
    navigate(ROUTE_PATHS.chat, { id: matchedSessionId || latestSessionId });
    return;
  }

  const fallbackCreate = await chatService.createSession(DEFAULT_AGENT_ID).catch(() => null);
  const fallbackSessionId = fallbackCreate?.data?.id;

  if (fallbackSessionId) {
    navigate(ROUTE_PATHS.chat, { id: fallbackSessionId });
    return;
  }

  navigate(ROUTE_PATHS.conversationList);
};

const routes: Record<RoutePath, RouteConfig> = {
  [ROUTE_PATHS.login]: { component: LoginPage, useLayout: false, public: true },
  [ROUTE_PATHS.register]: { component: RegisterPage, useLayout: false, public: true },
  [ROUTE_PATHS.forgotPassword]: { component: ForgotPasswordPage, useLayout: false, public: true },
  [ROUTE_PATHS.authCallback]: { component: OAuthCallbackPage, useLayout: false, public: true },

  [ROUTE_PATHS.root]: { component: ConversationListPage, showTabbar: true },
  [ROUTE_PATHS.contacts]: { component: ContactsPage, showTabbar: true },
  [ROUTE_PATHS.discover]: { component: DiscoverPage, showTabbar: true },
  [ROUTE_PATHS.me]: { component: MePage, showTabbar: true },

  [ROUTE_PATHS.chat]: { component: ChatPage },
  [ROUTE_PATHS.conversationList]: { component: ConversationListPage, showTabbar: true },
  [ROUTE_PATHS.chatDetails]: { component: ChatDetailsPage },
  [ROUTE_PATHS.chatFiles]: { component: ChatFilesPage },

  [ROUTE_PATHS.agents]: { component: AgentsPage, showTabbar: true },
  [ROUTE_PATHS.agentDetails]: { component: () => <Redirect to={ROUTE_PATHS.agents} /> },
  [ROUTE_PATHS.agentStore]: { component: () => <Redirect to={ROUTE_PATHS.agents} /> },

  [ROUTE_PATHS.contactProfile]: { component: ContactProfilePage },
  [ROUTE_PATHS.newFriends]: { component: NewFriendsPage },
  [ROUTE_PATHS.addFriend]: { component: AddFriendPage },

  [ROUTE_PATHS.moments]: { component: MomentsPage },
  [ROUTE_PATHS.video]: { component: VideosPage },
  [ROUTE_PATHS.videoDetails]: { component: VideosPage },
  [ROUTE_PATHS.shake]: { component: ShakePage },
  [ROUTE_PATHS.app]: { component: AppCenterPage },
  [ROUTE_PATHS.skills]: { component: SkillsCenterPage },
  [ROUTE_PATHS.skillDetail]: { component: SkillDetailPage },

  [ROUTE_PATHS.accountSecurity]: { component: AccountSecurityPage },
  [ROUTE_PATHS.profileInfo]: { component: ProfileInfoPage },
  [ROUTE_PATHS.profileEdit]: { component: ProfileEditPage },
  [ROUTE_PATHS.profileBinding]: { component: ProfileBindingEditPage },
  [ROUTE_PATHS.myQRCode]: { component: MyQRCodePage },
  [ROUTE_PATHS.myAddress]: { component: MyAddressPage },
  [ROUTE_PATHS.myAgents]: { component: MyAgentsPage },
  [ROUTE_PATHS.myCreations]: { component: MyCreationsPage },
  [ROUTE_PATHS.myInvoice]: { component: MyInvoiceTitlePage },
  [ROUTE_PATHS.myActivityHistory]: { component: MyActivityHistoryPage },
  [ROUTE_PATHS.myUserSettings]: { component: MyUserSettingsPage },
  [ROUTE_PATHS.vip]: { component: VipPage },

  [ROUTE_PATHS.settings]: { component: SettingsPage },
  [ROUTE_PATHS.theme]: { component: ThemePage },
  [ROUTE_PATHS.chatBackground]: { component: ChatBackgroundPage },
  [ROUTE_PATHS.settingsBackground]: { component: () => <Redirect to={ROUTE_PATHS.chatBackground} /> },
  [ROUTE_PATHS.general]: { component: SettingsGeneralPage },
  [ROUTE_PATHS.modelSettings]: { component: ModelSettingsPage },
  [ROUTE_PATHS.modelConfig]: { component: ModelConfigDetailPage },
  [ROUTE_PATHS.feedback]: { component: FeedbackPage },

  [ROUTE_PATHS.notifications]: { component: NotificationPage },

  [ROUTE_PATHS.wallet]: { component: WalletPage },

  [ROUTE_PATHS.drive]: { component: CloudDrivePage },
  [ROUTE_PATHS.email]: { component: EmailPage },
  [ROUTE_PATHS.emailThread]: { component: EmailThreadPage },
  [ROUTE_PATHS.emailCompose]: { component: EmailComposePage },
  [ROUTE_PATHS.notes]: { component: NotesPage },
  [ROUTE_PATHS.notesDoc]: { component: NotesDocPage },
  [ROUTE_PATHS.notesCreate]: { component: NotesCreatePage },
  [ROUTE_PATHS.nearby]: { component: NearbyPage },

  [ROUTE_PATHS.search]: { component: SearchPage },
  [ROUTE_PATHS.scan]: { component: ScanPage, useLayout: false },
  [ROUTE_PATHS.joinGroup]: { component: GroupJoinPage },

  [ROUTE_PATHS.creation]: { component: CreationPage, showTabbar: true },
  [ROUTE_PATHS.creationDetail]: { component: CreationDetailPage },
  [ROUTE_PATHS.creationSearch]: { component: CreationSearchPage },

  [ROUTE_PATHS.shopping]: { component: ShoppingPage },
  [ROUTE_PATHS.category]: { component: CategoryPage },
  [ROUTE_PATHS.product]: { component: CommerceProductDetailPage },
  [ROUTE_PATHS.shoppingCart]: { component: ShoppingCartPage },
  [ROUTE_PATHS.orderConfirmation]: { component: OrderConfirmationPage },
  [ROUTE_PATHS.orders]: { component: OrderListPage },
  [ROUTE_PATHS.orderDetail]: { component: OrderDetailPage },
  [ROUTE_PATHS.orderCenter]: { component: OrderCenterPage },
  [ROUTE_PATHS.gigCenter]: { component: GigCenterPage },
  [ROUTE_PATHS.myGigs]: { component: MyGigsPage },
  [ROUTE_PATHS.distribution]: { component: DistributionCenterPage },
  [ROUTE_PATHS.distributionGoods]: { component: DistributionGoodsPage },
  [ROUTE_PATHS.myTeam]: { component: MyTeamPage },
  [ROUTE_PATHS.commission]: { component: CommissionPage },
  [ROUTE_PATHS.distributionRank]: { component: DistributionRankPage },
  [ROUTE_PATHS.withdraw]: { component: WithdrawPage },
  [ROUTE_PATHS.sharePoster]: { component: SharePosterPage },

  [ROUTE_PATHS.appointments]: { component: AppointmentsPage },
  [ROUTE_PATHS.appointmentsDetail]: { component: AppointmentsPage },

  [ROUTE_PATHS.groupDetails]: { component: ConversationListPage },
  [ROUTE_PATHS.favorites]: { component: FavoritesPage },

  [ROUTE_PATHS.content]: { component: ArticlesPage },
  [ROUTE_PATHS.look]: { component: LookPage },
  [ROUTE_PATHS.media]: { component: MediaCenterPage },
  [ROUTE_PATHS.articleDetail]: { component: ArticlesPage },

  [ROUTE_PATHS.communication]: { component: CallsPage },
};
const routeExists = (path: string): path is RoutePath => Object.prototype.hasOwnProperty.call(routes, path);
const SETTINGS_STORAGE_KEY = 'sys_app_config_v3';
const SETTINGS_CONFIG_ID = 'sys_global_config';
const ROUTER_HISTORY_INDEX_KEY = '__sdkwork_route_index';

const readGlobalChatBackgroundFromStorage = (): string => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return '';
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    if (!Array.isArray(parsed)) return '';
    const config = parsed.find((item) => item?.id === SETTINGS_CONFIG_ID);
    return typeof config?.chatBackground === 'string' ? config.chatBackground : '';
  } catch {
    return '';
  }
};

const decodeUnicodeEscapes = (value: string): string =>
  value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)));

const normalizeRouteParamValue = (value: string): string => {
  let normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) return '';

  if (/%[0-9a-fA-F]{2}/.test(normalized)) {
    try {
      normalized = decodeURIComponent(normalized.replace(/\+/g, '%20'));
    } catch {
      // Keep original value when URL decoding fails.
    }
  }

  if (/\\u[0-9a-fA-F]{4}/.test(normalized)) {
    normalized = decodeUnicodeEscapes(normalized);
  }

  return normalized.replace(/[\u0000-\u001F\u007F]/g, '').trim();
};

const normalizeRouteParams = (params: Record<string, string>): Record<string, string> =>
  Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = normalizeRouteParamValue(value);
    return acc;
  }, {});

const resolveBackTarget = (value: string | undefined): RoutePathInput | null => {
  const normalized = (value || '').trim();
  if (!normalized || !normalized.startsWith(ROUTE_PATHS.root)) {
    return null;
  }

  const queryIndex = normalized.indexOf('?');
  const rawPath = queryIndex >= 0 ? normalized.slice(0, queryIndex) : normalized;
  const rawQuery = queryIndex >= 0 ? normalized.slice(queryIndex + 1) : '';
  const target = resolveRouteTarget({ rawPath, routeExists });
  if (!target.ok) {
    return null;
  }
  const targetPath = target.path as RoutePath;
  return rawQuery ? `${targetPath}?${rawQuery}` : targetPath;
};

const readHistoryIndex = (state: unknown): number | null => {
  if (!state || typeof state !== 'object') return null;
  const rawValue = (state as Record<string, unknown>)[ROUTER_HISTORY_INDEX_KEY];
  if (typeof rawValue !== 'number' || !Number.isFinite(rawValue) || rawValue < 0) {
    return null;
  }
  return Math.trunc(rawValue);
};

const withHistoryIndex = (state: unknown, index: number): Record<string, unknown> => {
  const baseState = state && typeof state === 'object'
    ? (state as Record<string, unknown>)
    : {};
  return {
    ...baseState,
    [ROUTER_HISTORY_INDEX_KEY]: index,
  };
};

const ensureHistoryIndex = (): number => {
  const existingIndex = readHistoryIndex(window.history.state);
  if (existingIndex !== null) {
    return existingIndex;
  }
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(withHistoryIndex(window.history.state, 0), '', currentUrl);
  return 0;
};

let currentPath: RoutePath = resolveInitialPath({
  rawPath: window.location.pathname,
  fallbackPath: ROUTE_PATHS.root,
  routeExists,
}) as RoutePath;
let currentParams: Record<string, string> = {};
const listeners = new Set<() => void>();
ensureHistoryIndex();

const dispatchRouteChange = () => {
  window.dispatchEvent(new CustomEvent('routechange', {
    detail: { path: currentPath, params: currentParams },
  }));
};

export const navigate = (path: RoutePathInput, params?: Record<string, string>) => {
  let targetPath = path;
  if (!targetPath) return;
  if (!targetPath.startsWith(ROUTE_PATHS.root)) targetPath = `/${targetPath}` as RoutePathInput;

  let nextParams: Record<string, string>;
  if (targetPath.includes('?')) {
    const [basePath, queryString] = targetPath.split('?');
    const searchParams = new URLSearchParams(queryString);
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    nextParams = normalizeRouteParams({ ...queryParams, ...(params || {}) });
    targetPath = basePath as RoutePathInput;
  } else {
    nextParams = normalizeRouteParams(params || {});
  }
  const targetRoute = resolveRouteTarget({
    rawPath: targetPath,
    routeExists,
  });
  if (!targetRoute.ok) {
    console.warn(`[Router] Blocked navigation to unknown route: ${targetRoute.path}`);
    return;
  }
  const resolvedPath = targetRoute.path as RoutePath;
  const currentHistoryIndex = ensureHistoryIndex();
  currentParams = nextParams;

  const query = Object.keys(currentParams).length > 0
    ? `?${new URLSearchParams(currentParams).toString()}`
    : '';

  const nextUrl = resolvedPath + query;
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  if (nextUrl === currentUrl) {
    currentPath = resolvedPath;
    listeners.forEach((listener) => listener());
    dispatchRouteChange();
    return;
  }

  window.history.pushState(withHistoryIndex(window.history.state, currentHistoryIndex + 1), '', nextUrl);
  currentPath = resolvedPath;
  listeners.forEach((listener) => listener());
  dispatchRouteChange();
};

export const getCurrentParams = () => currentParams;

export const navigateBack = (fallbackPath: RoutePathInput = ROUTE_PATHS.root) => {
  const currentHistoryIndex = readHistoryIndex(window.history.state);
  if (currentHistoryIndex !== null && currentHistoryIndex > 0) {
    window.history.back();
    return;
  }
  navigate(fallbackPath);
};

type ExternalRouteParams = Record<string, unknown>;

interface ExternalTargetResolution {
  ok: boolean;
  rawPath: string;
  normalizedPath: string;
  path?: RoutePath;
  query?: string;
}

const normalizeExternalParams = (params?: ExternalRouteParams): Record<string, string> | undefined => {
  if (!params) return undefined;
  const normalized = Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === null || value === undefined) return acc;
    acc[key] = typeof value === 'string' ? value : String(value);
    return acc;
  }, {});
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const resolveExternalTarget = (rawPath: string): ExternalTargetResolution => {
  const raw = (rawPath || '').trim();
  if (!raw) {
    return { ok: false, rawPath: rawPath || '', normalizedPath: ROUTE_PATHS.root };
  }
  const queryIndex = raw.indexOf('?');
  const rawPathPart = queryIndex >= 0 ? raw.slice(0, queryIndex) : raw;
  const rawQueryPart = queryIndex >= 0 ? raw.slice(queryIndex + 1) : '';
  const normalizedPath = normalizePathname(rawPathPart);
  const target = resolveRouteTarget({ rawPath: normalizedPath, routeExists });
  if (!target.ok) {
    return { ok: false, rawPath: raw, normalizedPath: target.path };
  }
  const normalizedQuery = rawQueryPart.split('#')[0].trim();
  return {
    ok: true,
    rawPath: raw,
    normalizedPath: target.path,
    path: target.path as RoutePath,
    query: normalizedQuery,
  };
};

const navigateExternal = (
  rawPath: string,
  params?: ExternalRouteParams,
  fallbackPath: RoutePathInput = ROUTE_PATHS.root,
  source = 'external'
) => {
  const normalizedParams = normalizeExternalParams(params);
  const target = resolveExternalTarget(rawPath);
  if (!target.ok || !target.path) {
    console.warn(
      `[Router] Blocked ${source} navigation to unknown route: ${target.normalizedPath}. Fallback: ${fallbackPath}`
    );
    navigate(fallbackPath, normalizedParams);
    return;
  }
  const routeInput: RoutePathInput = target.query ? `${target.path}?${target.query}` : target.path;
  navigate(routeInput, normalizedParams);
};

export const useQueryParams = () => {
  const [params, setParams] = React.useState(new URLSearchParams(window.location.search));
  React.useEffect(() => {
    const handleLocationChange = () => {
      setParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('routechange', handleLocationChange as EventListener);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('routechange', handleLocationChange as EventListener);
    };
  }, []);
  return params;
};

const GENERAL_SOURCES = ['settings', 'discover', 'me', 'favorites', 'contacts'] as const;
type GeneralSource = (typeof GENERAL_SOURCES)[number];

const resolveGeneralSource = (value: string | undefined): GeneralSource => {
  if (!value) return 'settings';
  return GENERAL_SOURCES.includes(value as GeneralSource) ? (value as GeneralSource) : 'settings';
};

const resolveGeneralFallback = (source: GeneralSource): RoutePath => {
  if (source === 'discover') return ROUTE_PATHS.discover;
  if (source === 'me') return ROUTE_PATHS.me;
  if (source === 'favorites') return ROUTE_PATHS.favorites;
  if (source === 'contacts') return ROUTE_PATHS.contacts;
  return ROUTE_PATHS.settings;
};

type ProfileEditField = 'name' | 'region' | 'signature' | 'password';
const PROFILE_EDIT_FIELDS: ProfileEditField[] = ['name', 'region', 'signature', 'password'];

const resolveProfileEditField = (value: string | undefined): ProfileEditField => {
  if (!value) return 'name';
  return PROFILE_EDIT_FIELDS.includes(value as ProfileEditField) ? (value as ProfileEditField) : 'name';
};

type ProfileBindingField = 'phone' | 'email' | 'wechat' | 'qq';
const PROFILE_BINDING_FIELDS: ProfileBindingField[] = ['phone', 'email', 'wechat', 'qq'];

const resolveProfileBindingField = (value: string | undefined): ProfileBindingField => {
  if (!value) return 'email';
  return PROFILE_BINDING_FIELDS.includes(value as ProfileBindingField) ? (value as ProfileBindingField) : 'email';
};

const resolveAccountCenterFallback = (value: string | undefined): RoutePath => {
  if (value === 'account-security') return ROUTE_PATHS.accountSecurity;
  if (value === 'me') return ROUTE_PATHS.me;
  return ROUTE_PATHS.profileInfo;
};

type ProfileSource = 'account-security' | 'me' | 'profile-info';
const resolveProfileSource = (value: string | undefined): ProfileSource => {
  if (value === 'account-security') return 'account-security';
  if (value === 'me') return 'me';
  return 'profile-info';
};

const buildRouteProps = (
  path: RoutePath,
  t: (key: string) => string,
  logout?: () => Promise<void>,
  setLocale?: (locale: 'zh-CN' | 'en-US') => void,
  locale?: 'zh-CN' | 'en-US'
) => {
  const commonAuthProps = {
    t,
    locale,
    onLoginSuccess: () => navigate(ROUTE_PATHS.root),
    onForgotPasswordClick: () => navigate(ROUTE_PATHS.forgotPassword),
    onRegisterClick: () => navigate(ROUTE_PATHS.register),
    onLoginClick: () => navigate(ROUTE_PATHS.login),
    onRegisterSuccess: () => navigate(ROUTE_PATHS.login),
    onBackToLogin: () => navigate(ROUTE_PATHS.login),
  };

  const sessionId = currentParams.id || 'session_default';
  const highlightMsgId = currentParams.msgId || currentParams.messageId;
  const mode = currentParams.mode === 'select' ? 'select' : 'view';
  const action = currentParams.action === 'forward' || currentParams.action === 'create_group'
    ? currentParams.action
    : undefined;
  const generalSection = currentParams.section || 'general';
  const generalTitle = currentParams.title || t('settings.general') || 'General';
  const generalSource = resolveGeneralSource(currentParams.from);
  const generalFallback = resolveGeneralFallback(generalSource);
  const modelDomain = currentParams.domain || 'text';
  const modelTitle = currentParams.title || t('settings.model_config.title') || 'Model Configuration';
  const accountCenterFallback = resolveAccountCenterFallback(currentParams.from);
  const profileSource = resolveProfileSource(currentParams.from);
  const profileBackTarget = accountCenterFallback === ROUTE_PATHS.accountSecurity
    ? ROUTE_PATHS.accountSecurity
    : ROUTE_PATHS.me;

  if (path === ROUTE_PATHS.authCallback) {
    return {
      ...commonAuthProps,
      onSuccess: () => navigate(ROUTE_PATHS.root),
    };
  }

  if (path === ROUTE_PATHS.chat) {
    return {
      ...commonAuthProps,
      sessionId,
      globalBackground: readGlobalChatBackgroundFromStorage(),
      highlightMsgId,
      onBack: () => navigateBack(ROUTE_PATHS.conversationList),
      onDetails: () => navigate(ROUTE_PATHS.chatDetails, { id: sessionId }),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.chat, 'chat-page'),
    };
  }

  if (path === ROUTE_PATHS.chatDetails) {
    return {
      ...commonAuthProps,
      sessionId,
      onBack: () => navigateBack(ROUTE_PATHS.chat),
      onNavigateToFiles: () => navigate(ROUTE_PATHS.chatFiles, { id: sessionId }),
      onNavigateToSearch: () => navigate(ROUTE_PATHS.search, { sessionId }),
      onNavigateToGroupJoin: () => navigate(ROUTE_PATHS.joinGroup, {
        from: 'chat-details',
        sessionId,
      }),
      onNavigateToQRCode: (payload: { type: 'user' | 'group' | 'agent'; entityId?: string; name?: string }) =>
        navigate(ROUTE_PATHS.myQRCode, {
          from: 'chat-details',
          type: payload.type,
          entityId: payload.entityId || '',
          name: payload.name || '',
          sessionId,
        }),
      onNavigateToBackground: () => navigate(ROUTE_PATHS.chatBackground, {
        id: sessionId,
        back: `${ROUTE_PATHS.chatDetails}?id=${sessionId}`,
      }),
      onDeleteSession: () => navigate(ROUTE_PATHS.conversationList),
    };
  }

  if (path === ROUTE_PATHS.chatFiles) {
    return {
      ...commonAuthProps,
      sessionId,
      onBack: () => navigateBack(ROUTE_PATHS.chatDetails),
    };
  }

  if (path === ROUTE_PATHS.root || path === ROUTE_PATHS.conversationList) {
    return {
      ...commonAuthProps,
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.conversationList, 'chat-list'),
      onChatClick: (targetSessionId: string) => navigate(ROUTE_PATHS.chat, { id: targetSessionId }),
      showBack: false,
    };
  }

  if (path === ROUTE_PATHS.contacts) {
    return {
      ...commonAuthProps,
      mode,
      action,
      onBack: () => navigateBack(ROUTE_PATHS.root),
      onContactClick: (contact: { id: string }) => navigate(ROUTE_PATHS.contactProfile, { id: contact.id }),
      onNewFriendsClick: () => navigate(ROUTE_PATHS.newFriends),
      onGroupsClick: () => navigate(ROUTE_PATHS.conversationList),
      onAgentsClick: () => navigate(ROUTE_PATHS.agents),
      onSearchClick: () => navigate(ROUTE_PATHS.search),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.contacts, 'contacts'),
      onConfirmSelection: () => navigateBack(ROUTE_PATHS.root),
    };
  }

  if (path === ROUTE_PATHS.agents) {
    const scannedAgent = currentParams.scanType === 'agent'
      ? {
        id: currentParams.scanId || undefined,
        name: currentParams.scanName || undefined,
      }
      : undefined;

    return {
      ...commonAuthProps,
      showBack: false,
      onAgentClick: async (agentId: string) => {
        try {
          await openAgentConversation(agentId);
        } catch (error) {
          console.error('[Router] Failed to open agent conversation:', error);
          navigate(ROUTE_PATHS.conversationList);
        }
      },
      scannedAgent,
      onOpenScannedAgent: async (agentId: string) => {
        try {
          await openAgentConversation(agentId);
        } catch (error) {
          console.error('[Router] Failed to open scanned agent conversation:', error);
          navigate(ROUTE_PATHS.conversationList);
        }
      },
      onSearchClick: () => navigate(ROUTE_PATHS.search),
      onCreateAgentClick: () => navigate(ROUTE_PATHS.creation),
    };
  }

  if (path === ROUTE_PATHS.discover) {
    const navigateFromDiscover = (rawPath: string, params?: ExternalRouteParams) => {
      const target = resolveExternalTarget(rawPath);
      if (!target.ok || !target.path) {
        navigateExternal(rawPath, params, ROUTE_PATHS.discover, 'discover');
        return;
      }
      if (target.path.startsWith(ROUTE_PATHS.general)) {
        const mergedParams = { ...(params || {}), from: 'discover' };
        const routeInput: RoutePathInput = target.query ? `${target.path}?${target.query}` : target.path;
        navigate(routeInput, normalizeExternalParams(mergedParams));
        return;
      }
      const routeInput: RoutePathInput = target.query ? `${target.path}?${target.query}` : target.path;
      navigate(routeInput, normalizeExternalParams(params));
    };

    return {
      ...commonAuthProps,
      onNavigate: navigateFromDiscover,
      onItemClick: (rawPath: string) => {
        navigateFromDiscover(rawPath);
      },
    };
  }

  if (path === ROUTE_PATHS.shake) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
    };
  }

  if (path === ROUTE_PATHS.skills) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.skills, 'skills'),
      onSkillClick: (item: { id: string; type: 'package' | 'skill' }) => {
        navigate(ROUTE_PATHS.skillDetail, {
          id: item.id,
          kind: item.type,
        });
      },
    };
  }

  if (path === ROUTE_PATHS.skillDetail) {
    const skillType = currentParams.kind === 'package' ? 'package' : 'skill';
    return {
      ...commonAuthProps,
      skillId: currentParams.id,
      skillType,
      onBack: () => navigateBack(ROUTE_PATHS.skills),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.skills, 'skill-detail'),
    };
  }

  if (path === ROUTE_PATHS.video || path === ROUTE_PATHS.videoDetails) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onVideoClick: (video: { id: string }) => {
        if (path === ROUTE_PATHS.videoDetails) return;
        navigate(ROUTE_PATHS.videoDetails, { id: video.id });
      },
    };
  }

  if (path === ROUTE_PATHS.moments) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onProfileClick: async (author: string) => {
        try {
          const { contactsService } = await import('@sdkwork/react-mobile-contacts');
          const contact = await contactsService.findByName(author);
          if (contact?.id) {
            navigate(ROUTE_PATHS.contactProfile, { id: contact.id });
            return;
          }
          navigate(ROUTE_PATHS.profileInfo);
        } catch (error) {
          console.error('[Router] Failed to open profile from moments:', error);
          navigate(ROUTE_PATHS.profileInfo);
        }
      },
    };
  }

  if (path === ROUTE_PATHS.me) {
    return {
      ...commonAuthProps,
      onProfileClick: () => navigate(ROUTE_PATHS.profileInfo, { from: 'me' }),
      onActivityHistoryClick: () => navigate(ROUTE_PATHS.myActivityHistory, { from: 'me' }),
      onQRCodeClick: () => navigate(ROUTE_PATHS.myQRCode, { from: 'me' }),
      onVipClick: () => navigate(ROUTE_PATHS.vip),
      onWalletClick: () => navigate(ROUTE_PATHS.wallet),
      onDistributionClick: () => navigate(ROUTE_PATHS.distribution),
      onGigsClick: () => navigate(ROUTE_PATHS.myGigs),
      onCreationsClick: () => navigate(ROUTE_PATHS.myCreations),
      onAgentsClick: () => navigate(ROUTE_PATHS.myAgents),
      onCartClick: () => navigate(ROUTE_PATHS.shoppingCart),
      onFavoritesClick: () => navigate(ROUTE_PATHS.favorites),
      onCardsClick: () => navigate(ROUTE_PATHS.general, {
        section: 'cards',
        title: t('settings.cards.title') || t('me.cards') || 'Cards',
        from: 'me',
      }),
      onOrdersClick: () => navigate(ROUTE_PATHS.orders),
      onAppointmentsClick: () => navigate(ROUTE_PATHS.appointments),
      onSettingsClick: () => navigate(ROUTE_PATHS.settings),
    };
  }

  if (path === ROUTE_PATHS.accountSecurity) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.settings),
      onProfileInfoClick: () => navigate(ROUTE_PATHS.profileInfo, { from: 'account-security' }),
      onQRCodeClick: () => navigate(ROUTE_PATHS.myQRCode, { from: 'account-security' }),
      onPasswordClick: () => navigate(ROUTE_PATHS.profileEdit, { from: 'account-security', field: 'password' }),
      onPhoneClick: () => navigate(ROUTE_PATHS.profileBinding, { from: 'account-security', field: 'phone' }),
      onEmailClick: () => navigate(ROUTE_PATHS.profileBinding, { from: 'account-security', field: 'email' }),
      onWechatClick: () => navigate(ROUTE_PATHS.profileBinding, { from: 'account-security', field: 'wechat' }),
      onQqClick: () => navigate(ROUTE_PATHS.profileBinding, { from: 'account-security', field: 'qq' }),
      onActivityHistoryClick: () => navigate(ROUTE_PATHS.myActivityHistory, { from: 'account-security' }),
      onUserSettingsClick: () => navigate(ROUTE_PATHS.myUserSettings, { from: 'account-security' }),
      onAddressClick: () => navigate(ROUTE_PATHS.myAddress, { from: 'account-security' }),
      onInvoiceClick: () => navigate(ROUTE_PATHS.myInvoice, { from: 'account-security' }),
    };
  }

  if (path === ROUTE_PATHS.profileInfo) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(profileBackTarget),
      onEditNameClick: () => navigate(ROUTE_PATHS.profileEdit, {
        from: 'profile-info',
        field: 'name',
        profileFrom: profileSource,
      }),
      onEditRegionClick: () => navigate(ROUTE_PATHS.profileEdit, {
        from: 'profile-info',
        field: 'region',
        profileFrom: profileSource,
      }),
      onEditSignatureClick: () => navigate(ROUTE_PATHS.profileEdit, {
        from: 'profile-info',
        field: 'signature',
        profileFrom: profileSource,
      }),
      onEditPasswordClick: () => navigate(ROUTE_PATHS.profileEdit, {
        from: 'profile-info',
        field: 'password',
        profileFrom: profileSource,
      }),
      onEditPhoneClick: () => navigate(ROUTE_PATHS.profileBinding, {
        from: 'profile-info',
        field: 'phone',
        profileFrom: profileSource,
      }),
      onEditEmailClick: () => navigate(ROUTE_PATHS.profileBinding, {
        from: 'profile-info',
        field: 'email',
        profileFrom: profileSource,
      }),
      onEditWechatClick: () => navigate(ROUTE_PATHS.profileBinding, {
        from: 'profile-info',
        field: 'wechat',
        profileFrom: profileSource,
      }),
      onEditQqClick: () => navigate(ROUTE_PATHS.profileBinding, {
        from: 'profile-info',
        field: 'qq',
        profileFrom: profileSource,
      }),
      onQRCodeClick: () => navigate(ROUTE_PATHS.myQRCode, { from: profileSource }),
      onActivityHistoryClick: () => navigate(ROUTE_PATHS.myActivityHistory, { from: profileSource }),
      onUserSettingsClick: () => navigate(ROUTE_PATHS.myUserSettings, { from: profileSource }),
      onAddressClick: () => navigate(ROUTE_PATHS.myAddress, { from: profileSource }),
      onInvoiceClick: () => navigate(ROUTE_PATHS.myInvoice, { from: profileSource }),
    };
  }

  if (path === ROUTE_PATHS.profileEdit) {
    const profileEditSource = currentParams.from === 'account-security' ? 'account-security' : 'profile-info';
    const profileInfoFrom = resolveProfileSource(currentParams.profileFrom);
    const profileInfoBackTarget: RoutePathInput = `${ROUTE_PATHS.profileInfo}?from=${profileInfoFrom}`;
    const profileEditBackTarget: RoutePathInput = profileEditSource === 'account-security'
      ? ROUTE_PATHS.accountSecurity
      : profileInfoBackTarget;

    return {
      ...commonAuthProps,
      field: resolveProfileEditField(currentParams.field),
      onBack: () => navigateBack(profileEditBackTarget),
    };
  }

  if (path === ROUTE_PATHS.profileBinding) {
    const profileBindingSource = currentParams.from === 'account-security' ? 'account-security' : 'profile-info';
    const profileInfoFrom = resolveProfileSource(currentParams.profileFrom);
    const profileInfoBackTarget: RoutePathInput = `${ROUTE_PATHS.profileInfo}?from=${profileInfoFrom}`;
    const profileBindingBackTarget: RoutePathInput = profileBindingSource === 'account-security'
      ? ROUTE_PATHS.accountSecurity
      : profileInfoBackTarget;

    return {
      ...commonAuthProps,
      field: resolveProfileBindingField(currentParams.field),
      onBack: () => navigateBack(profileBindingBackTarget),
    };
  }

  if (path === ROUTE_PATHS.vip) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
    };
  }

  if (path === ROUTE_PATHS.contactProfile) {
    return {
      ...commonAuthProps,
      contactId: currentParams.id || '',
      onBack: () => navigateBack(ROUTE_PATHS.contacts),
      onSendMessage: async (_contact: { id: string }) => {
        try {
          await openAgentConversation('omni_core');
        } catch (error) {
          console.error('[Router] Failed to open contact conversation:', error);
          navigate(ROUTE_PATHS.conversationList);
        }
      },
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.contactProfile, 'contact-profile'),
    };
  }

  if (path === ROUTE_PATHS.newFriends) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.contacts),
      onAddFriend: () => navigate(ROUTE_PATHS.addFriend),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.newFriends, 'new-friends'),
    };
  }

  if (path === ROUTE_PATHS.addFriend) {
    const scannedType = currentParams.scanType === 'user' ? 'user' : '';
    const scannedUserId = (currentParams.scanId || currentParams.userId || '').trim();
    const scannedUserName = (currentParams.scanName || currentParams.name || '').trim();
    const scannedUser = scannedType === 'user' && (scannedUserId || scannedUserName)
      ? {
        id: scannedUserId || undefined,
        name: scannedUserName || undefined,
      }
      : undefined;

    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.newFriends),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.addFriend, 'add-friend'),
      onSearchClick: () => navigate(ROUTE_PATHS.search, { from: 'add-friend' }),
      scannedUser,
      onQuickAddScannedUser: (payload: { id?: string; name?: string }) => {
        const targetId = (payload?.id || '').trim();
        if (targetId) {
          navigate(ROUTE_PATHS.contactProfile, { id: targetId });
          return;
        }
        navigate(ROUTE_PATHS.newFriends);
      },
    };
  }

  if (path === ROUTE_PATHS.myQRCode) {
    const qrCodeFrom = (currentParams.from || '').trim();
    const qrCodeSessionId = (currentParams.sessionId || '').trim();
    const qrCodeFallback = qrCodeFrom === 'account-security'
      ? ROUTE_PATHS.accountSecurity
      : qrCodeFrom === 'profile-info'
        ? ROUTE_PATHS.profileInfo
        : qrCodeFrom === 'chat-details' && qrCodeSessionId
          ? `${ROUTE_PATHS.chatDetails}?id=${qrCodeSessionId}`
          : ROUTE_PATHS.me;
    const qrCodeType = currentParams.type === 'group'
      ? 'group'
      : currentParams.type === 'agent'
        ? 'agent'
        : 'user';
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(qrCodeFallback),
      type: qrCodeType,
      name: currentParams.name || undefined,
      entityId: currentParams.entityId || currentParams.id || undefined,
    };
  }

  if (
    path === ROUTE_PATHS.myActivityHistory
    || path === ROUTE_PATHS.myUserSettings
    || path === ROUTE_PATHS.myAddress
    || path === ROUTE_PATHS.myInvoice
  ) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(accountCenterFallback),
    };
  }

  if (path === ROUTE_PATHS.myCreations) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
      onCreationClick: (id: string) => navigate(ROUTE_PATHS.creationDetail, { id }),
    };
  }

  if (path === ROUTE_PATHS.myAgents) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
      onCreateAgent: () => navigate(ROUTE_PATHS.creation),
      onChatWithAgent: async (agentId: string) => {
        try {
          await openAgentConversation(agentId);
        } catch (error) {
          console.error('[Router] Failed to open my-agent conversation:', error);
          navigate(ROUTE_PATHS.conversationList);
        }
      },
    };
  }

  if (path === ROUTE_PATHS.settings) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
      onAccountClick: () => navigate(ROUTE_PATHS.accountSecurity),
      onModelSettingsClick: () => navigate(ROUTE_PATHS.modelSettings),
      onNotificationsClick: () => navigate(ROUTE_PATHS.general, {
        section: 'notifications',
        title: t('settings.notifications') || 'Notifications',
        from: 'settings',
      }),
      onThemeClick: () => navigate(ROUTE_PATHS.theme),
      onGeneralClick: () => navigate(ROUTE_PATHS.general, {
        section: 'general',
        title: t('settings.general') || 'General',
        from: 'settings',
      }),
      onLanguageClick: () => navigate(ROUTE_PATHS.general, {
        section: 'general',
        title: t('settings.general') || 'General',
        from: 'settings',
      }),
      onStorageClick: () => navigate(ROUTE_PATHS.general, {
        section: 'storage',
        title: t('settings.storage') || 'Storage',
        from: 'settings',
      }),
      onFeedbackClick: () => navigate(ROUTE_PATHS.feedback),
      onAboutClick: () => navigate(ROUTE_PATHS.general, {
        section: 'about',
        title: t('settings.about') || 'About OpenChat',
        from: 'settings',
      }),
      onLogout: async () => {
        await logout?.();
        navigate(ROUTE_PATHS.login);
      },
    };
  }

  if (path === ROUTE_PATHS.theme) {
    const explicitBackTarget = resolveBackTarget(currentParams.back);
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(explicitBackTarget || ROUTE_PATHS.settings),
    };
  }

  if (path === ROUTE_PATHS.feedback) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.settings),
    };
  }

  if (path === ROUTE_PATHS.general) {
    const generalBackQuery = new URLSearchParams({
      section: generalSection,
      title: generalTitle,
      from: generalSource,
    }).toString();

    return {
      ...commonAuthProps,
      section: generalSection,
      title: generalTitle,
      source: generalSource,
      detailTitle: currentParams.detailTitle,
      detailContent: currentParams.detailContent,
      detailType: currentParams.detailType,
      detailSource: currentParams.detailSource,
      detailTime: currentParams.detailTime,
      onSetLocale: setLocale,
      onBack: () => navigateBack(generalFallback),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) => {
        const target = resolveExternalTarget(rawPath);
        if (!target.ok || !target.path) {
          navigateExternal(rawPath, params, generalFallback, 'settings-general');
          return;
        }
        if (target.path === ROUTE_PATHS.settingsBackground) {
          navigate(ROUTE_PATHS.chatBackground, {
            ...normalizeExternalParams(params),
            section: generalSection,
            from: generalSource,
            title: generalTitle,
            back: `${ROUTE_PATHS.general}?${generalBackQuery}`,
          });
          return;
        }
        if (target.path === ROUTE_PATHS.general) {
          const mergedParams = { ...(params || {}), from: (params?.from as string) || generalSource };
          const routeInput: RoutePathInput = target.query ? `${target.path}?${target.query}` : target.path;
          navigate(routeInput, normalizeExternalParams(mergedParams));
          return;
        }
        const routeInput: RoutePathInput = target.query ? `${target.path}?${target.query}` : target.path;
        navigate(routeInput, normalizeExternalParams(params));
      },
    };
  }

  if (path === ROUTE_PATHS.chatBackground) {
    const targetSessionId = (currentParams.id || '').trim() || undefined;
    const explicitBackTarget = resolveBackTarget(currentParams.back);
    const fallbackQuery = new URLSearchParams({
      section: currentParams.section || 'general',
      title: currentParams.title || t('settings.general') || 'General',
      from: resolveGeneralSource(currentParams.from),
    }).toString();

    return {
      ...commonAuthProps,
      sessionId: targetSessionId,
      loadSessionBackground: async (targetSessionId: string) => {
        const { chatService } = await import('@sdkwork/react-mobile-chat');
        const sessionListResult = await chatService.getSessionList().catch(() => null);
        const sessionList = sessionListResult?.success ? sessionListResult.data || [] : [];
        return sessionList.find((item) => item.id === targetSessionId)?.sessionConfig?.backgroundImage || '';
      },
      saveSessionBackground: async (targetSessionId: string, background: string) => {
        const { chatService } = await import('@sdkwork/react-mobile-chat');
        await chatService.updateSessionConfig(targetSessionId, {
          backgroundImage: background || undefined,
        });
      },
      onBack: () => navigateBack(explicitBackTarget || `${ROUTE_PATHS.general}?${fallbackQuery}`),
    };
  }

  if (path === ROUTE_PATHS.modelSettings) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.settings),
      onModelDetail: (domain: string, title: string) => navigate(ROUTE_PATHS.modelConfig, { domain, title }),
    };
  }

  if (path === ROUTE_PATHS.modelConfig) {
    return {
      ...commonAuthProps,
      domain: modelDomain,
      title: modelTitle,
      onBack: () => navigateBack(ROUTE_PATHS.modelSettings),
    };
  }

  if (path === ROUTE_PATHS.search) {
    const searchCancelFallback: RoutePathInput = currentParams.sessionId
      ? `${ROUTE_PATHS.chatDetails}?id=${currentParams.sessionId}`
      : (currentParams.from === 'add-friend' ? ROUTE_PATHS.addFriend : ROUTE_PATHS.root);

    return {
      ...commonAuthProps,
      onCancel: () => navigateBack(searchCancelFallback),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.search, 'search'),
      onResultClick: (result: { type: string }) => {
        if (result.type === 'contact') {
          navigate(ROUTE_PATHS.contacts);
          return;
        }
        if (result.type === 'moment') {
          navigate(ROUTE_PATHS.moments);
          return;
        }
        if (result.type === 'favorite') {
          navigate(ROUTE_PATHS.favorites);
          return;
        }
        navigate(ROUTE_PATHS.conversationList);
      },
    };
  }

  if (path === ROUTE_PATHS.content || path === ROUTE_PATHS.articleDetail || path === ROUTE_PATHS.look) {
    return {
      ...commonAuthProps,
      articleId: currentParams.id,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onArticleClick: (id: string) => navigate(ROUTE_PATHS.articleDetail, { id }),
    };
  }

  if (path === ROUTE_PATHS.creation) {
    return {
      ...commonAuthProps,
      onSearchClick: () => navigate(ROUTE_PATHS.creationSearch),
      onDetailClick: (id: string) => navigate(ROUTE_PATHS.creationDetail, { id }),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.creation, 'creation'),
    };
  }

  if (path === ROUTE_PATHS.creationSearch) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.creation),
      onDetailClick: (id: string) => navigate(ROUTE_PATHS.creationDetail, { id }),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.creationSearch, 'creation-search'),
    };
  }

  if (path === ROUTE_PATHS.creationDetail) {
    return {
      ...commonAuthProps,
      id: currentParams.id,
      onBack: () => navigateBack(ROUTE_PATHS.creation),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.creationDetail, 'creation-detail'),
    };
  }

  if (path === ROUTE_PATHS.wallet) {
    const walletServiceTitleMap: Record<string, string> = {
      pay: t('wallet.pay'),
      credit_card: t('wallet.services.credit_card'),
      top_up: t('wallet.services.top_up'),
      wealth: t('wallet.services.wealth'),
      utilities: t('wallet.services.utilities'),
      qb: t('wallet.services.qb'),
      city: t('wallet.services.city'),
      orders: t('wallet.services.orders'),
      charity: t('wallet.services.charity'),
    };

    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
      onMoreClick: () => navigate(ROUTE_PATHS.general, {
        section: 'generic',
        title: t('wallet.title') || 'Wallet',
        from: 'me',
      }),
      onServiceClick: (service: string) => {
        if (service === 'orders') {
          navigate(ROUTE_PATHS.orders);
          return;
        }

        if (service === 'pay') {
          navigate(ROUTE_PATHS.scan);
          return;
        }

        navigate(ROUTE_PATHS.general, {
          section: 'generic',
          title: walletServiceTitleMap[service] || service,
          from: 'me',
        });
      },
    };
  }

  if (path === ROUTE_PATHS.drive) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
    };
  }

  if (path === ROUTE_PATHS.email) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onCompose: () => navigate(ROUTE_PATHS.emailCompose),
      onThreadClick: (threadId: string) => navigate(ROUTE_PATHS.emailThread, { id: threadId }),
    };
  }

  if (path === ROUTE_PATHS.emailThread) {
    const threadId = (currentParams.id || '').trim();
    const entrySource = (currentParams.source || '').trim();
    return {
      ...commonAuthProps,
      threadId,
      entrySource: entrySource || undefined,
      onBack: () => navigateBack(ROUTE_PATHS.email),
      onReply: (nextThreadId: string) =>
        navigate(ROUTE_PATHS.emailCompose, { id: (nextThreadId || threadId || '').trim() }),
    };
  }

  if (path === ROUTE_PATHS.emailCompose) {
    const draftFromThreadId = (currentParams.id || '').trim();
    return {
      ...commonAuthProps,
      draftFromThreadId: draftFromThreadId || undefined,
      onBack: () => navigateBack(ROUTE_PATHS.email),
      onSend: (draftId: string) => navigate(ROUTE_PATHS.emailThread, {
        id: draftId || 'mail-compose-new',
        source: draftFromThreadId ? 'reply' : 'compose',
      }),
    };
  }

  if (path === ROUTE_PATHS.notes) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onCreate: () => navigate(ROUTE_PATHS.notesCreate),
      onOpenDoc: (docId: string) => navigate(ROUTE_PATHS.notesDoc, { id: docId }),
    };
  }

  if (path === ROUTE_PATHS.notesDoc) {
    const docId = (currentParams.id || '').trim();
    const entrySource = (currentParams.source || '').trim();
    return {
      ...commonAuthProps,
      docId: docId || undefined,
      entrySource: entrySource || undefined,
      onBack: () => navigateBack(ROUTE_PATHS.notes),
      onEdit: (nextDocId: string) => navigate(ROUTE_PATHS.notesCreate, { id: nextDocId || docId || '' }),
    };
  }

  if (path === ROUTE_PATHS.notesCreate) {
    const templateDocId = (currentParams.id || '').trim();
    return {
      ...commonAuthProps,
      templateDocId: templateDocId || undefined,
      onBack: () => navigateBack(ROUTE_PATHS.notes),
      onCreated: (docId: string) => navigate(ROUTE_PATHS.notesDoc, {
        id: docId || templateDocId || 'doc-new',
        source: templateDocId ? 'edit' : 'create',
      }),
    };
  }

  if (path === ROUTE_PATHS.nearby) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
    };
  }

  if (path === ROUTE_PATHS.app) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onOpenApp: (appType: string) => {
        navigate(ROUTE_PATHS.general, {
          section: 'generic',
          title: t('discover.miniapp') || 'App Center',
          detailTitle: appType,
          from: 'discover',
        });
      },
      onOpenSite: (siteId: string) => {
        navigate(ROUTE_PATHS.general, {
          section: 'generic',
          title: t('discover.miniapp') || 'App Center',
          detailTitle: siteId,
          from: 'discover',
        });
      },
    };
  }

  if (path === ROUTE_PATHS.appointments || path === ROUTE_PATHS.appointmentsDetail) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
    };
  }

  if (path === ROUTE_PATHS.shopping) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onProductClick: (productId: string) => navigate(ROUTE_PATHS.product, { id: productId }),
      onCartClick: () => navigate(ROUTE_PATHS.shoppingCart),
      onCategoryClick: () => navigate(ROUTE_PATHS.category),
    };
  }

  if (path === ROUTE_PATHS.category) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.shopping),
      onProductClick: (productId: string) => navigate(ROUTE_PATHS.product, { id: productId }),
      onSearchClick: () => navigate(ROUTE_PATHS.shopping),
    };
  }

  if (path === ROUTE_PATHS.product) {
    return {
      ...commonAuthProps,
      productId: currentParams.id,
      onBack: () => navigateBack(ROUTE_PATHS.shopping),
      onCartClick: () => navigate(ROUTE_PATHS.shoppingCart),
      onBuyNow: (_productId: string) => navigate(ROUTE_PATHS.orderConfirmation),
    };
  }

  if (path === ROUTE_PATHS.shoppingCart) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
      onCheckout: () => navigate(ROUTE_PATHS.orderConfirmation),
      onProductClick: (productId: string) => navigate(ROUTE_PATHS.product, { id: productId }),
      onContinueShopping: () => navigate(ROUTE_PATHS.shopping),
    };
  }

  if (path === ROUTE_PATHS.orderConfirmation) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.shoppingCart),
      onOrderCreated: (orderId: string) => navigate(ROUTE_PATHS.orderDetail, { id: orderId }),
    };
  }

  if (path === ROUTE_PATHS.orders) {
    const orderStatusCandidates = [
      'pending_payment',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
      'refunding',
      'refunded',
    ] as const;
    const statusValue = currentParams.status;
    const initialStatus = orderStatusCandidates.includes(statusValue as (typeof orderStatusCandidates)[number])
      ? (statusValue as (typeof orderStatusCandidates)[number])
      : undefined;
    return {
      ...commonAuthProps,
      initialStatus,
      onBack: () => navigateBack(ROUTE_PATHS.me),
      onOrderClick: (orderId: string) => navigate(ROUTE_PATHS.orderDetail, { id: orderId }),
    };
  }

  if (path === ROUTE_PATHS.orderDetail) {
    return {
      ...commonAuthProps,
      orderId: currentParams.id,
      onBack: () => navigateBack(ROUTE_PATHS.orders),
    };
  }

  if (path === ROUTE_PATHS.gigCenter || path === ROUTE_PATHS.orderCenter) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onGigClick: (_gigId: string) => navigate(ROUTE_PATHS.myGigs),
    };
  }

  if (path === ROUTE_PATHS.myGigs) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
    };
  }

  if (path === ROUTE_PATHS.distribution) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
      onNavigate: (rawPath: string, params?: ExternalRouteParams) =>
        navigateExternal(rawPath, params, ROUTE_PATHS.distribution, 'distribution'),
    };
  }

  if (path === ROUTE_PATHS.distributionGoods) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.distribution),
    };
  }

  if (path === ROUTE_PATHS.myTeam) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.distribution),
    };
  }

  if (path === ROUTE_PATHS.commission) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.distribution),
    };
  }

  if (path === ROUTE_PATHS.distributionRank) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.distribution),
    };
  }

  if (path === ROUTE_PATHS.withdraw) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.distribution),
    };
  }

  if (path === ROUTE_PATHS.sharePoster) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.distribution),
    };
  }

  if (path === ROUTE_PATHS.notifications) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.root),
      onNotificationClick: (notification: { type: string }) => {
        if (notification.type === 'chat') {
          navigate(ROUTE_PATHS.conversationList);
          return;
        }
        if (notification.type === 'social') {
          navigate(ROUTE_PATHS.moments);
          return;
        }
        if (notification.type === 'commerce') {
          navigate(ROUTE_PATHS.orders);
          return;
        }
        navigate(ROUTE_PATHS.discover);
      },
    };
  }

  if (path === ROUTE_PATHS.favorites) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.me),
      onItemClick: (item: any) =>
        navigate(ROUTE_PATHS.general, {
          section: 'favorite-detail',
          title: t('settings.favorite_detail_title') || 'Favorite Detail',
          detailTitle: item?.title || t('settings.favorite_detail_default_title') || 'Favorite Content',
          detailContent: item?.content || item?.url || '',
          detailType: item?.type || '',
          detailSource: item?.source || t('settings.favorite_source_default') || 'My Favorites',
          detailTime: item?.createTime ? new Date(item.createTime).toLocaleString() : '',
          from: 'favorites',
        }),
    };
  }

  if (path === ROUTE_PATHS.communication) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
    };
  }

  if (path === ROUTE_PATHS.scan) {
    const inlineQrResult = (currentParams.qr || '').trim();
    const shouldBootstrapFromQuery = Boolean(
      currentParams.type
      || currentParams.id
      || currentParams.entity
      || currentParams.target
      || currentParams.kind
      || currentParams.userId
      || currentParams.groupId
      || currentParams.agentId
      || currentParams.v
      || currentParams.version
      || currentParams.qrType
      || currentParams.qrId
    );
    const initialScanResult = inlineQrResult || (
      shouldBootstrapFromQuery
        ? `${window.location.origin}${ROUTE_PATHS.scan}?${new URLSearchParams(currentParams).toString()}`
        : undefined
    );

    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      initialScanResult,
      onScanResult: (result: string) => {
        const intent = resolveScanRouteIntent(result);

        if (intent.type === 'user') {
          navigate(ROUTE_PATHS.addFriend, {
            from: 'scan',
            scanType: 'user',
            scanId: intent.id || '',
            scanName: intent.name || '',
            qr: result,
          });
          return;
        }

        if (intent.type === 'agent') {
          navigate(ROUTE_PATHS.agents, {
            from: 'scan',
            scanType: 'agent',
            scanId: intent.id || '',
            scanName: intent.name || '',
            qr: result,
          });
          return;
        }

        navigate(ROUTE_PATHS.joinGroup, {
          from: 'scan',
          scanType: intent.type === 'group' ? 'group' : 'unknown',
          groupId: intent.id || '',
          groupName: intent.name || '',
          qr: result,
        });
      },
    };
  }

  if (path === ROUTE_PATHS.joinGroup) {
    const joinSource = currentParams.from === 'scan' ? 'scan' : 'chat-details';
    const joinSessionId = (currentParams.sessionId || '').trim();
    const joinBackTarget: RoutePathInput = joinSource === 'scan'
      ? ROUTE_PATHS.scan
      : (joinSessionId ? `${ROUTE_PATHS.chatDetails}?id=${joinSessionId}` : ROUTE_PATHS.conversationList);

    return {
      ...commonAuthProps,
      source: joinSource,
      sessionId: joinSessionId || undefined,
      scanGroupId: currentParams.groupId || undefined,
      scanGroupName: currentParams.groupName || undefined,
      scanResult: currentParams.qr || undefined,
      onBack: () => navigateBack(joinBackTarget),
    };
  }

  if (path === ROUTE_PATHS.media) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack(ROUTE_PATHS.discover),
      onOpenChannel: (channelId: string) => {
        navigate(ROUTE_PATHS.general, {
          section: 'generic',
          title: t('discover.listen') || 'Media Center',
          detailTitle: channelId,
          from: 'discover',
        });
      },
    };
  }

  return commonAuthProps;
};

export const Router: React.FC = () => {
  const [locationState, setLocationState] = useState(() => ({
    path: currentPath,
    search: window.location.search,
  }));
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { t, setLocale, locale } = useTranslation();

  useEffect(() => {
    const syncRouteState = () => {
      const rawPath = normalizePathname(window.location.pathname);
      const safePath = resolveInitialPath({
        rawPath,
        fallbackPath: ROUTE_PATHS.root,
        routeExists,
      });
      if (safePath !== rawPath) {
        const replacementUrl = `${safePath}${window.location.search || ''}`;
        const currentHistoryIndex = readHistoryIndex(window.history.state) ?? 0;
        window.history.replaceState(withHistoryIndex(window.history.state, currentHistoryIndex), '', replacementUrl);
      }
      currentPath = safePath as RoutePath;
      const searchParams = new URLSearchParams(window.location.search);
      const queryParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      currentParams = normalizeRouteParams(queryParams);
      const nextSearch = window.location.search;
      setLocationState((prev) => {
        if (prev.path === currentPath && prev.search === nextSearch) {
          return prev;
        }
        return { path: currentPath, search: nextSearch };
      });
    };

    const handlePopState = () => {
      syncRouteState();
      dispatchRouteChange();
    };

    const listener = () => {
      syncRouteState();
    };
    listeners.add(listener);

    window.addEventListener('popstate', handlePopState);

    syncRouteState();

    return () => {
      window.removeEventListener('popstate', handlePopState);
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cancel = scheduleIdleTask(() => {
      if (cancelled) return;
      prefetchCoreBundles();
    });
    return () => {
      cancelled = true;
      cancel();
    };
  }, []);

  const path = locationState.path;
  const route = routes[path];
  if (!route) {
    console.warn(`[Router] No route config found for path: ${path}, redirecting to root`);
    return <Redirect to={ROUTE_PATHS.root} />;
  }
  const Component = route.component;
  const shouldShowTabbar = useMemo(() => {
    if (path === ROUTE_PATHS.contacts && currentParams.mode === 'select') {
      return false;
    }
    return !!route.showTabbar;
  }, [path, route.showTabbar, locationState.search]);
  const disableLayoutBottomSafeArea = path === ROUTE_PATHS.chat;
  const routeProps = useMemo(
    () => buildRouteProps(path, t, logout, setLocale, locale),
    [path, locationState.search, t, logout, setLocale, locale]
  );
  const pageProps = useMemo(
    () => (shouldShowTabbar ? { ...routeProps, showBack: false } : routeProps),
    [shouldShowTabbar, routeProps]
  );

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'var(--bg-body)',
          color: 'var(--text-secondary)',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!route.public && !isAuthenticated) {
    return <Redirect to={ROUTE_PATHS.login} />;
  }

  if (route.public && isAuthenticated && (path === ROUTE_PATHS.login || path === ROUTE_PATHS.register || path === ROUTE_PATHS.forgotPassword)) {
    return <Redirect to={ROUTE_PATHS.root} />;
  }

  const content = (
    <Suspense
      fallback={(
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'var(--bg-body)',
          }}
        >
          <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
      )}
    >
      <Component {...pageProps} />
    </Suspense>
  );

  if (route.useLayout !== false) {
    return (
      <MobileLayout showTabbar={shouldShowTabbar} disableBottomSafeArea={disableLayoutBottomSafeArea}>
        {content}
      </MobileLayout>
    );
  }

  return content;
};

export default Router;
