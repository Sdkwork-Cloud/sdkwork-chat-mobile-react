import React, { useMemo, useState } from 'react';
import { Toast, Input, Button, Icon, Divider } from '@sdkwork/react-mobile-commons';
import { useAuthStore } from '../stores/authStore';
import type {
  AuthMarket,
  OAuthInteractionRuntime,
  OAuthProviderId,
} from '../oauth/oauthTypes';
import { resolveRuntimeAuthMarket } from '../oauth/authMarket';
import { buildOAuthProviderDeck } from '../oauth/oauthProviders';
import { resolveOAuthInteractionRuntime } from '../oauth/oauthFlow';

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onForgotPasswordClick?: () => void;
  onRegisterClick?: () => void;
  t?: (key: string) => string;
  market?: AuthMarket;
  locale?: string;
  envMarket?: string | null;
  runtime?: OAuthInteractionRuntime;
}

const providerIconMap: Record<OAuthProviderId, { icon: React.ReactNode; color?: string }> = {
  github: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  google: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  },
  wechat: {
    color: '#07c160',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#07c160">
        <path d="M8.5 14.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5-.5.2-.5.5.2.5.5.5zm4 0c.3 0 .5-.2.5-.5s-.2-.5-.5-.5-.5.2-.5.5.2.5.5.5zM21 9.5c0-3.6-3.8-6.5-8.5-6.5s-8.5 2.9-8.5 6.5c0 2 1.2 3.8 3.2 5l-.5 1.5 2-.8c1.2.5 2.5.8 3.8.8.4 0 .8 0 1.2-.1-.2.4-.2.8-.2 1.3 0 3.2 3.1 5.8 7 5.8 1.1 0 2.1-.2 3-.7l1.7.7-.4-1.4c1.8-.9 2.9-2.5 2.9-4.3 0-1.7-1-3.2-2.5-4.2.1-.2.1-.4.1-.6zM15 8.5c.4 0 .8.3.8.8s-.3.8-.8.8-.8-.3-.8-.8.4-.8.8-.8zm-5 0c.4 0 .8.3.8.8s-.3.8-.8.8-.8-.3-.8-.8.4-.8.8-.8zm11 8c0 1.9-2.2 3.5-5 3.5-.8 0-1.5-.1-2.2-.4l-1.3.5.3-1c-1.1-.7-1.8-1.7-1.8-2.6 0-1.9 2.2-3.5 5-3.5s5 1.6 5 3.5z" />
      </svg>
    ),
  },
  qq: {
    color: '#12b7f5',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#12b7f5">
        <path d="M12 2c2.4 0 4.2 2.14 4.2 4.9 0 .72-.12 1.4-.34 2.04.93.86 1.5 2.1 1.5 3.49 0 1.73-.86 3.26-2.18 4.14.22.44.39.9.5 1.39.2.85.17 1.56-.12 2.04-.18.29-.48.47-.84.47-.61 0-1.22-.43-1.83-1.28-.27-.37-.52-.79-.75-1.27-.33.05-.67.08-1.02.08s-.69-.03-1.02-.08c-.23.48-.48.9-.75 1.27-.61.85-1.22 1.28-1.83 1.28-.36 0-.66-.18-.84-.47-.29-.48-.32-1.19-.12-2.04.11-.49.28-.95.5-1.39A4.97 4.97 0 0 1 6.64 12.4c0-1.39.57-2.63 1.5-3.49A6.13 6.13 0 0 1 7.8 6.9C7.8 4.14 9.6 2 12 2zm-1.5 5.1a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8zm3 0a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8z" />
      </svg>
    ),
  },
  apple: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M16.37 12.4c.02 2.16 1.9 2.88 1.92 2.89-.02.05-.3 1.03-1 2.04-.6.87-1.23 1.74-2.2 1.76-.94.02-1.25-.56-2.34-.56-1.1 0-1.44.54-2.32.58-.93.03-1.63-.94-2.23-1.8-1.23-1.77-2.17-5- .91-7.2.63-1.08 1.75-1.77 2.96-1.79.92-.02 1.8.62 2.34.62.54 0 1.56-.76 2.62-.65.45.02 1.72.18 2.54 1.39-.07.04-1.52.89-1.5 2.72zM14.8 4.78c.5-.61.84-1.46.75-2.3-.73.03-1.61.49-2.14 1.1-.47.53-.88 1.4-.77 2.22.82.06 1.66-.41 2.16-1.02z" />
      </svg>
    ),
  },
};

const SocialButton = ({
  label,
  description,
  modeLabel,
  hint,
  recommendedLabel,
  icon,
  color,
  isRecommended,
  onClick,
}: {
  label: string;
  description: string;
  modeLabel: string;
  hint: string;
  recommendedLabel: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  isRecommended?: boolean;
}) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '7px',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      width: '94px',
    }}
  >
    <div
      style={{
        width: '54px',
        height: '54px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        color: color || 'inherit',
        position: 'relative',
      }}
    >
      {icon}
      {isRecommended ? (
        <span
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            padding: '2px 6px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #34c759 0%, #12b886 100%)',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '0 6px 14px rgba(18,184,134,0.32)',
          }}
        >
          {recommendedLabel}
        </span>
      ) : null}
    </div>
    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.72)', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', textAlign: 'center', lineHeight: 1.35 }}>
      {description}
    </span>
    <span
      style={{
        padding: '4px 8px',
        borderRadius: '999px',
        fontSize: '9px',
        fontWeight: 700,
        color: '#dbeafe',
        background: 'rgba(59, 130, 246, 0.18)',
        border: '1px solid rgba(96, 165, 250, 0.22)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {modeLabel}
    </span>
    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.4 }}>
      {hint}
    </span>
  </div>
);

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onForgotPasswordClick,
  onRegisterClick,
  t,
  market = 'auto',
  locale,
  envMarket,
  runtime: runtimeOverride,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const loginWithSocial = useAuthStore((state) => state.loginWithSocial);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);

  const tr = (key: string, fallback: string) => {
    const value = t?.(key);
    if (value && value !== key) return value;
    return fallback;
  };
  const format = (template: string, params: Record<string, string>) =>
    Object.entries(params).reduce((result, [param, value]) => result.replace(`{${param}}`, value), template);

  const runtime = useMemo(
    () => runtimeOverride || resolveOAuthInteractionRuntime(),
    [runtimeOverride]
  );
  const resolvedMarket = useMemo(
    () =>
      resolveRuntimeAuthMarket({
        requestedMarket: market,
        envMarket,
        locale: locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US'),
      }),
    [envMarket, market, locale]
  );
  const providers = useMemo(
    () => buildOAuthProviderDeck({ market: resolvedMarket, runtime }),
    [resolvedMarket, runtime]
  );

  const marketTitle = resolvedMarket === 'cn'
    ? tr('auth_oauth_domestic_title', 'Domestic sign in')
    : tr('auth_oauth_global_title', 'International sign in');
  const marketDescription = resolvedMarket === 'cn'
    ? tr('auth_oauth_domestic_desc', 'Optimized for WeChat, QQ and cross-border fallback providers.')
    : tr('auth_oauth_global_desc', 'Optimized for Google, Apple and globally available providers.');

  const handleLogin = async () => {
    clearError();
    if (!username || !password) {
      Toast.info(tr('auth_fill_all', 'Please fill in all fields'));
      return;
    }

    const success = await login(username, password);

    if (success) {
      Toast.success(tr('auth_login_success', 'Login successful'));
      onLoginSuccess?.();
    } else {
      const latestError = useAuthStore.getState().error;
      Toast.error(latestError || tr('auth_login_failed', 'Login failed'));
    }
  };

  const handleSocialLogin = async (provider: OAuthProviderId) => {
    clearError();
    const success = await loginWithSocial({ provider });
    if (success) {
      Toast.success(
        format(
          tr('auth_social_login_success', '{provider} login successful'),
          { provider: provider.toUpperCase() }
        )
      );
      onLoginSuccess?.();
      return;
    }
    Toast.error(
      format(
        tr('auth_social_login_failed', '{provider} login failed, please try again later'),
        { provider: provider.toUpperCase() }
      )
    );
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          width: '120%',
          height: '40%',
          background: 'radial-gradient(ellipse at center, rgba(41, 121, 255, 0.15) 0%, transparent 70%)',
          transform: 'translateX(-50%)',
          zIndex: 0,
        }}
      />

      <div
        style={{
          flex: 1,
          padding: '0 32px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '20px 0 32px' }}>
          <div style={{ flex: 1.2, minHeight: '10px' }} />

          <div style={{ marginBottom: '24px', textAlign: 'center', flexShrink: 0 }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(41, 121, 255, 0.3)',
                animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
            >
              <Icon name="chat" size={30} color="white" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              {tr('auth_login_title', 'Welcome Back')}
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              {tr('auth_login_subtitle', 'Sign in to continue')}
            </p>
          </div>

          <div style={{ flex: 0.4, minHeight: '10px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
            <Input
              placeholder={tr('auth_username_placeholder', 'Username')}
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              variant="outline"
              style={{ height: '52px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '14px' }}
              prefix={<Icon name="user" size={18} color="rgba(255,255,255,0.3)" />}
            />
            <Input
              placeholder={tr('auth_password_placeholder', 'Password')}
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              variant="outline"
              style={{ height: '52px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '14px' }}
              prefix={<Icon name="lock" size={18} color="rgba(255,255,255,0.3)" />}
            />
          </div>

          <div style={{ marginTop: '12px', textAlign: 'right', flexShrink: 0 }}>
            <span
              onClick={onForgotPasswordClick}
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', padding: '4px' }}
            >
              {tr('auth_forgot_password', 'Forgot password?')}
            </span>
          </div>

          <div style={{ marginTop: '28px', flexShrink: 0 }}>
            <Button block size="lg" onClick={handleLogin} disabled={isLoading} style={{ height: '54px', borderRadius: '14px', fontSize: '16px' }}>
              {isLoading ? tr('auth_authorizing', 'Authorizing...') : tr('auth_login_btn', 'Sign In')}
            </Button>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
              {tr('auth_no_account', "Don't have an account?")}
              <span
                onClick={onRegisterClick}
                style={{ color: '#007aff', fontWeight: 600, marginLeft: '6px', cursor: 'pointer' }}
              >
                {tr('auth_register_new', 'Sign Up')}
              </span>
            </p>
          </div>

          <div style={{ flex: 1.5, minHeight: '20px' }} />

          <div style={{ marginTop: 'auto', flexShrink: 0 }}>
            <div
              style={{
                marginBottom: '14px',
                padding: '12px 14px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '4px', letterSpacing: '0.02em' }}>
                {marketTitle}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                {marketDescription}
              </div>
            </div>
            <Divider style={{ margin: '12px 0', opacity: 0.3 }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
                {tr('auth_social_divider', 'Or continue with')}
              </span>
            </Divider>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginTop: '8px', flexWrap: 'wrap' }}>
              {providers.map((provider) => {
                const visuals = providerIconMap[provider.id];
                return (
                  <SocialButton
                    key={provider.id}
                    label={provider.title}
                    description={tr(`auth_oauth_provider_${provider.id}_desc`, provider.description)}
                    modeLabel={tr(`auth_oauth_mode_${provider.mode}`, provider.modeLabel)}
                    hint={tr(`auth_oauth_mode_${provider.mode}_hint`, provider.hint)}
                    recommendedLabel={tr('auth_oauth_recommended', 'Best fit')}
                    icon={visuals.icon}
                    color={visuals.color}
                    isRecommended={provider.isRecommended}
                    onClick={() => handleSocialLogin(provider.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
