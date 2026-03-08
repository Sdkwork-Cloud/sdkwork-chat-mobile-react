import React from 'react';
import { CellItem, Icon } from '@sdkwork/react-mobile-commons';
import type { SkillListItem } from '../types';
import { SkillStatusBadge } from './SkillStatusBadge';
import './skillsComponents.css';

export interface SkillsListItemProps {
  item: SkillListItem;
  t?: (key: string) => string;
  isLast?: boolean;
  onClick?: (item: SkillListItem) => void;
}

function buildDescription(item: SkillListItem): string {
  const segments = [
    item.summary,
    item.categoryName,
  ].filter((part): part is string => typeof part === 'string' && part.trim().length > 0);
  return segments.join(' · ');
}

export const SkillsListItem: React.FC<SkillsListItemProps> = ({
  item,
  t,
  isLast = false,
  onClick,
}) => {
  const iconName = item.type === 'package' ? 'briefcase' : 'sparkles';
  const iconColor = item.type === 'package' ? '#2B6EF5' : '#15A36C';
  const versionText = item.version ? `v${item.version}` : '';
  const skillCountText = item.type === 'package' && item.skillCount
    ? `${item.skillCount} ${t?.('discover.skills_count_suffix') || 'skills'}`
    : '';
  const value = [versionText, skillCountText].filter(Boolean).join('  ');

  return (
    <CellItem
      className="skills-list-item"
      iconClassName="skills-list-item__icon"
      icon={(
        <span className="skills-list-item__icon-wrap" style={{ color: iconColor }}>
          <Icon name={iconName} size={18} color={iconColor} />
        </span>
      )}
      title={item.name}
      description={buildDescription(item)}
      value={value || undefined}
      rightSlot={<SkillStatusBadge status={item.installStatus} t={t} compact />}
      isLink
      noBorder={isLast}
      onClick={onClick ? () => onClick(item) : undefined}
    />
  );
};

export default SkillsListItem;
