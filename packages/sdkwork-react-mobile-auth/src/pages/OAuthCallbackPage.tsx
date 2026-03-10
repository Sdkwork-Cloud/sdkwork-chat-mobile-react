import React from 'react';
import {
  buildOAuthCallbackStatusMeta,
  extractOAuthCallbackProviderHint,
  type OAuthCallbackStatusMeta,
} from '../oauth/oauthCallbackState';
import { parseOAuthCallbackParams } from '../oauth/oauthFlow';
import { useAuthStore } from '../stores/authStore';

interface OAuthCallbackPageProps {
  search?: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  t?: (key: string) => string;
  successRedirectDelayMs?: number;
}

export const OAuthCallbackPage: React.FC<OAuthCallbackPageProps> = ({
  search,
  onSuccess,
  onBackToLogin,
  t,
  successRedirectDelayMs = 1200,
}) => {
  const loginWithSocial = useAuthStore((state) => state.loginWithSocial);
  const clearError = useAuthStore((state) => state.clearError);
  const resolvedSearch = React.useMemo(
    () => search ?? (typeof window !== 'undefined' ? window.location.search : ''),
    [search]
  );
  const providerHint = React.useMemo(
    () => extractOAuthCallbackProviderHint(resolvedSearch),
    [resolvedSearch]
  );
  const [status, setStatus] = React.useState<OAuthCallbackStatusMeta>(() =>
    buildOAuthCallbackStatusMeta({
      kind: 'processing',
      provider: providerHint,
      redirectDelayMs: successRedirectDelayMs,
    })
  );

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );
  const format = React.useCallback(
    (template: string, params: Record<string, string | number | undefined>) =>
      Object.entries(params).reduce(
        (result, [param, value]) => result.replace(`{${param}}`, String(value ?? '')),
        template
      ),
    []
  );

  React.useEffect(() => {
    let cancelled = false;
    let successTimer = 0;
    clearError();
    setStatus(
      buildOAuthCallbackStatusMeta({
        kind: 'processing',
        provider: providerHint,
        redirectDelayMs: successRedirectDelayMs,
      })
    );

    const run = async () => {
      try {
        const parsed = parseOAuthCallbackParams(resolvedSearch);
        if (parsed.error) {
          if (!cancelled) {
            setStatus(
              buildOAuthCallbackStatusMeta({
                kind: 'failed',
                provider: parsed.provider,
                detail: parsed.error,
              })
            );
          }
          return;
        }

        const success = await loginWithSocial({
          provider: parsed.provider,
          code: parsed.code,
          state: parsed.state,
        });

        if (cancelled) return;

        if (success) {
          const successStatus = buildOAuthCallbackStatusMeta({
            kind: 'success',
            provider: parsed.provider,
            redirectDelayMs: successRedirectDelayMs,
          });
          setStatus(successStatus);
          if (typeof window !== 'undefined') {
            successTimer = window.setTimeout(() => {
              if (!cancelled) {
                onSuccess?.();
              }
            }, successStatus.autoRedirectMs ?? successRedirectDelayMs);
          } else {
            onSuccess?.();
          }
          return;
        }

        setStatus(
          buildOAuthCallbackStatusMeta({
          kind: 'failed',
            provider: parsed.provider,
            detail: useAuthStore.getState().error || undefined,
          })
        );
      } catch (error) {
        if (!cancelled) {
          setStatus(
            buildOAuthCallbackStatusMeta({
            kind: 'invalid',
              provider: providerHint,
              detail: error instanceof Error ? error.message : undefined,
            })
          );
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (successTimer) {
        window.clearTimeout(successTimer);
      }
    };
  }, [clearError, loginWithSocial, onSuccess, providerHint, resolvedSearch, successRedirectDelayMs]);

  const providerLabel = status.providerName || tr('auth_oauth_callback_title', 'OAuth callback');
  const title = status.kind === 'success'
    ? format(
        tr('auth_oauth_callback_success_title', '{provider} sign-in complete'),
        { provider: providerLabel }
      )
    : status.kind === 'failed'
      ? format(
          tr('auth_oauth_callback_failed_title', '{provider} sign-in failed'),
          { provider: providerLabel }
        )
      : status.kind === 'invalid'
        ? tr('auth_oauth_callback_invalid_title', 'Invalid sign-in callback')
        : format(
            tr('auth_oauth_callback_processing_title', 'Connecting {provider}'),
            { provider: providerLabel }
          );
  const message = status.kind === 'success'
    ? format(
        tr('auth_oauth_callback_success_message', 'Redirecting to the app in {seconds}s'),
        { seconds: status.countdownSeconds }
      )
    : status.kind === 'failed'
      ? tr('auth_oauth_callback_failed_message', 'You can return to login and try again.')
      : status.kind === 'invalid'
        ? tr('auth_oauth_callback_invalid', 'Invalid sign-in callback. Please restart the OAuth flow.')
        : format(
            tr('auth_oauth_callback_processing_message', 'Completing {provider} sign in. Keep this page open.'),
            { provider: providerLabel }
          );
  const actionLabel = status.primaryActionIntent === 'continue'
    ? tr('auth_oauth_callback_continue', 'Open app now')
    : tr('auth_oauth_callback_back', 'Back to login');
  const handlePrimaryAction = () => {
    if (status.primaryActionIntent === 'continue') {
      onSuccess?.();
      return;
    }
    onBackToLogin?.();
  };
  const iconBackground = status.tone === 'success'
    ? 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)'
    : status.tone === 'danger'
      ? 'linear-gradient(135deg, #fa5151 0%, #ff8a5c 100%)'
      : 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: '#0a0a0a',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '24px',
          padding: '28px 24px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 18px 60px rgba(0,0,0,0.28)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            margin: '0 auto 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: iconBackground,
          }}
        >
          <span style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>
            {status.iconGlyph}
          </span>
        </div>

        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
          {title}
        </h1>
        {status.providerName ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              marginBottom: '12px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.82)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {status.providerName}
          </div>
        ) : null}
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.6, marginBottom: status.showPrimaryAction ? '16px' : '0' }}>
          {message}
        </p>

        {status.detail ? (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'left',
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '11px', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.02em' }}>
              {tr('auth_oauth_callback_detail_label', 'Provider response')}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: 1.5 }}>
              {status.detail}
            </div>
          </div>
        ) : null}

        {status.showPrimaryAction ? (
          <button
            type="button"
            onClick={handlePrimaryAction}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
