
import React from 'react';
import { CellItem } from '@sdkwork/react-mobile-commons';

export interface CellProps {
  title: React.ReactNode;
  value?: React.ReactNode;
  label?: React.ReactNode; // Subtitle/Description
  icon?: React.ReactNode;
  
  isLink?: boolean;
  clickable?: boolean;
  required?: boolean;
  center?: boolean; // Vertically center content
  
  onClick?: (e: React.MouseEvent) => void;
  
  className?: string;
  style?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  valueStyle?: React.CSSProperties;
  
  rightIcon?: React.ReactNode; // Custom right icon instead of arrow
  border?: boolean; // Force border visibility
  dividerInsetStart?: number | string;
  dividerInsetEnd?: number | string;
  dividerFullWidth?: boolean;
}

export const Cell: React.FC<CellProps> = ({ 
  title, 
  value, 
  label,
  icon,
  isLink, 
  clickable,
  required,
  center,
  onClick,
  className = '',
  style,
  titleStyle,
  valueStyle,
  rightIcon,
  border = true,
  dividerInsetStart,
  dividerInsetEnd,
  dividerFullWidth = false,
}) => {
  const resolvedOnClick = clickable
    ? (onClick ? () => onClick(undefined as unknown as React.MouseEvent) : () => undefined)
    : (onClick ? () => onClick(undefined as unknown as React.MouseEvent) : undefined);

  return (
    <CellItem
      title={<span style={titleStyle}>{required ? <>{'* '}{title}</> : title}</span>}
      description={label}
      value={value !== undefined ? <span style={valueStyle}>{value}</span> : undefined}
      icon={icon}
      isLink={Boolean(isLink && !rightIcon)}
      onClick={resolvedOnClick}
      rightSlot={rightIcon}
      center={center}
      noBorder={!border}
      dividerInsetStart={dividerInsetStart}
      dividerInsetEnd={dividerInsetEnd}
      dividerFullWidth={dividerFullWidth}
      className={className}
      style={style}
    />
  );
};
