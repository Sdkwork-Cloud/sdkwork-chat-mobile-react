import React from 'react';

interface DividerProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Divider: React.FC<DividerProps> = ({ children, style }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        ...style,
      }}
    >
      <div
        style={{
          flex: 1,
          height: '1px',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />
      {children && (
        <span style={{ flexShrink: 0 }}>{children}</span>
      )}
      <div
        style={{
          flex: 1,
          height: '1px',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />
    </div>
  );
};

export default Divider;
