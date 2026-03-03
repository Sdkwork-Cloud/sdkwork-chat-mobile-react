import React from 'react';
import { Popup } from '@sdkwork/react-mobile-commons';

interface CreationPanelShellProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const CreationPanelShell: React.FC<CreationPanelShellProps> = ({
  visible,
  title,
  onClose,
  children,
  footer,
}) => {
  return (
    <Popup visible={visible} onClose={onClose} position="bottom" round safeArea>
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <header
          style={{
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '0.5px solid var(--border-color)',
            position: 'relative',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '16px',
              border: 'none',
              background: 'var(--bg-body)',
              color: 'var(--text-secondary)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 18px' }}>{children}</div>

        {footer ? (
          <footer style={{ padding: '14px 16px', borderTop: '0.5px solid var(--border-color)' }}>{footer}</footer>
        ) : null}
      </div>
    </Popup>
  );
};

export default CreationPanelShell;
