import type {
  OAuthInteractionMode,
  OAuthProviderDescriptor,
  OAuthProviderId,
  ResolvedAuthMarket,
  ResolveOAuthProvidersInput,
  OAuthInteractionRuntime,
} from './oauthTypes';
import { resolveOAuthInteractionMode } from './oauthRuntime';

const OAUTH_PROVIDERS: OAuthProviderDescriptor[] = [
  {
    id: 'wechat',
    sdkProvider: 'WECHAT',
    market: 'cn',
    priority: 10,
    title: 'WeChat',
    description: 'Best for domestic consumer sign in',
    iconKey: 'wechat',
    supports: { web: true, native: true, ios: true, android: true },
    modes: { web: 'redirect', webMobile: 'redirect', native: 'redirect' },
    scope: 'snsapi_login',
    requiresCallbackPage: true,
  },
  {
    id: 'qq',
    sdkProvider: 'QQ',
    market: 'cn',
    priority: 20,
    title: 'QQ',
    description: 'Fast fallback for domestic app accounts',
    iconKey: 'qq',
    supports: { web: true, native: true, ios: true, android: true },
    modes: { web: 'redirect', webMobile: 'redirect', native: 'redirect' },
    requiresCallbackPage: true,
  },
  {
    id: 'google',
    sdkProvider: 'GOOGLE',
    market: 'global',
    priority: 10,
    title: 'Google',
    description: 'Primary sign in for the international version',
    iconKey: 'google',
    supports: { web: true, native: true, ios: true, android: true },
    modes: { web: 'popup', webMobile: 'popup', native: 'redirect' },
    scope: 'email profile',
  },
  {
    id: 'apple',
    sdkProvider: 'APPLE',
    market: 'shared',
    priority: 30,
    title: 'Apple',
    description: 'Preferred on iPhone and privacy-focused sign in',
    iconKey: 'apple',
    supports: { web: true, native: true, ios: true, android: false },
    modes: { web: 'popup', webMobile: 'popup', native: 'native', ios: 'native' },
    scope: 'name email',
  },
  {
    id: 'github',
    sdkProvider: 'GITHUB',
    market: 'shared',
    priority: 40,
    title: 'GitHub',
    description: 'Useful for technical and low-friction login',
    iconKey: 'github',
    supports: { web: true, native: true, ios: true, android: true },
    modes: { web: 'popup', webMobile: 'popup', native: 'redirect' },
    scope: 'user:email',
  },
];

const isProviderAvailableForRuntime = (
  provider: OAuthProviderDescriptor,
  input: ResolveOAuthProvidersInput
): boolean => {
  if (provider.market !== 'shared' && provider.market !== input.market) {
    return false;
  }

  if (input.runtime.isNative) {
    if (!provider.supports.native) return false;
    if (input.runtime.isIOS && provider.supports.ios === false) return false;
    if (input.runtime.isAndroid && provider.supports.android === false) return false;
    return true;
  }

  return provider.supports.web;
};

export const getOAuthProviderById = (id: OAuthProviderId): OAuthProviderDescriptor => {
  const provider = OAUTH_PROVIDERS.find((item) => item.id === id);
  if (!provider) {
    throw new Error(`Unsupported OAuth provider: ${id}`);
  }
  return provider;
};

export const getAvailableOAuthProviders = (input: ResolveOAuthProvidersInput): OAuthProviderDescriptor[] =>
  OAUTH_PROVIDERS
    .filter((provider) => isProviderAvailableForRuntime(provider, input))
    .sort((left, right) => left.priority - right.priority);

export const OAUTH_PROVIDER_REGISTRY = OAUTH_PROVIDERS;

export interface OAuthProviderDeckItem extends OAuthProviderDescriptor {
  mode: OAuthInteractionMode;
  modeLabel: string;
  hint: string;
  isRecommended: boolean;
}

const OAUTH_MODE_LABELS: Record<OAuthInteractionMode, string> = {
  popup: 'Quick popup',
  redirect: 'Browser handoff',
  native: 'Native app',
};

const OAUTH_MODE_HINTS: Record<OAuthInteractionMode, string> = {
  popup: 'Opens a secure sign-in window',
  redirect: 'Returns here after authorization',
  native: 'Uses installed provider app when available',
};

export const buildOAuthProviderDeck = ({
  market,
  runtime,
}: {
  market: ResolvedAuthMarket;
  runtime: OAuthInteractionRuntime;
}): OAuthProviderDeckItem[] =>
  getAvailableOAuthProviders({ market, runtime }).map((provider, index) => {
    const mode = resolveOAuthInteractionMode(provider, runtime);

    return {
      ...provider,
      mode,
      modeLabel: OAUTH_MODE_LABELS[mode],
      hint: OAUTH_MODE_HINTS[mode],
      isRecommended: index === 0,
    };
  });
