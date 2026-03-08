
import React from 'react';
import { navigateBack } from '../../router';
import { ROUTE_PATHS, type RoutePathInput } from '../../router/paths';
import { Sound } from '../../utils/sound';
import { Icon } from '../Icon/Icon';
import './Navbar.mobile.css';

export interface NavbarProps {
  title?: string;
  subtitle?: string;
  leftElement?: React.ReactNode;
  centerElement?: React.ReactNode;
  onBack?: () => void;
  backFallback?: RoutePathInput;
  rightElement?: React.ReactNode;
  showBack?: boolean;
  variant?: 'default' | 'transparent' | 'elevated';
  sticky?: boolean;
  className?: string;
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

export const Navbar: React.FC<NavbarProps> = ({
  title = '',
  subtitle,
  leftElement,
  centerElement,
  onBack,
  backFallback = ROUTE_PATHS.root,
  rightElement,
  showBack = true,
  variant = 'default',
  sticky = true,
  className = '',
}) => {
  const handleBack = () => {
    Sound.click();
    if (onBack) {
      onBack();
      return;
    }
    navigateBack(backFallback);
  };

  const resolvedTitle = normalizeNavbarText(title);
  const resolvedSubtitle = normalizeNavbarText(subtitle);

  const renderLeft = () => {
    if (leftElement) return leftElement;
    if (!showBack) return null;

    return (
      <button
        type="button"
        className="navbar__back-btn"
        onClick={handleBack}
        aria-label="返回"
      >
        <Icon name="back" size={21} strokeWidth={2.2} />
      </button>
    );
  };

  return (
    <header
      className={[
        'navbar',
        sticky ? 'navbar--sticky' : '',
        variant === 'transparent' ? 'navbar--transparent' : '',
        variant === 'elevated' ? 'navbar--elevated' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="banner"
    >
      <div className="navbar__left">
        {renderLeft()}
      </div>

      <div className="navbar__center" role="heading" aria-level={1}>
        {centerElement ? centerElement : (
          <>
            <div className="navbar__title">{resolvedTitle}</div>
            {resolvedSubtitle && <div className="navbar__subtitle">{resolvedSubtitle}</div>}
          </>
        )}
      </div>

      <div className="navbar__right">
        {rightElement}
      </div>
    </header>
  );
};
