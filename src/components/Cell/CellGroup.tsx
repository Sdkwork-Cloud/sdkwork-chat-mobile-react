
import React from 'react';
import { CellGroup as CommonCellGroup } from '@sdkwork/react-mobile-commons';

interface CellGroupProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  inset?: boolean; // Card style
  border?: boolean; // Outer borders
  dividerInsetStart?: number | string;
  dividerInsetEnd?: number | string;
  dividerFullWidth?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const CellGroup: React.FC<CellGroupProps> = ({ 
  title, 
  children, 
  inset = false, 
  border = true,
  dividerInsetStart,
  dividerInsetEnd,
  dividerFullWidth = false,
  style,
  className = ''
}) => {
  const mergedStyle: React.CSSProperties = {
    ...(inset ? { margin: '0 16px 12px' } : {}),
    ...style,
  };

  return (
    <CommonCellGroup
      title={title}
      className={className}
      dividerInsetStart={dividerInsetStart}
      dividerInsetEnd={dividerInsetEnd}
      dividerFullWidth={dividerFullWidth}
      style={border ? mergedStyle : { ...mergedStyle, border: 'none' }}
    >
      {children}
    </CommonCellGroup>
  );
};
