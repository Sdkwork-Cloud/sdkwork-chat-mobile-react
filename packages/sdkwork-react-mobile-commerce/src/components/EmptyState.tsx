import React from 'react';
import { Button } from '@sdkwork/react-mobile-commons';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📦', title, actionText, onAction }) => {
  return (
    <div className="commerce-empty-state">
      <div className="commerce-empty-state__icon" aria-hidden>
        {icon}
      </div>
      <div className="commerce-empty-state__title">{title}</div>
      {actionText && onAction ? (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </div>
  );
};

export default EmptyState;
