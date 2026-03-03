import React from 'react';
import { Icon } from '../Icon';
import './Navbar.css';

export interface NavbarProps {
  title?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  showBack?: boolean;
  variant?: 'default' | 'transparent';
  backFallback?: string;
}

const decodeUnicodeEscapes = (value: string): string =>
  value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)));

const normalizeNavbarText = (value: unknown): string => {
  if (typeof value !== 'string') return '';

  let normalized = value.trim();
  if (!normalized) return '';

  if (/%[0-9a-fA-F]{2}/.test(normalized)) {
    try {
      normalized = decodeURIComponent(normalized.replace(/\+/g, '%20'));
    } catch {
      // Keep original string when URL decoding fails.
    }
  }

  if (/\\u[0-9a-fA-F]{4}/.test(normalized)) {
    normalized = decodeUnicodeEscapes(normalized);
  }

  return normalized.replace(/[\u0000-\u001F\u007F]/g, '').trim();
};

const resolveBackAriaLabel = (): string => {
  const htmlLang = (document.documentElement.lang || '').toLowerCase();
  const navLang = (navigator.language || '').toLowerCase();
  const lang = htmlLang || navLang;
  return lang.startsWith('en') ? 'Back' : '返回';
};

export const Navbar: React.FC<NavbarProps> = ({
  title = '',
  onBack,
  rightElement,
  showBack = true,
  variant = 'default',
  backFallback = '/',
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign(backFallback);
  };

  const isTransparent = variant === 'transparent';
  const resolvedTitle = normalizeNavbarText(title);

  return (
    <header className={`oc-navbar ${isTransparent ? 'oc-navbar--transparent' : ''}`} role="banner">
      <div className="oc-navbar__left">
        {showBack ? (
          <button
            type="button"
            className="oc-navbar__back-btn"
            onClick={handleBack}
            aria-label={resolveBackAriaLabel()}
          >
            <Icon name="back" size={21} strokeWidth={2.2} />
          </button>
        ) : null}
      </div>

      <div className="oc-navbar__title" role="heading" aria-level={1}>
        {resolvedTitle}
      </div>

      <div className="oc-navbar__right">{rightElement}</div>
    </header>
  );
};
