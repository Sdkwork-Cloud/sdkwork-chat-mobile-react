
import React, { useState } from 'react';
import { ActionSheet, Icon, Navbar, Toast } from '@sdkwork/react-mobile-commons';

type QRStyle = 'classic' | 'dot' | 'liquid';

interface MyQRCodePageProps {
  t?: (key: string) => string;
  type?: 'user' | 'group';
  name?: string;
  onBack?: () => void;
}

export const MyQRCodePage: React.FC<MyQRCodePageProps> = ({
  t,
  type = 'user',
  name,
  onBack,
}) => {
  const [style, setStyle] = useState<QRStyle>('classic');
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );
  const displayName = name || tr('qrcode.default_name', 'AI User');

  const cycleStyle = () => {
    setStyle((prev) => {
      if (prev === 'classic') return 'dot';
      if (prev === 'dot') return 'liquid';
      return 'classic';
    });
  };

  const handleMore = async () => {
    const result = await ActionSheet.showActions({
      title: tr('qrcode.actions_title', 'QR Actions'),
      actions: [
        { text: tr('qrcode.switch_style', 'Switch Style'), key: 'style' },
        { text: tr('qrcode.save', 'Save QR Code'), key: 'save' },
        { text: tr('qrcode.share', 'Share'), key: 'share' },
      ],
    });
    if (!result?.key) return;
    if (result.key === 'style') {
      cycleStyle();
      Toast.success(tr('qrcode.style_switched', 'QR style changed'));
      return;
    }
    if (result.key === 'save') {
      Toast.success(tr('qrcode.saved', 'Saved to album'));
      return;
    }
    if (result.key === 'share') {
      Toast.success(tr('qrcode.shared', 'Share panel opened'));
    }
  };

  const getPattern = () => {
    switch(style) {
      case 'liquid': return 'radial-gradient(circle, var(--text-primary) 30%, transparent 31%)';
      case 'dot': return 'radial-gradient(var(--text-primary) 2px, transparent 0)';
      case 'classic': default: return 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjwvc3ZnPg==")';
    }
  };

  const getSize = () => {
    switch(style) {
      case 'liquid': return '16px 16px';
      case 'dot': return '8px 8px';
      case 'classic': default: return '12px 12px';
    }
  };

  const getCornerRadius = () => style === 'liquid' ? '50%' : '0';

  const avatarUrl = type === 'group' 
    ? 'https://api.dicebear.com/7.x/initials/svg?seed=GP' 
    : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

  const styleLabelMap: Record<QRStyle, string> = {
    classic: tr('qrcode.styles.classic', 'Classic'),
    dot: tr('qrcode.styles.dot', 'Dot'),
    liquid: tr('qrcode.styles.liquid', 'Liquid'),
  };

  const title = type === 'group' ? tr('qrcode.group_title', 'Group QR Code') : tr('qrcode.title', 'My QR Code');
  const desc = type === 'group'
    ? tr('qrcode.group_desc', 'Invite friends to join via QR code')
    : tr('qrcode.user_desc', 'Scan this QR code to add me');

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        title={title} 
        onBack={onBack} 
        rightElement={
          <button
            type="button"
            onClick={() => void handleMore()}
            style={{ border: 0, background: 'transparent', padding: '0 8px', display: 'inline-flex', cursor: 'pointer' }}
            aria-label="more qrcode actions"
          >
            <Icon name="more" size={20} />
          </button>
        } 
      />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ 
          width: '100%', maxWidth: '320px', background: 'var(--bg-card)', borderRadius: '12px', 
          padding: '30px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', 
          flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s' 
        }}>
          <div style={{ display: 'flex', width: '100%', marginBottom: '24px', alignItems: 'center' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '8px', 
              backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', 
              marginRight: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{displayName}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {type === 'group'
                  ? tr('qrcode.group_name', 'OpenChat Group')
                  : tr('qrcode.region', 'Shanghai')}
              </div>
            </div>
          </div>
          
          <div style={{ width: '240px', height: '240px', position: 'relative', marginBottom: '10px' }}>
            <div style={{ 
              width: '100%', height: '100%', 
              background: style === 'classic' ? 'var(--text-primary)' : 'transparent', 
              backgroundImage: style === 'dot' || style === 'liquid' ? getPattern() : undefined,
              opacity: 0.85, 
              maskImage: style === 'classic' ? getPattern() : undefined,
              maskSize: getSize(),
              backgroundSize: getSize(),
              imageRendering: 'pixelated',
              transition: 'all 0.3s ease-in-out'
            }} />
            
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', 
              border: '4px solid var(--text-primary)', borderRadius: getCornerRadius(), 
              background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <div style={{ width: '20px', height: '20px', background: 'var(--text-primary)', borderRadius: style === 'liquid' ? '50%' : '0' }} />
            </div>
            <div style={{ 
              position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', 
              border: '4px solid var(--text-primary)', borderRadius: getCornerRadius(), 
              background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <div style={{ width: '20px', height: '20px', background: 'var(--text-primary)', borderRadius: style === 'liquid' ? '50%' : '0' }} />
            </div>
            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', 
              border: '4px solid var(--text-primary)', borderRadius: getCornerRadius(), 
              background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <div style={{ width: '20px', height: '20px', background: 'var(--text-primary)', borderRadius: style === 'liquid' ? '50%' : '0' }} />
            </div>

            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
              background: 'var(--bg-card)', padding: '4px', borderRadius: '4px', 
              boxShadow: '0 0 8px rgba(0,0,0,0.1)' 
            }}>
              <div style={{ width: '32px', height: '32px', backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover' }} />
            </div>
          </div>
          
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '20px', textAlign: 'center' }}>
            {desc}
          </div>
          <button
            type="button"
            onClick={cycleStyle}
            style={{
              marginTop: '14px',
              border: '0.5px solid var(--border-color)',
              background: 'var(--bg-body)',
              color: 'var(--text-primary)',
              borderRadius: '999px',
              padding: '8px 14px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {tr('qrcode.current_style', 'Current style')}: {styleLabelMap[style]} {tr('qrcode.tap_to_switch', 'Tap to switch')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyQRCodePage;
