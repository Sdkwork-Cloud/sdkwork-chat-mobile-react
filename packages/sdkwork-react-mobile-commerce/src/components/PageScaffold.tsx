import React from 'react';
import { Navbar } from '@sdkwork/react-mobile-commons';

interface PageScaffoldProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const PageScaffold: React.FC<PageScaffoldProps> = ({
  title,
  onBack,
  rightElement,
  children,
  footer,
  noPadding = false,
}) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-body)',
      }}
    >
      <Navbar title={title} onBack={onBack} rightElement={rightElement} />
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: noPadding ? 0 : '12px',
          paddingBottom: footer ? '92px' : 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </div>
      {footer ? (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            borderTop: '0.5px solid var(--border-color)',
            background: 'var(--bg-card)',
            padding: '10px 12px',
            paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
            zIndex: 20,
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
};

export default PageScaffold;
