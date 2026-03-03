import React from 'react';

interface SectionCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({ children, style, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-color)',
        borderRadius: '14px',
        padding: '12px',
        marginBottom: '12px',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default SectionCard;
