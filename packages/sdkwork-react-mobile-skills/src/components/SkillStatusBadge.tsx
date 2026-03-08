import React from 'react';
import type { SkillInstallStatus } from '../types';
import './skillsComponents.css';

interface SkillStatusBadgeProps {
  status: SkillInstallStatus;
  t?: (key: string) => string;
  compact?: boolean;
}

function resolveLabel(
  status: SkillInstallStatus,
  t?: (key: string) => string,
): string {
  if (status === 'enabled') {
    return t?.('discover.skills_status_enabled') || '已启用';
  }
  if (status === 'installed_disabled') {
    return t?.('discover.skills_status_installed') || '已安装';
  }
  return t?.('discover.skills_status_not_installed') || '未安装';
}

export const SkillStatusBadge: React.FC<SkillStatusBadgeProps> = ({
  status,
  t,
  compact = false,
}) => (
  <span
    className={[
      'skills-status-badge',
      `skills-status-badge--${status}`,
      compact ? 'skills-status-badge--compact' : '',
    ].filter(Boolean).join(' ')}
  >
    {resolveLabel(status, t)}
  </span>
);

export default SkillStatusBadge;
