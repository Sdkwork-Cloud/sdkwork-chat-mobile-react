import React from 'react';

/**
 * Legacy placeholder page.
 * The production route uses @sdkwork/react-mobile-agents.
 */
export const AgentsPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--bg-body)',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      This legacy page has been migrated to the package-based agents module.
    </div>
  );
};

export default AgentsPage;
