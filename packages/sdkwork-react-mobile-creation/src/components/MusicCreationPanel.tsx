import React, { useMemo, useState } from 'react';
import { Switch } from '@sdkwork/react-mobile-commons';
import { CreationPanelShell } from './CreationPanelShell';

interface MusicCreationPayload {
  title: string;
  prompt: string;
  style: string;
  instrumental: boolean;
}

interface MusicCreationPanelProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: MusicCreationPayload) => Promise<void> | void;
}

const styles = ['Pop', 'R&B', 'Rock', 'Electronic', 'Lofi', 'Jazz', '古典', '国风'];

export const MusicCreationPanel: React.FC<MusicCreationPanelProps> = ({ visible, onClose, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState(styles[0]);
  const [instrumental, setInstrumental] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const disabled = useMemo(() => !description.trim() || submitting, [description, submitting]);

  const handleSubmit = async () => {
    if (disabled) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim() || description.slice(0, 16) || '未命名音乐',
        prompt: description,
        style,
        instrumental,
      });
      onClose();
      setDescription('');
      setTitle('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreationPanelShell
      visible={visible}
      title="AI 音乐创作"
      onClose={onClose}
      footer={(
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          style={{
            width: '100%',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: disabled ? 'var(--text-secondary)' : 'white',
            background: disabled ? 'var(--bg-cell-active)' : 'var(--primary-gradient)',
          }}
        >
          {submitting ? '正在生成...' : '生成音乐'}
        </button>
      )}
    >
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
        音乐灵感描述
      </label>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="例如：雨夜中的城市爵士，女声，温暖但带一点忧郁..."
        style={{
          width: '100%',
          minHeight: '110px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-body)',
          color: 'var(--text-primary)',
          padding: '12px',
          resize: 'vertical',
          outline: 'none',
          fontSize: '14px',
          marginBottom: '14px',
        }}
      />

      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
        标题（可选）
      </label>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="给作品起个名字"
        style={{
          width: '100%',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          height: '36px',
          background: 'var(--bg-body)',
          color: 'var(--text-primary)',
          padding: '0 10px',
          marginBottom: '14px',
        }}
      />

      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>音乐风格</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {styles.map((option) => {
            const active = style === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setStyle(option)}
                style={{
                  border: active ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                  background: active ? 'rgba(41,121,255,0.12)' : 'var(--bg-card)',
                  color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderRadius: '12px',
          border: '0.5px solid var(--border-color)',
          background: 'var(--bg-body)',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>纯音乐模式</span>
        <Switch checked={instrumental} onChange={setInstrumental} />
      </div>
    </CreationPanelShell>
  );
};

export default MusicCreationPanel;
