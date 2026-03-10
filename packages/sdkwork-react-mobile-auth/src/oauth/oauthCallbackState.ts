import { getOAuthProviderById } from './oauthProviders';
import type { OAuthProviderId } from './oauthTypes';

export type OAuthCallbackStatusKind = 'processing' | 'success' | 'failed' | 'invalid';
export type OAuthCallbackStatusTone = 'info' | 'success' | 'danger';
export type OAuthCallbackPrimaryActionIntent = 'continue' | 'back';

export interface OAuthCallbackStatusMeta {
  kind: OAuthCallbackStatusKind;
  provider?: OAuthProviderId;
  providerName?: string;
  tone: OAuthCallbackStatusTone;
  iconGlyph: '...' | 'OK' | '!';
  showBackAction: boolean;
  showPrimaryAction: boolean;
  primaryActionIntent?: OAuthCallbackPrimaryActionIntent;
  detail?: string;
  autoRedirectMs?: number;
  countdownSeconds?: number;
}

const normalizeSearch = (search: string): string =>
  (search || '').startsWith('?') ? (search || '') : `?${search || ''}`;

const resolveProviderName = (provider?: OAuthProviderId): string | undefined => {
  if (!provider) return undefined;
  return getOAuthProviderById(provider).title;
};

export const extractOAuthCallbackProviderHint = (search: string): OAuthProviderId | undefined => {
  const params = new URLSearchParams(normalizeSearch(search));
  const provider = (params.get('provider') || '').trim() as OAuthProviderId;
  if (!provider) return undefined;

  try {
    return getOAuthProviderById(provider).id;
  } catch {
    return undefined;
  }
};

export const buildOAuthCallbackStatusMeta = ({
  kind,
  provider,
  detail,
  redirectDelayMs = 1200,
}: {
  kind: OAuthCallbackStatusKind;
  provider?: OAuthProviderId;
  detail?: string;
  redirectDelayMs?: number;
}): OAuthCallbackStatusMeta => {
  const providerName = resolveProviderName(provider);

  if (kind === 'processing') {
    return {
      kind,
      provider,
      providerName,
      tone: 'info',
      iconGlyph: '...',
      showBackAction: false,
      showPrimaryAction: false,
    };
  }

  if (kind === 'success') {
    return {
      kind,
      provider,
      providerName,
      tone: 'success',
      iconGlyph: 'OK',
      showBackAction: false,
      showPrimaryAction: true,
      primaryActionIntent: 'continue',
      autoRedirectMs: redirectDelayMs,
      countdownSeconds: Math.max(1, Math.ceil(redirectDelayMs / 1000)),
    };
  }

  return {
    kind,
    provider,
    providerName,
    tone: 'danger',
    iconGlyph: '!',
    showBackAction: true,
    showPrimaryAction: true,
    primaryActionIntent: 'back',
    detail,
  };
};
