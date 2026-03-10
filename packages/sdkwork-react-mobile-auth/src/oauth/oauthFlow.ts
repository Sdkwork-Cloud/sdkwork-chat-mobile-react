import { getOAuthProviderById } from './oauthProviders';
import {
  resolveOAuthInteractionMode,
  resolveOAuthInteractionRuntime,
} from './oauthRuntime';
import type {
  ParsedOAuthCallbackParams,
  OAuthProviderId,
} from './oauthTypes';
export { resolveOAuthInteractionMode, resolveOAuthInteractionRuntime } from './oauthRuntime';

export const parseOAuthCallbackParams = (search: string): ParsedOAuthCallbackParams => {
  const params = new URLSearchParams((search || '').startsWith('?') ? search : `?${search || ''}`);
  const providerRaw = (params.get('provider') || '').trim();
  if (!providerRaw) {
    throw new Error('OAuth provider is required');
  }

  const provider = getOAuthProviderById(providerRaw as OAuthProviderId).id;
  const code = (params.get('code') || '').trim() || undefined;
  const state = (params.get('state') || '').trim() || undefined;
  const error = (
    params.get('error') ||
    params.get('error_description') ||
    ''
  ).trim() || undefined;

  if (!error && !code) {
    throw new Error('OAuth code is required');
  }

  return {
    provider,
    code,
    state,
    error,
  };
};
