import React from 'react';
import { Icon } from '@sdkwork/react-mobile-commons';
import './DiscoverCellGroup.css';

export const DiscoverCellGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="discover-cell-group">
    {children}
  </div>
);

export const DiscoverCell: React.FC<{
  title: string;
  icon: string;
  color: string;
  isLast?: boolean;
  onClick?: () => void;
}> = ({ title, icon, color, isLast = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`discover-cell ${isLast ? 'discover-cell--last' : ''}`}
  >
    <div className="discover-cell__icon-wrap" style={{ background: `${color}14`, color }}>
      <Icon name={icon} size={20} color={color} />
    </div>
    <span className="discover-cell__title">{title}</span>
    <span className="discover-cell__arrow">
      <Icon name="arrow-right" size={18} color="var(--text-secondary)" />
    </span>
  </button>
);
