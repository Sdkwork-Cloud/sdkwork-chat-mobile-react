import type { OAuthInteractionMode, OAuthProviderId } from './oauthTypes';

export type OAuthAuthorizationTransport = 'popup' | 'redirect' | 'native';

export interface OAuthAuthorizationResult {
  code?: string;
  state?: string;
  transport: OAuthAuthorizationTransport;
}

export interface ExecuteOAuthAuthorizationInput {
  mode: OAuthInteractionMode;
  authUrl: string;
  provider: OAuthProviderId;
  redirectUri?: string;
  popupExecutor: (authUrl: string, redirectUri?: string) => Promise<{ code: string; state?: string }>;
  redirectExecutor: (authUrl: string) => Promise<void>;
  nativeExecutor: (provider: OAuthProviderId) => Promise<{ code: string; state?: string }>;
}

export const executeOAuthAuthorization = async ({
  mode,
  authUrl,
  provider,
  redirectUri,
  popupExecutor,
  redirectExecutor,
  nativeExecutor,
}: ExecuteOAuthAuthorizationInput): Promise<OAuthAuthorizationResult> => {
  if (mode === 'popup') {
    const popupResult = await popupExecutor(authUrl, redirectUri);
    return {
      code: popupResult.code,
      state: popupResult.state,
      transport: 'popup',
    };
  }

  if (mode === 'native') {
    const nativeResult = await nativeExecutor(provider);
    return {
      code: nativeResult.code,
      state: nativeResult.state,
      transport: 'native',
    };
  }

  await redirectExecutor(authUrl);
  return {
    transport: 'redirect',
  };
};
