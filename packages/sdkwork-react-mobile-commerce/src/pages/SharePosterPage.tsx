import React from 'react';
import { Button, Toast } from '@sdkwork/react-mobile-commons';
import { PageScaffold, SectionCard } from '../components';

interface SharePosterPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

const templates = [
  {
    id: 't1',
    gradient: 'linear-gradient(135deg, #2979FF 0%, #00c6ff 100%)',
    accent: 'rgba(255,255,255,0.24)',
  },
  {
    id: 't2',
    gradient: 'linear-gradient(135deg, #FF9C6E 0%, #fa5151 100%)',
    accent: 'rgba(255,255,255,0.22)',
  },
  {
    id: 't3',
    gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    accent: 'rgba(255,255,255,0.18)',
  },
];

export const SharePosterPage: React.FC<SharePosterPageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key);
    if (value && value !== key) return value;
    return fallback;
  };
  const [templateIndex, setTemplateIndex] = React.useState(0);
  const [slogan, setSlogan] = React.useState(
    tr('commerce.share_poster.default_slogan', 'New AI opportunities\nJoin us today')
  );
  const [isEditing, setIsEditing] = React.useState(false);

  const currentTemplate = templates[templateIndex];

  return (
    <PageScaffold title={tr('commerce.share_poster.title', 'Share Poster')} onBack={onBack}>
      <SectionCard style={{ padding: '12px', background: '#f7f8fb' }}>
        <button
          type="button"
          onClick={() => {
            if (!isEditing) setTemplateIndex((prev) => (prev + 1) % templates.length);
          }}
          style={{
            width: '100%',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            background: 'transparent',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              aspectRatio: '3 / 5',
              width: '100%',
              borderRadius: '18px',
              padding: '24px 18px',
              position: 'relative',
              background: currentTemplate.gradient,
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              boxShadow: '0 14px 36px rgba(0, 0, 0, 0.22)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-70px',
                right: '-72px',
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background: currentTemplate.accent,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-90px',
                left: '-80px',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: currentTemplate.accent,
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '13px', opacity: 0.92 }}>
                {tr('commerce.share_poster.plan', 'OpenChat Invitation Plan')}
              </div>
              {isEditing ? (
                <textarea
                  value={slogan}
                  onChange={(event) => setSlogan(event.target.value)}
                  onBlur={() => setIsEditing(false)}
                  autoFocus
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    minHeight: '110px',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: '10px',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.18)',
                    color: '#fff',
                    fontSize: '28px',
                    lineHeight: 1.15,
                    fontWeight: 800,
                    resize: 'none',
                    outline: 'none',
                  }}
                />
              ) : (
                <div
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsEditing(true);
                    Toast.info(tr('commerce.share_poster.editing', 'Entered edit mode'));
                  }}
                  style={{
                    marginTop: '10px',
                    fontSize: '30px',
                    fontWeight: 800,
                    lineHeight: 1.12,
                    whiteSpace: 'pre-wrap',
                    textAlign: 'left',
                    textShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  }}
                >
                  {slogan}
                </div>
              )}
            </div>

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.95)',
                color: '#17203d',
                padding: '14px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#67708f' }}>Invitation Code</div>
                <div style={{ marginTop: '2px', fontSize: '24px', fontWeight: 800, letterSpacing: '2px' }}>
                  AI888
                </div>
              </div>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '10px',
                  background: 'repeating-linear-gradient(45deg, #1f2f5e 0, #1f2f5e 5px, #fff 5px, #fff 10px)',
                  border: '1px solid #d9dfef',
                }}
              />
            </div>
          </div>
        </button>
      </SectionCard>

      <SectionCard>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '10px' }}>
          {tr('commerce.share_poster.choose_template', 'Choose template')}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {templates.map((template, index) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setTemplateIndex(index)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: templateIndex === index ? '2px solid var(--text-primary)' : '2px solid transparent',
                background: template.gradient,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </SectionCard>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          fullWidth
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText('https://openchat.example/invite/AI888');
            Toast.success(tr('commerce.share_poster.link_copied', 'Invitation link copied'));
          }}
        >
          {tr('commerce.share_poster.copy_link', 'Copy link')}
        </Button>
        <Button
          fullWidth
          onClick={() => {
            Toast.success(tr('commerce.share_poster.saved', 'Poster saved to gallery'));
          }}
        >
          {tr('commerce.share_poster.save_poster', 'Save poster')}
        </Button>
      </div>
    </PageScaffold>
  );
};

export default SharePosterPage;

