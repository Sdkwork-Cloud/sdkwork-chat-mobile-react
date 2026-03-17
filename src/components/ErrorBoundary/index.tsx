import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { DEFAULT_LOCALE, type Locale } from '../../core/i18n/config';
import { readPersistedLocale, resolveInitialLocale } from '../../core/i18n/localeResolver';
import { getTranslationValue } from '../../core/i18n/resources';
import { appUiStateService } from '../../services/AppUiStateService';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const resolveLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  return resolveInitialLocale({
    search: window.location.search,
    persistedLocale: readPersistedLocale(),
    navigatorLanguages: typeof navigator !== 'undefined' ? navigator.languages : undefined,
    navigatorLanguage: typeof navigator !== 'undefined' ? navigator.language : undefined,
  });
};

const interpolate = (message: string, params?: Record<string, string>) => {
  if (!params) {
    return message;
  }

  return Object.entries(params).reduce((output, [key, value]) => {
    return output
      .replace(new RegExp(`\\{${key}\\}`, 'g'), value)
      .replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }, message);
};

const translate = (locale: Locale, key: string, fallback: string, params?: Record<string, string>) => {
  const message = getTranslationValue(locale, key) || fallback;
  return interpolate(message, params);
};

export class ErrorBoundary extends Component<Props, State> {
  public readonly props!: Readonly<Props>;

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleHardReset = () => {
    const locale = resolveLocale();
    const confirmed = window.confirm(
      translate(
        locale,
        'component.error_boundary.reset_confirm',
        'This will clear local cached data and restore the initial state. Continue?'
      )
    );

    if (!confirmed) {
      return;
    }

    appUiStateService.clearAllBrowserStorage();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const locale = resolveLocale();
      const errorMessage =
        this.state.error?.message ||
        translate(locale, 'component.error_boundary.unknown', 'Unknown error');

      return (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-body)',
            color: 'var(--text-primary)',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠︎</div>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: 600 }}>
            {translate(
              locale,
              'component.error_boundary.title',
              'The app encountered a critical error'
            )}
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '40px',
              maxWidth: '280px',
              lineHeight: '1.6',
            }}
          >
            {translate(locale, 'component.error_boundary.message_label', 'Error')}: {errorMessage}
            <br />
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              {translate(
                locale,
                'component.error_boundary.hint',
                'This can happen after a data schema mismatch or a temporary network issue.'
              )}
            </span>
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
              maxWidth: '240px',
            }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '14px',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(41, 121, 255, 0.3)',
              }}
            >
              {translate(locale, 'component.error_boundary.reload', 'Reload App')}
            </button>

            <button
              onClick={this.handleHardReset}
              style={{
                padding: '14px',
                background: 'var(--bg-card)',
                color: '#fa5151',
                border: '1px solid rgba(250, 81, 81, 0.2)',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {translate(locale, 'component.error_boundary.repair', 'Repair Data and Restart')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
