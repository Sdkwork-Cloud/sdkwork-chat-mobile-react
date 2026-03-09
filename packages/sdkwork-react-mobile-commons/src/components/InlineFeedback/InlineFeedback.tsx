import React from 'react';

export interface InlineFeedbackProps {
  message: string;
  dismissLabel: string;
  onDismiss?: () => void;
  containerClassName?: string;
  textClassName?: string;
  dismissButtonClassName?: string;
}

export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
  message,
  dismissLabel,
  onDismiss,
  containerClassName,
  textClassName,
  dismissButtonClassName,
}) => {
  if (!message) return null;

  return (
    <div className={containerClassName} role="status" aria-live="polite" aria-atomic="true">
      <span className={textClassName}>{message}</span>
      <button type="button" className={dismissButtonClassName} onClick={onDismiss} aria-label={dismissLabel}>
        <span aria-hidden="true">x</span>
      </button>
    </div>
  );
};

export default InlineFeedback;
