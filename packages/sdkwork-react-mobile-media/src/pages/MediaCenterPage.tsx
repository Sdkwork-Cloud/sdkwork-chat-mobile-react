import React from 'react';

interface AudioItem {
  id: string;
  title: string;
  speaker: string;
  duration: string;
}

interface MediaCenterPageProps {
  onBack?: () => void;
  onOpenChannel?: (channelId: string) => void;
}

const CHANNELS = [
  { id: 'audio', title: 'Listen', description: 'Podcasts, briefings, and spoken content.' },
  { id: 'video', title: 'Video', description: 'Short videos and livestream highlights.' },
  { id: 'playlist', title: 'Collections', description: 'Curated media packages and subscriptions.' },
];

const AUDIOS: AudioItem[] = [
  { id: 'audio-1', title: 'Morning AI Briefing', speaker: 'OpenChat Daily', duration: '08:24' },
  { id: 'audio-2', title: 'Product Thinking Podcast', speaker: 'Design Lab', duration: '23:05' },
  { id: 'audio-3', title: 'Developer Radar', speaker: 'Engineering Weekly', duration: '15:42' },
];

const pageStyle: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--bg-body)',
};

const navStyle: React.CSSProperties = {
  height: 52,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0 12px',
  borderBottom: '0.5px solid var(--border-color)',
  background: 'var(--bg-card)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const backStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: 18,
  width: 28,
  height: 28,
  cursor: 'pointer',
};

const sectionStyle: React.CSSProperties = {
  marginTop: 8,
  background: 'var(--bg-card)',
};

const rowStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  borderBottom: '0.5px solid var(--border-color)',
  background: 'transparent',
  textAlign: 'left',
  padding: '12px',
  cursor: 'pointer',
};

export const MediaCenterPage: React.FC<MediaCenterPageProps> = ({ onBack, onOpenChannel }) => {
  const [playingId, setPlayingId] = React.useState('');

  return (
    <div style={pageStyle}>
      <div style={navStyle}>
        <button type="button" aria-label="back" style={backStyle} onClick={onBack}>
          {'<'}
        </button>
        <div style={titleStyle}>Media Center</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <section style={sectionStyle}>
          {CHANNELS.map((channel) => (
            <button key={channel.id} type="button" style={rowStyle} onClick={() => onOpenChannel?.(channel.id)}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{channel.title}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>{channel.description}</div>
            </button>
          ))}
        </section>

        <section style={sectionStyle}>
          {AUDIOS.map((audio) => {
            const playing = playingId === audio.id;
            return (
              <button
                key={audio.id}
                type="button"
                style={{
                  ...rowStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onClick={() => setPlayingId((prev) => (prev === audio.id ? '' : audio.id))}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{audio.title}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {audio.speaker} - {audio.duration}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: playing ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                  {playing ? 'Playing' : 'Play'}
                </div>
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export const ListenPage = MediaCenterPage;

export default MediaCenterPage;

