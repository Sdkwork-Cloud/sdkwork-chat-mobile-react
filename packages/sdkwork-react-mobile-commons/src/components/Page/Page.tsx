import React, { useRef } from 'react';
import { Navbar, NavbarProps } from '../Navbar';
import './Page.css';

export interface PageProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  rightElement?: React.ReactNode;
  showBack?: boolean;
  backFallback?: string;
  navbarVariant?: NavbarProps['variant'];
  noNavbar?: boolean;
  noPadding?: boolean;
  background?: string;
}

export const Page: React.FC<PageProps> = ({
  children,
  style,
  className = '',
  title,
  onBack,
  right,
  rightElement,
  showBack = true,
  backFallback,
  navbarVariant = 'default',
  noNavbar = false,
  noPadding = false,
  background = 'var(--bg-body)',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`page-container ${className}`}
      style={{
        height: '100%',
        width: '100%',
        background,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {!noNavbar ? (
        <Navbar
          title={title}
          onBack={onBack}
          rightElement={rightElement ?? right}
          showBack={showBack}
          variant={navbarVariant}
          backFallback={backFallback}
        />
      ) : null}

      <div
        ref={scrollContainerRef}
        className="page-scroll-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: noPadding ? 0 : '16px',
          paddingBottom: noPadding ? 0 : 'calc(16px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </div>
    </div>
  );
};
