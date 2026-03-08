import React from 'react';
import './Cell.css';

export interface CellGroupProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  dividerInsetStart?: number | string;
  dividerInsetEnd?: number | string;
  dividerFullWidth?: boolean;
}

const toCssLength = (value: number | string): string => (typeof value === 'number' ? `${value}px` : value);
type CellGroupStyleVars = React.CSSProperties & {
  '--c-cell-group-divider-inset-start'?: string;
  '--c-cell-group-divider-inset-end'?: string;
};

export const CellGroup: React.FC<CellGroupProps> = ({
  title,
  children,
  className = '',
  style,
  dividerInsetStart,
  dividerInsetEnd,
  dividerFullWidth = false,
}) => {
  const mergedStyle: CellGroupStyleVars = { ...style };
  if (dividerFullWidth) {
    mergedStyle['--c-cell-group-divider-inset-start'] = '0px';
    mergedStyle['--c-cell-group-divider-inset-end'] = '0px';
  } else {
    if (dividerInsetStart !== undefined) {
      mergedStyle['--c-cell-group-divider-inset-start'] = toCssLength(dividerInsetStart);
    }
    if (dividerInsetEnd !== undefined) {
      mergedStyle['--c-cell-group-divider-inset-end'] = toCssLength(dividerInsetEnd);
    }
  }

  return (
    <div className={`c-cell-group ${className}`.trim()} style={mergedStyle}>
      {title ? <div className="c-cell-group__title">{title}</div> : null}
      <div className="c-cell-group__content">{children}</div>
    </div>
  );
};

export default CellGroup;
