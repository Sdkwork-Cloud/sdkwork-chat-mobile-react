import React from 'react';

export interface SegmentTabOption {
  id: string;
  label: string;
}

interface SegmentTabsProps {
  value: string;
  options: SegmentTabOption[];
  onChange: (id: string) => void;
}

export const SegmentTabs: React.FC<SegmentTabsProps> = ({ value, options, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        padding: '4px',
        borderRadius: '12px',
        background: 'var(--bg-cell-active)',
        border: '0.5px solid var(--border-color)',
      }}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            style={{
              flex: 1,
              height: '34px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px',
              fontWeight: active ? 700 : 500,
              background: active ? 'var(--bg-card)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: active ? '0 4px 10px rgba(0, 0, 0, 0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentTabs;
