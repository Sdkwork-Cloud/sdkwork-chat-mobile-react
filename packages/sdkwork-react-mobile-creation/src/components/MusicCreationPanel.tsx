import React, { useMemo, useState } from 'react';
import { ModelSelectorPopup, Switch, type ModelChannelOption } from '@sdkwork/react-mobile-commons';
import { CreationPanelShell } from './CreationPanelShell';

interface MusicCreationPayload {
  title: string;
  prompt: string;
  style: string;
  instrumental: boolean;
  model: string;
  mode: 'simple' | 'custom';
  lyrics?: string;
  stylePrompt?: string;
}

interface MusicCreationPanelProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: MusicCreationPayload) => Promise<void> | void;
}

const styleOptions = ['Pop', 'R&B', 'Rock', 'Electronic', 'Lofi', 'Jazz', 'Classic', 'Folk'];
const modelChannels: ModelChannelOption[] = [
  {
    id: 'suno',
    name: 'Suno',
    icon: 'S',
    models: [{ id: 'suno-v4', name: 'Suno V4' }],
  },
  {
    id: 'udio',
    name: 'Udio',
    icon: 'U',
    models: [{ id: 'udio-v1.5', name: 'Udio v1.5' }],
  },
  {
    id: 'mubert',
    name: 'Mubert',
    icon: 'M',
    models: [{ id: 'mubert-render', name: 'Mubert Render' }],
  },
  {
    id: 'aiva',
    name: 'AIVA',
    icon: 'A',
    models: [{ id: 'aiva-composer', name: 'AIVA Composer' }],
  },
];

export const MusicCreationPanel: React.FC<MusicCreationPanelProps> = ({ visible, onClose, onSubmit }) => {
  const defaultChannel = modelChannels[0];
  const defaultModelId = defaultChannel.models[0]?.id || 'suno-v4';

  const [mode, setMode] = useState<'simple' | 'custom'>('simple');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState(styleOptions[0]);
  const [stylePrompt, setStylePrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [instrumental, setInstrumental] = useState(false);
  const [provider, setProvider] = useState(defaultChannel.id);
  const [model, setModel] = useState(defaultModelId);
  const [submitting, setSubmitting] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);

  const disabled = useMemo(() => {
    if (submitting) return true;
    if (mode === 'simple') return !description.trim();
    if (instrumental) return !stylePrompt.trim() && !description.trim();
    return !stylePrompt.trim() || !lyrics.trim();
  }, [submitting, mode, description, instrumental, stylePrompt, lyrics]);
  const selectedModel = useMemo(
    () => modelChannels.flatMap((channel) => channel.models).find((item) => item.id === model),
    [model],
  );

  const handleSubmit = async () => {
    if (disabled) return;
    setSubmitting(true);
    try {
      const finalPrompt =
        mode === 'simple'
          ? description.trim()
          : (instrumental ? (description.trim() || stylePrompt.trim()) : lyrics.trim());

      await onSubmit({
        title: title.trim() || finalPrompt.slice(0, 16) || 'New Track',
        prompt: finalPrompt,
        style: mode === 'custom' ? (stylePrompt.trim() || style) : style,
        instrumental,
        model: selectedModel?.name || model,
        mode,
        lyrics: mode === 'custom' && !instrumental ? lyrics.trim() || undefined : undefined,
        stylePrompt: mode === 'custom' ? stylePrompt.trim() || undefined : undefined,
      });
      onClose();
      setDescription('');
      setTitle('');
      setLyrics('');
      setStylePrompt('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreationPanelShell
      visible={visible}
      title="AI Music Creation"
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
          {submitting ? 'Generating...' : `Generate Music - ${selectedModel?.name || model}`}
        </button>
      )}
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => setMode('simple')}
          style={{
            flex: 1,
            height: '36px',
            borderRadius: '10px',
            border: mode === 'simple' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
            background: mode === 'simple' ? 'rgba(41,121,255,0.12)' : 'var(--bg-body)',
            color: mode === 'simple' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Simple
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          style={{
            flex: 1,
            height: '36px',
            borderRadius: '10px',
            border: mode === 'custom' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
            background: mode === 'custom' ? 'rgba(41,121,255,0.12)' : 'var(--bg-body)',
            color: mode === 'custom' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Custom
        </button>
      </div>

      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {mode === 'simple' ? 'Song Description' : 'Description (optional)'}
      </label>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder={
          mode === 'simple'
            ? 'Describe style, instruments, mood, tempo, and structure...'
            : 'Optional context for arrangement, vibe, and production...'
        }
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

      {mode === 'custom' && (
        <>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Style of Music
          </label>
          <input
            value={stylePrompt}
            onChange={(event) => setStylePrompt(event.target.value)}
            placeholder="e.g. cinematic pop, female vocal, 128 bpm, wide stereo"
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
        </>
      )}

      {mode === 'custom' && !instrumental && (
        <>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Lyrics
          </label>
          <textarea
            value={lyrics}
            onChange={(event) => setLyrics(event.target.value)}
            placeholder="Write lyrics with verse/chorus structure..."
            style={{
              width: '100%',
              minHeight: '120px',
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
        </>
      )}

      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
        Title (optional)
      </label>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Enter track title"
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
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Style</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {styleOptions.map((option) => {
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
          marginBottom: '14px',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Instrumental only</span>
        <Switch checked={instrumental} onChange={setInstrumental} />
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Model Engine</span>
        <button
          type="button"
          onClick={() => setShowModelSelector(true)}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            height: '36px',
            background: 'var(--bg-body)',
            color: 'var(--text-primary)',
            padding: '0 10px',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          {selectedModel?.name || model}
        </button>
      </label>

      <ModelSelectorPopup
        visible={showModelSelector}
        title="Select Model"
        channels={modelChannels}
        initialChannelId={provider}
        selectedModelId={model}
        onClose={() => setShowModelSelector(false)}
        onSelect={(channelId, modelId) => {
          setProvider(channelId);
          setModel(modelId);
          setShowModelSelector(false);
        }}
      />
    </CreationPanelShell>
  );
};

export default MusicCreationPanel;
