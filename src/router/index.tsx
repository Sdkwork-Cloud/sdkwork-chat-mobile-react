import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { MobileLayout } from '../layouts/MobileLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../core/i18n/I18nContext';

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
    import('@sdkwork/react-mobile-agents'),
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
const RegisterPage = lazyExport(() => import('@sdkwork/react-mobile-auth'), (m) => m.RegisterPage);
const ForgotPasswordPage = lazyExport(() => import('@sdkwork/react-mobile-auth'), (m) => m.ForgotPasswordPage);

const ChatPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.ChatPage);
const ConversationListPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.ConversationListPage);
const ChatDetailsPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.ChatDetailsPage);
const ChatFilesPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.ChatFilesPage);

const MePage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MePage);
const ProfileInfoPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.ProfileInfoPage);
const MyQRCodePage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyQRCodePage);
const MyAddressPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyAddressPage);
const MyAgentsPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyAgentsPage);
const MyCreationsPage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyCreationsPage);
const MyInvoiceTitlePage = lazyExport(() => import('@sdkwork/react-mobile-user'), (m) => m.MyInvoiceTitlePage);

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
const NotificationPage = lazyExport(() => import('@sdkwork/react-mobile-notification'), (m) => m.NotificationPage);
const WalletPage = lazyExport(() => import('@sdkwork/react-mobile-wallet'), (m) => m.WalletPage);
const CloudDrivePage = lazyExport(() => import('@sdkwork/react-mobile-drive'), (m) => m.CloudDrivePage);
const VideosPage = lazyExport(() => import('@sdkwork/react-mobile-video'), (m) => m.VideosPage);
const SearchPage = lazyExport(() => import('@sdkwork/react-mobile-search'), (m) => m.SearchPage);
const ScanPage = lazyExport(() => import('@sdkwork/react-mobile-tools'), (m) => m.ScanPage);
const FavoritesPage = lazyExport(() => import('@sdkwork/react-mobile-social'), (m) => m.FavoritesPage);
const MomentsPage = lazyExport(() => import('@sdkwork/react-mobile-social'), (m) => m.MomentsPage);
const ArticlesPage = lazyExport(() => import('@sdkwork/react-mobile-content'), (m) => m.ArticlesPage);
const CallsPage = lazyExport(() => import('@sdkwork/react-mobile-communication'), (m) => m.CallsPage);
const AppointmentsPage = lazyExport(() => import('@sdkwork/react-mobile-appointments'), (m) => m.AppointmentsPage);
const MallPage = lazyExport(() => import('@sdkwork/react-mobile-commerce'), (m) => m.MallPage);
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

const Redirect: React.FC<{ to: string }> = ({ to }) => {
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
    navigate('/chat', { id: createdSessionId });
    return;
  }

  const listResult = await chatService.getSessionList().catch(() => null);
  const sessions = Array.isArray(listResult?.data) ? listResult.data : [];
  const matchedSessionId = sessions.find((item: any) => item?.agentId === chatAgentId)?.id;
  const latestSessionId = sessions[0]?.id;

  if (matchedSessionId || latestSessionId) {
    navigate('/chat', { id: matchedSessionId || latestSessionId });
    return;
  }

  const fallbackCreate = await chatService.createSession(DEFAULT_AGENT_ID).catch(() => null);
  const fallbackSessionId = fallbackCreate?.data?.id;

  if (fallbackSessionId) {
    navigate('/chat', { id: fallbackSessionId });
    return;
  }

  navigate('/conversation-list');
};

const routes: Record<string, RouteConfig> = {
  '/login': { component: LoginPage, useLayout: false, public: true },
  '/register': { component: RegisterPage, useLayout: false, public: true },
  '/forgot-password': { component: ForgotPasswordPage, useLayout: false, public: true },

  '/': { component: ConversationListPage, showTabbar: true },
  '/contacts': { component: ContactsPage },
  '/discover': { component: DiscoverPage, showTabbar: true },
  '/me': { component: MePage, showTabbar: true },

  '/chat': { component: ChatPage },
  '/conversation-list': { component: ConversationListPage, showTabbar: true },
  '/chat-list': { component: () => <Redirect to="/conversation-list" />, showTabbar: true },
  '/chat-details': { component: ChatDetailsPage },
  '/chat-files': { component: ChatFilesPage },

  '/agents': { component: AgentsPage, showTabbar: true },
  '/agent-details': { component: () => <Redirect to="/agents" /> },
  '/agent-store': { component: () => <Redirect to="/agents" /> },

  '/contact-details': { component: ContactProfilePage },
  '/contact-profile': { component: ContactProfilePage },
  '/contact/profile': { component: ContactProfilePage },
  '/new-friends': { component: NewFriendsPage },
  '/contacts/new-friends': { component: NewFriendsPage },
  '/add-friend': { component: AddFriendPage },
  '/contacts/add-friend': { component: AddFriendPage },

  '/moments': { component: MomentsPage },
  '/channels': { component: VideosPage },
  '/shake': { component: ShakePage },

  '/profile-info': { component: ProfileInfoPage },
  '/profile/self': { component: ProfileInfoPage },
  '/my-qrcode': { component: MyQRCodePage },
  '/profile/qrcode': { component: MyQRCodePage },
  '/my-address': { component: MyAddressPage },
  '/my-agents': { component: MyAgentsPage },
  '/my-creations': { component: MyCreationsPage },
  '/my-invoice': { component: MyInvoiceTitlePage },
  '/profile/invoice': { component: MyInvoiceTitlePage },

  '/settings': { component: SettingsPage },
  '/theme': { component: ThemePage },
  '/chat-background': { component: ChatBackgroundPage },
  '/general': { component: SettingsGeneralPage },
  '/model-settings': { component: ModelSettingsPage },
  '/model-config': { component: ModelConfigDetailPage },
  '/feedback': { component: FeedbackPage },

  '/notifications': { component: NotificationPage },

  '/wallet': { component: WalletPage },
  '/wallet-details': { component: WalletPage },

  '/drive': { component: CloudDrivePage },
  '/cloud-drive': { component: CloudDrivePage },
  '/drive-files': { component: CloudDrivePage },

  '/video': { component: VideosPage },
  '/video-channel': { component: VideosPage },
  '/video-details': { component: VideosPage },

  '/search': { component: SearchPage },
  '/scan': { component: ScanPage },

  '/creation': { component: CreationPage, showTabbar: true },
  '/creation/detail': { component: CreationDetailPage },
  '/creation/search': { component: CreationSearchPage },
  '/creation-detail': { component: CreationDetailPage },
  '/creation-search': { component: CreationSearchPage },
  '/creation-editor': { component: CreationPage },

  '/commerce': { component: MallPage },
  '/commerce/mall': { component: MallPage },
  '/mall': { component: MallPage },
  '/shop': { component: MallPage },
  '/category': { component: CategoryPage },
  '/commerce/category': { component: CategoryPage },
  '/mall-product': { component: CommerceProductDetailPage },
  '/product': { component: CommerceProductDetailPage },
  '/commerce/product': { component: CommerceProductDetailPage },
  '/commerce/item': { component: CommerceProductDetailPage },
  '/shopping-cart': { component: ShoppingCartPage },
  '/commerce/cart': { component: ShoppingCartPage },
  '/order-confirmation': { component: OrderConfirmationPage },
  '/commerce/checkout': { component: OrderConfirmationPage },
  '/orders': { component: OrderListPage },
  '/order-detail': { component: OrderDetailPage },
  '/orders/detail': { component: OrderDetailPage },
  '/gig-center': { component: GigCenterPage },
  '/my-gigs': { component: MyGigsPage },
  '/discover/gigs': { component: GigCenterPage },
  '/distribution': { component: DistributionCenterPage },
  '/commerce/distribution': { component: DistributionCenterPage },
  '/distribution-goods': { component: DistributionGoodsPage },
  '/commerce/distribution/goods': { component: DistributionGoodsPage },
  '/my-team': { component: MyTeamPage },
  '/commerce/distribution/team': { component: MyTeamPage },
  '/commission': { component: CommissionPage },
  '/commerce/distribution/commission': { component: CommissionPage },
  '/distribution-rank': { component: DistributionRankPage },
  '/commerce/distribution/rank': { component: DistributionRankPage },
  '/withdraw': { component: WithdrawPage },
  '/commerce/distribution/withdraw': { component: WithdrawPage },
  '/share-poster': { component: SharePosterPage },
  '/commerce/distribution/poster': { component: SharePosterPage },

  '/appointments': { component: AppointmentsPage },
  '/appointment-detail': { component: AppointmentsPage },
  '/appointment-booking': { component: AppointmentsPage },
  '/appointments/detail': { component: AppointmentsPage },

  '/social': { component: MomentsPage },
  '/group-details': { component: ConversationListPage },
  '/favorites': { component: FavoritesPage },

  '/content': { component: ArticlesPage },
  '/content-details': { component: ArticlesPage },
  '/article': { component: ArticlesPage },
  '/article/detail': { component: ArticlesPage },

  '/communication': { component: CallsPage },
  '/call': { component: CallsPage },
  '/video-call': { component: CallsPage },
};

const normalizePathname = (value: string): string => {
  const trimmed = (value || '').trim();
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const withoutHash = withLeadingSlash.split('#')[0] || '/';
  const compact = withoutHash.replace(/\/{2,}/g, '/');
  if (compact.length <= 1) return '/';
  return compact.replace(/\/+$/, '');
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

let currentPath = normalizePathname(window.location.pathname);
let currentParams: Record<string, string> = {};
const listeners = new Set<() => void>();

const dispatchRouteChange = () => {
  window.dispatchEvent(new CustomEvent('routechange', {
    detail: { path: currentPath, params: currentParams },
  }));
};

export const navigate = (path: string, params?: Record<string, string>) => {
  if (!path) return;
  if (!path.startsWith('/')) path = `/${path}`;

  if (path.includes('?')) {
    const [basePath, queryString] = path.split('?');
    const searchParams = new URLSearchParams(queryString);
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    currentParams = normalizeRouteParams({ ...queryParams, ...(params || {}) });
    path = basePath;
  } else {
    currentParams = normalizeRouteParams(params || {});
  }
  path = normalizePathname(path);

  const query = Object.keys(currentParams).length > 0
    ? `?${new URLSearchParams(currentParams).toString()}`
    : '';

  const nextUrl = path + query;
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  if (nextUrl === currentUrl) {
    currentPath = path;
    listeners.forEach((listener) => listener());
    dispatchRouteChange();
    return;
  }

  window.history.pushState({}, '', nextUrl);
  currentPath = path;
  listeners.forEach((listener) => listener());
  dispatchRouteChange();
};

export const getCurrentParams = () => currentParams;

export const navigateBack = (fallbackPath: string = '/') => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigate(fallbackPath);
  }
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

const resolveGeneralFallback = (source: GeneralSource): string => {
  if (source === 'discover') return '/discover';
  if (source === 'me') return '/me';
  if (source === 'favorites') return '/favorites';
  if (source === 'contacts') return '/contacts';
  return '/settings';
};

const buildRouteProps = (
  path: string,
  t: (key: string) => string,
  logout?: () => Promise<void>,
  setLocale?: (locale: 'zh-CN' | 'en-US') => void
) => {
  const commonAuthProps = {
    t,
    onLoginSuccess: () => navigate('/'),
    onForgotPasswordClick: () => navigate('/forgot-password'),
    onRegisterClick: () => navigate('/register'),
    onLoginClick: () => navigate('/login'),
    onRegisterSuccess: () => navigate('/login'),
    onBackToLogin: () => navigate('/login'),
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

  if (path === '/chat') {
    return {
      ...commonAuthProps,
      sessionId,
      highlightMsgId,
      onBack: () => navigateBack('/conversation-list'),
      onDetails: () => navigate('/chat-details', { id: sessionId }),
      onNavigate: navigate,
    };
  }

  if (path === '/chat-details') {
    return {
      ...commonAuthProps,
      sessionId,
      onBack: () => navigateBack('/chat'),
      onNavigateToFiles: () => navigate('/chat-files', { id: sessionId }),
      onNavigateToSearch: () => navigate('/search', { sessionId }),
      onNavigateToBackground: () => navigate('/chat-background', { id: sessionId }),
      onDeleteSession: () => navigate('/conversation-list'),
    };
  }

  if (path === '/chat-files') {
    return {
      ...commonAuthProps,
      sessionId,
      onBack: () => navigateBack('/chat-details'),
    };
  }

  if (path === '/' || path === '/conversation-list' || path === '/chat-list') {
    return {
      ...commonAuthProps,
      onNavigate: navigate,
      onChatClick: (targetSessionId: string) => navigate('/chat', { id: targetSessionId }),
      showBack: false,
    };
  }

  if (path === '/contacts') {
    return {
      ...commonAuthProps,
      mode,
      action,
      onBack: () => navigateBack('/'),
      onContactClick: (contact: { id: string }) => navigate('/contact-profile', { id: contact.id }),
      onNewFriendsClick: () => navigate('/new-friends'),
      onGroupsClick: () => navigate('/conversation-list'),
      onAgentsClick: () => navigate('/agents'),
      onSearchClick: () => navigate('/search'),
      onNavigate: navigate,
      onConfirmSelection: () => navigateBack('/'),
    };
  }

  if (path === '/agents') {
    return {
      ...commonAuthProps,
      showBack: false,
      onAgentClick: async (agentId: string) => {
        try {
          await openAgentConversation(agentId);
        } catch (error) {
          console.error('[Router] Failed to open agent conversation:', error);
          navigate('/conversation-list');
        }
      },
      onSearchClick: () => navigate('/search'),
      onCreateAgentClick: () => navigate('/creation'),
    };
  }

  if (path === '/discover') {
    const navigateFromDiscover = (targetPath: string, params?: Record<string, string>) => {
      if (!targetPath) return;
      if (targetPath.startsWith('/general')) {
        navigate(targetPath, { from: 'discover', ...(params || {}) });
        return;
      }
      navigate(targetPath, params);
    };

    return {
      ...commonAuthProps,
      onNavigate: navigateFromDiscover,
      onItemClick: (targetPath: string) => {
        navigateFromDiscover(targetPath);
      },
    };
  }

  if (path === '/shake') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/discover'),
    };
  }

  if (['/video', '/video-channel', '/video-details', '/channels'].includes(path)) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/discover'),
      onVideoClick: (video: { id: string }) => {
        if (path === '/video-details') return;
        navigate('/video-details', { id: video.id });
      },
    };
  }

  if (path === '/moments' || path === '/social') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/discover'),
      onProfileClick: async (author: string) => {
        try {
          const { contactsService } = await import('@sdkwork/react-mobile-contacts');
          const contact = await contactsService.findByName(author);
          if (contact?.id) {
            navigate('/contact-profile', { id: contact.id });
            return;
          }
          navigate('/profile/self');
        } catch (error) {
          console.error('[Router] Failed to open profile from moments:', error);
          navigate('/profile/self');
        }
      },
    };
  }

  if (path === '/me') {
    return {
      ...commonAuthProps,
      onProfileClick: () => navigate('/profile-info'),
      onQRCodeClick: () => navigate('/my-qrcode'),
      onWalletClick: () => navigate('/wallet'),
      onDistributionClick: () => navigate('/distribution'),
      onGigsClick: () => navigate('/my-gigs'),
      onCreationsClick: () => navigate('/my-creations'),
      onAgentsClick: () => navigate('/my-agents'),
      onMomentsClick: () => navigate('/moments'),
      onCartClick: () => navigate('/shopping-cart'),
      onFavoritesClick: () => navigate('/favorites'),
      onCardsClick: () => navigate('/general', {
        section: 'cards',
        title: t('settings.cards.title') || t('me.cards') || 'Cards',
        from: 'me',
      }),
      onOrdersClick: () => navigate('/orders'),
      onAppointmentsClick: () => navigate('/appointments'),
      onSettingsClick: () => navigate('/settings'),
    };
  }

  if (path === '/profile-info' || path === '/profile/self') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
      onQRCodeClick: () => navigate('/my-qrcode'),
      onAddressClick: () => navigate('/my-address'),
      onInvoiceClick: () => navigate('/my-invoice'),
    };
  }

  if (path === '/contact-profile' || path === '/contact/profile' || path === '/contact-details') {
    return {
      ...commonAuthProps,
      contactId: currentParams.id || '',
      onBack: () => navigateBack('/contacts'),
      onSendMessage: async (_contact: { id: string }) => {
        try {
          await openAgentConversation('omni_core');
        } catch (error) {
          console.error('[Router] Failed to open contact conversation:', error);
          navigate('/conversation-list');
        }
      },
      onNavigate: navigate,
    };
  }

  if (path === '/new-friends' || path === '/contacts/new-friends') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/contacts'),
      onAddFriend: () => navigate('/add-friend'),
      onNavigate: navigate,
    };
  }

  if (path === '/add-friend' || path === '/contacts/add-friend') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/new-friends'),
      onNavigate: navigate,
      onSearchClick: () => navigate('/search', { from: 'add-friend' }),
    };
  }

  if (path === '/my-qrcode' || path === '/profile/qrcode') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
      type: currentParams.type === 'group' ? 'group' : 'user',
    };
  }

  if (path === '/my-address') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/profile-info'),
    };
  }

  if (path === '/my-invoice' || path === '/profile/invoice') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/profile-info'),
    };
  }

  if (path === '/my-creations') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
      onCreationClick: (id: string) => navigate('/creation/detail', { id }),
    };
  }

  if (path === '/my-agents') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
      onCreateAgent: () => navigate('/creation'),
      onChatWithAgent: async (agentId: string) => {
        try {
          await openAgentConversation(agentId);
        } catch (error) {
          console.error('[Router] Failed to open my-agent conversation:', error);
          navigate('/conversation-list');
        }
      },
    };
  }

  if (path === '/settings') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
      onAccountClick: () => navigate('/profile-info'),
      onModelSettingsClick: () => navigate('/model-settings'),
      onNotificationsClick: () => navigate('/general', {
        section: 'notifications',
        title: t('settings.notifications') || 'Notifications',
        from: 'settings',
      }),
      onThemeClick: () => navigate('/theme'),
      onLanguageClick: () => navigate('/general', {
        section: 'general',
        title: t('settings.general') || 'General',
        from: 'settings',
      }),
      onStorageClick: () => navigate('/general', {
        section: 'general',
        title: t('settings.general') || 'General',
        from: 'settings',
      }),
      onFeedbackClick: () => navigate('/feedback'),
      onAboutClick: () => navigate('/general', {
        section: 'about',
        title: t('settings.about') || 'About OpenChat',
        from: 'settings',
      }),
      onLogout: async () => {
        await logout?.();
        navigate('/login');
      },
    };
  }

  if (path === '/theme') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/settings'),
    };
  }

  if (path === '/feedback') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/settings'),
    };
  }

  if (path === '/general') {
    return {
      ...commonAuthProps,
      section: generalSection,
      title: generalTitle,
      detailTitle: currentParams.detailTitle,
      detailContent: currentParams.detailContent,
      detailType: currentParams.detailType,
      detailSource: currentParams.detailSource,
      detailTime: currentParams.detailTime,
      onSetLocale: setLocale,
      onBack: () => navigateBack(generalFallback),
      onNavigate: (targetPath: string, params?: Record<string, string>) => {
        if (targetPath === '/settings/background') {
          navigate('/chat-background', {
            ...(params || {}),
            section: generalSection,
            from: generalSource,
            title: generalTitle,
          });
          return;
        }
        navigate(targetPath, params);
      },
    };
  }

  if (path === '/chat-background') {
    const fallbackQuery = new URLSearchParams({
      section: currentParams.section || 'general',
      title: currentParams.title || t('settings.general') || 'General',
      from: resolveGeneralSource(currentParams.from),
    }).toString();

    return {
      ...commonAuthProps,
      sessionId,
      onBack: () => navigateBack(`/general?${fallbackQuery}`),
    };
  }

  if (path === '/model-settings') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/settings'),
      onModelDetail: (domain: string, title: string) => navigate('/model-config', { domain, title }),
    };
  }

  if (path === '/model-config') {
    return {
      ...commonAuthProps,
      domain: modelDomain,
      title: modelTitle,
      onBack: () => navigateBack('/model-settings'),
    };
  }

  if (path === '/search') {
    const searchCancelFallback = currentParams.sessionId
      ? `/chat-details?id=${currentParams.sessionId}`
      : (currentParams.from === 'add-friend' ? '/add-friend' : '/');

    return {
      ...commonAuthProps,
      onCancel: () => navigateBack(searchCancelFallback),
      onNavigate: navigate,
      onResultClick: (result: { type: string }) => {
        if (result.type === 'contact') {
          navigate('/contacts');
          return;
        }
        if (result.type === 'moment') {
          navigate('/moments');
          return;
        }
        if (result.type === 'favorite') {
          navigate('/favorites');
          return;
        }
        navigate('/conversation-list');
      },
    };
  }

  if (path === '/content' || path === '/article' || path === '/article/detail' || path === '/content-details') {
    return {
      ...commonAuthProps,
      articleId: currentParams.id,
      onBack: () => navigateBack('/discover'),
      onArticleClick: (id: string) => navigate('/article/detail', { id }),
    };
  }

  if (path === '/creation') {
    return {
      ...commonAuthProps,
      onSearchClick: () => navigate('/creation/search'),
      onDetailClick: (id: string) => navigate('/creation/detail', { id }),
      onNavigate: navigate,
    };
  }

  if (path === '/creation/search' || path === '/creation-search') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/creation'),
      onDetailClick: (id: string) => navigate('/creation/detail', { id }),
      onNavigate: navigate,
    };
  }

  if (path === '/creation/detail' || path === '/creation-detail') {
    return {
      ...commonAuthProps,
      id: currentParams.id,
      onBack: () => navigateBack('/creation'),
      onNavigate: navigate,
    };
  }

  if (path === '/wallet' || path === '/wallet-details') {
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
      onBack: () => navigateBack('/me'),
      onMoreClick: () => navigate('/general', {
        section: 'generic',
        title: t('wallet.title') || 'Wallet',
        from: 'me',
      }),
      onServiceClick: (service: string) => {
        if (service === 'orders') {
          navigate('/orders');
          return;
        }

        if (service === 'pay') {
          navigate('/scan');
          return;
        }

        navigate('/general', {
          section: 'generic',
          title: walletServiceTitleMap[service] || service,
          from: 'me',
        });
      },
    };
  }

  if (path === '/drive' || path === '/cloud-drive' || path === '/drive-files') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/discover'),
    };
  }

  if (
    path === '/appointments' ||
    path === '/appointment-detail' ||
    path === '/appointment-booking' ||
    path === '/appointments/detail'
  ) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
    };
  }

  if (['/commerce', '/commerce/mall', '/mall', '/shop'].includes(path)) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/discover'),
      onProductClick: (productId: string) => navigate('/product', { id: productId }),
      onCartClick: () => navigate('/shopping-cart'),
      onCategoryClick: () => navigate('/commerce/category'),
    };
  }

  if (['/category', '/commerce/category'].includes(path)) {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/commerce/mall'),
      onProductClick: (productId: string) => navigate('/product', { id: productId }),
      onSearchClick: () => navigate('/commerce/mall'),
    };
  }

  if (['/product', '/mall-product', '/commerce/product', '/commerce/item'].includes(path)) {
    return {
      ...commonAuthProps,
      productId: currentParams.id,
      onBack: () => navigateBack('/commerce/mall'),
      onCartClick: () => navigate('/shopping-cart'),
      onBuyNow: (_productId: string) => navigate('/order-confirmation'),
    };
  }

  if (path === '/shopping-cart' || path === '/commerce/cart') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
      onCheckout: () => navigate('/order-confirmation'),
      onProductClick: (productId: string) => navigate('/product', { id: productId }),
      onContinueShopping: () => navigate('/commerce/mall'),
    };
  }

  if (path === '/order-confirmation' || path === '/commerce/checkout') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/shopping-cart'),
      onOrderCreated: (orderId: string) => navigate('/order-detail', { id: orderId }),
    };
  }

  if (path === '/orders') {
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
      onBack: () => navigateBack('/me'),
      onOrderClick: (orderId: string) => navigate('/order-detail', { id: orderId }),
    };
  }

  if (path === '/order-detail' || path === '/orders/detail') {
    return {
      ...commonAuthProps,
      orderId: currentParams.id,
      onBack: () => navigateBack('/orders'),
    };
  }

  if (path === '/discover/gigs' || path === '/gig-center') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/discover'),
      onGigClick: (_gigId: string) => navigate('/my-gigs'),
    };
  }

  if (path === '/my-gigs') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
    };
  }

  if (path === '/distribution' || path === '/commerce/distribution') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
      onNavigate: (targetPath: string) => navigate(targetPath),
    };
  }

  if (path === '/distribution-goods' || path === '/commerce/distribution/goods') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/distribution'),
    };
  }

  if (path === '/my-team' || path === '/commerce/distribution/team') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/distribution'),
    };
  }

  if (path === '/commission' || path === '/commerce/distribution/commission') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/distribution'),
    };
  }

  if (path === '/distribution-rank' || path === '/commerce/distribution/rank') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/distribution'),
    };
  }

  if (path === '/withdraw' || path === '/commerce/distribution/withdraw') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/distribution'),
    };
  }

  if (path === '/share-poster' || path === '/commerce/distribution/poster') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/distribution'),
    };
  }

  if (path === '/notifications') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/'),
      onNotificationClick: (notification: { type: string }) => {
        if (notification.type === 'chat') {
          navigate('/conversation-list');
          return;
        }
        if (notification.type === 'social') {
          navigate('/moments');
          return;
        }
        if (notification.type === 'commerce') {
          navigate('/orders');
          return;
        }
        navigate('/discover');
      },
    };
  }

  if (path === '/favorites') {
    return {
      ...commonAuthProps,
      onBack: () => navigateBack('/me'),
      onItemClick: (item: any) =>
        navigate('/general', {
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

  return commonAuthProps;
};

export const Router: React.FC = () => {
  const [locationState, setLocationState] = useState(() => ({
    path: currentPath,
    search: window.location.search,
  }));
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { t, setLocale } = useTranslation();

  useEffect(() => {
    const syncRouteState = () => {
      currentPath = normalizePathname(window.location.pathname);
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
  const route = routes[path] || routes['/'];
  const Component = route.component;
  const routeProps = useMemo(
    () => buildRouteProps(path, t, logout, setLocale),
    [path, locationState.search, t, logout, setLocale]
  );
  const pageProps = useMemo(
    () => (route.showTabbar ? { ...routeProps, showBack: false } : routeProps),
    [route.showTabbar, routeProps]
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
    return <Redirect to="/login" />;
  }

  if (route.public && isAuthenticated && (path === '/login' || path === '/register' || path === '/forgot-password')) {
    return <Redirect to="/" />;
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
      <MobileLayout showTabbar={!!route.showTabbar}>
        {content}
      </MobileLayout>
    );
  }

  return content;
};

export default Router;


