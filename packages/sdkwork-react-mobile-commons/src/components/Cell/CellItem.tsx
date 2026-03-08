import React from 'react';
import { Icon } from '../Icon';
import './Cell.css';

export interface CellItemProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  isLink?: boolean;
  onClick?: () => void;
  danger?: boolean;
  center?: boolean;
  noBorder?: boolean;
  dividerInsetStart?: number | string;
  dividerInsetEnd?: number | string;
  dividerFullWidth?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const toCssLength = (value: number | string): string => (typeof value === 'number' ? `${value}px` : value);
type CellItemStyleVars = React.CSSProperties & {
  '--c-cell-item-divider-inset-start'?: string;
  '--c-cell-item-divider-inset-end'?: string;
};

export const CellItem: React.FC<CellItemProps> = ({
  title,
  description,
  value,
  icon,
  iconClassName = '',
  isLink = false,
  onClick,
  danger = false,
  center = false,
  noBorder = false,
  dividerInsetStart,
  dividerInsetEnd,
  dividerFullWidth = false,
  rightSlot,
  className = '',
  style,
}) => {
  const clickable = Boolean(onClick);
  const hasIcon = Boolean(icon);

  const mergedStyle: CellItemStyleVars = { ...style };
  if (dividerFullWidth) {
    mergedStyle['--c-cell-item-divider-inset-start'] = '0px';
    mergedStyle['--c-cell-item-divider-inset-end'] = '0px';
  } else {
    if (dividerInsetStart !== undefined) {
      mergedStyle['--c-cell-item-divider-inset-start'] = toCssLength(dividerInsetStart);
    }
    if (dividerInsetEnd !== undefined) {
      mergedStyle['--c-cell-item-divider-inset-end'] = toCssLength(dividerInsetEnd);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={[
        'c-cell-item',
        hasIcon ? 'c-cell-item--has-icon' : '',
        clickable ? 'c-cell-item--clickable' : '',
        danger ? 'c-cell-item--danger' : '',
        center ? 'c-cell-item--center' : '',
        noBorder ? 'c-cell-item--no-border' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={mergedStyle}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      {icon ? <span className={`c-cell-item__icon ${iconClassName}`.trim()}>{icon}</span> : null}

      <span className="c-cell-item__main">
        <span className="c-cell-item__title">{title}</span>
        {description ? <span className="c-cell-item__description">{description}</span> : null}
      </span>

      {(value !== undefined || isLink || rightSlot) && (
        <span className="c-cell-item__right">
          {value !== undefined ? <span className="c-cell-item__value">{value}</span> : null}
          {rightSlot}
          {isLink ? (
            <span className="c-cell-item__arrow">
              <Icon name="arrow-right" size={18} color="var(--text-secondary)" />
            </span>
          ) : null}
        </span>
      )}
    </div>
  );
};

export default CellItem;
