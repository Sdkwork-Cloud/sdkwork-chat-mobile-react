import React from 'react';
import { CellGroup, CellItem, Icon } from '@sdkwork/react-mobile-commons';
import './DiscoverCellGroup.css';

interface DiscoverCellGroupProps {
  children: React.ReactNode;
  dividerInsetStart?: number | string;
  dividerInsetEnd?: number | string;
  dividerFullWidth?: boolean;
}

export const DiscoverCellGroup: React.FC<DiscoverCellGroupProps> = ({
  children,
  dividerInsetStart = 60,
  dividerInsetEnd,
  dividerFullWidth = false,
}) => (
  <CellGroup
    className="discover-cell-group"
    dividerInsetStart={dividerInsetStart}
    dividerInsetEnd={dividerInsetEnd}
    dividerFullWidth={dividerFullWidth}
  >
    {children}
  </CellGroup>
);

export const DiscoverCell: React.FC<{
  title: string;
  icon: string;
  color: string;
  isLast?: boolean;
  onClick?: () => void;
}> = ({ title, icon, color, isLast = false, onClick }) => (
  <CellItem
    className="discover-cell"
    iconClassName="discover-cell__icon"
    title={title}
    icon={
      <span className="discover-cell__icon-wrap" style={{ background: `${color}14`, color }}>
        <Icon name={icon} size={20} color={color} />
      </span>
    }
    isLink
    noBorder={isLast}
    onClick={onClick}
  />
);
