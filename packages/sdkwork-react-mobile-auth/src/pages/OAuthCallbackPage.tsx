import React from 'react';
import { parseOAuthCallbackParams } from '../oauth/oauthFlow';
import { useAuthStore } from '../stores/authStore';

interface OAuthCallbackPageProps {
  search?: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  t?: (key: string) => string;
}

type CallbackStatus =
  | { kind: 'processing'; message: string }
  | { kind: 'invalid'; message: string }
  | { kind: 'failed'; message: string };

export const OAuthCallbackPage: React.FC<OAuthCallbackPageProps> = ({
  search,
  onSuccess,
  onBackToLogin,
  t,
}) => {
  const loginWithSocial = useAuthStore((state) => state.loginWithSocial);
  const clearError = useAuthStore((state) => state.clearError);
  const [status, setStatus] = React.useState<CallbackStatus>({
    kind: 'processing',
    message: t?.('auth_oauth_callback_processing') || 'Completing sign in...',
  });

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  React.useEffect(() => {
    let cancelled = false;
    clearError();

    const run = async () => {
      try {
        const parsed = parseOAuthCallbackParams(search ?? (typeof window !== 'undefined' ? window.location.search : ''));
        if (parsed.error) {
          if (!cancelled) {
            setStatus({
              kind: 'failed',
              message: parsed.error,
            });
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
          onSuccess?.();
          return;
        }

        setStatus({
          kind: 'failed',
          message: tr('auth_oauth_callback_failed', 'Third-party sign in failed. Please try again.'),
        });
      } catch {
        if (!cancelled) {
          setStatus({
            kind: 'invalid',
            message: tr('auth_oauth_callback_invalid', 'Invalid sign-in callback. Please restart the OAuth flow.'),
          });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [clearError, loginWithSocial, onSuccess, search, tr]);

  const showBackAction = status.kind !== 'processing';

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
            background:
              status.kind === 'processing'
                ? 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)'
                : 'linear-gradient(135deg, #fa5151 0%, #ff8a5c 100%)',
          }}
        >
          <span style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>
            {status.kind === 'processing' ? '...' : 'OK'}
          </span>
        </div>

        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
          {tr('auth_oauth_callback_title', 'OAuth callback')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.6, marginBottom: showBackAction ? '20px' : '0' }}>
          {status.message}
        </p>

        {showBackAction ? (
          <button
            type="button"
            onClick={onBackToLogin}
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
            {tr('auth_oauth_callback_back', 'Back to login')}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
