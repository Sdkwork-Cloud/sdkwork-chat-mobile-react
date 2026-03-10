export type AuthMarket = 'auto' | 'cn' | 'global';
export type ResolvedAuthMarket = Exclude<AuthMarket, 'auto'>;

export type OAuthProviderId = 'github' | 'google' | 'wechat' | 'apple' | 'qq';
export type OAuthSdkProvider = 'GITHUB' | 'GOOGLE' | 'WECHAT' | 'APPLE' | 'QQ';
export type OAuthInteractionMode = 'popup' | 'redirect' | 'native';
export type OAuthProviderMarket = 'cn' | 'global' | 'shared';

export interface OAuthInteractionRuntime {
  platform: 'web' | 'native';
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  prefersRedirect: boolean;
}

export interface OAuthProviderDescriptor {
  id: OAuthProviderId;
  sdkProvider: OAuthSdkProvider;
  market: OAuthProviderMarket;
  priority: number;
  title: string;
  description: string;
  iconKey: string;
  supports: {
    web: boolean;
    native: boolean;
    ios?: boolean;
    android?: boolean;
  };
  modes: {
    web: OAuthInteractionMode;
    webMobile?: OAuthInteractionMode;
    native?: OAuthInteractionMode;
    ios?: OAuthInteractionMode;
    android?: OAuthInteractionMode;
  };
  scope?: string;
  requiresCallbackPage?: boolean;
}

export interface ResolveOAuthProvidersInput {
  market: ResolvedAuthMarket;
  runtime: OAuthInteractionRuntime;
}

export interface ParsedOAuthCallbackParams {
  provider: OAuthProviderId;
  code?: string;
  state?: string;
  error?: string;
}
