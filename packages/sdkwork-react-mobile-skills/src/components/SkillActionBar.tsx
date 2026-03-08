import React from 'react';
import type { SkillAction } from '../types';
import './skillsComponents.css';

export interface SkillActionBarProps {
  action: SkillAction;
  loading?: boolean;
  t?: (key: string) => string;
  onAction?: (action: SkillAction) => void;
}

function resolveActionLabel(action: SkillAction, t?: (key: string) => string): string {
  if (action === 'enable') {
    return t?.('discover.skills_action_enable') || '启用';
  }
  if (action === 'disable') {
    return t?.('discover.skills_action_disable') || '停用';
  }
  return t?.('discover.skills_action_install') || '安装';
}

export const SkillActionBar: React.FC<SkillActionBarProps> = ({
  action,
  loading = false,
  t,
  onAction,
}) => (
  <div className="skill-action-bar">
    <button
      type="button"
      className="skill-action-bar__button"
      onClick={() => onAction?.(action)}
      disabled={loading}
    >
      {loading ? (t?.('discover.skills_action_processing') || '处理中...') : resolveActionLabel(action, t)}
    </button>
  </div>
);

export default SkillActionBar;
