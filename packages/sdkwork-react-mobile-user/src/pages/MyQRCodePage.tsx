import React from 'react';
import { ActionSheet, Icon, Navbar, Toast } from '@sdkwork/react-mobile-commons';
import './MyQRCodePage.css';

type QRStyle = 'classic' | 'dot' | 'liquid';

interface MyQRCodePageProps {
  t?: (key: string) => string;
  type?: 'user' | 'group' | 'agent';
  entityId?: string;
  name?: string;
  onBack?: () => void;
}

const styleNextMap: Record<QRStyle, QRStyle> = {
  classic: 'dot',
  dot: 'liquid',
  liquid: 'classic',
};

export const MyQRCodePage: React.FC<MyQRCodePageProps> = ({
  t,
  type = 'user',
  entityId,
  name,
  onBack,
}) => {
  const [style, setStyle] = React.useState<QRStyle>('classic');

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const displayName = name || (type === 'agent'
    ? tr('qrcode.default_agent_name', 'AI Agent')
    : tr('qrcode.default_name', 'AI User'));
  const avatarUrl = type === 'group'
    ? 'https://api.dicebear.com/7.x/initials/svg?seed=GROUP'
    : type === 'agent'
      ? 'https://api.dicebear.com/7.x/bottts/svg?seed=AGENT'
      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=USER';

  const styleLabelMap: Record<QRStyle, string> = {
    classic: tr('qrcode.styles.classic', 'Classic'),
    dot: tr('qrcode.styles.dot', 'Dot'),
    liquid: tr('qrcode.styles.liquid', 'Liquid'),
  };

  const cycleStyle = () => {
    setStyle((prev) => styleNextMap[prev]);
  };

  const qrPayload = React.useMemo(() => {
    const defaultId = type === 'group'
      ? 'group_default'
      : type === 'agent'
        ? 'omni_core'
        : 'user_self';
    const query = new URLSearchParams({
      type,
      id: entityId || defaultId,
      name: displayName,
    });
    return `sdkwork://qr/entity?${query.toString()}`;
  }, [displayName, entityId, type]);

  const handleMore = async () => {
    const result = await ActionSheet.showActions({
      title: tr('qrcode.actions_title', 'QR Actions'),
      actions: [
        { text: tr('qrcode.switch_style', 'Switch Style'), key: 'style' },
        { text: tr('qrcode.save', 'Save QR Code'), key: 'save' },
        { text: tr('qrcode.share', 'Share'), key: 'share' },
      ],
      variant: 'user-center',
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

  const title = type === 'group'
    ? tr('qrcode.group_title', 'Group QR Code')
    : type === 'agent'
      ? tr('qrcode.agent_title', 'Agent QR Code')
      : tr('qrcode.title', 'My QR Code');
  const desc = type === 'group'
    ? tr('qrcode.group_desc', 'Invite friends to join via QR code')
    : type === 'agent'
      ? tr('qrcode.agent_desc', 'Scan this QR code to open agent profile')
      : tr('qrcode.user_desc', 'Scan this QR code to add me');

  return (
    <div className="my-qrcode-page user-center-page">
      <Navbar
        title={title}
        onBack={onBack}
        rightElement={(
          <button
            type="button"
            onClick={() => void handleMore()}
            className="my-qrcode-page__more-btn"
            aria-label="more qrcode actions"
          >
            <Icon name="more" size={20} />
          </button>
        )}
      />

      <div className="my-qrcode-page__scroll user-center-page__scroll">
        <div className="my-qrcode-page__card">
          <div className="my-qrcode-page__profile">
            <div className="my-qrcode-page__avatar" style={{ backgroundImage: `url(${avatarUrl})` }} />
            <div className="my-qrcode-page__meta">
              <div className="my-qrcode-page__name">{displayName}</div>
                <div className="my-qrcode-page__sub">
                  {type === 'group'
                    ? tr('qrcode.group_name', 'OpenChat Group')
                    : type === 'agent'
                      ? tr('qrcode.agent_subtitle', 'Official AI Agent')
                      : tr('qrcode.region', 'Shanghai')}
                </div>
              </div>
            </div>

          <div className={`my-qrcode-page__qr my-qrcode-page__qr--${style}`}>
            <div className="my-qrcode-page__finder my-qrcode-page__finder--tl">
              <span />
            </div>
            <div className="my-qrcode-page__finder my-qrcode-page__finder--tr">
              <span />
            </div>
            <div className="my-qrcode-page__finder my-qrcode-page__finder--bl">
              <span />
            </div>
            <div className="my-qrcode-page__center">
              <div className="my-qrcode-page__center-avatar" style={{ backgroundImage: `url(${avatarUrl})` }} />
            </div>
          </div>

          <div className="my-qrcode-page__desc">{desc}</div>
          <div className="my-qrcode-page__payload">{qrPayload}</div>
          <button type="button" onClick={cycleStyle} className="my-qrcode-page__style-btn">
            {tr('qrcode.current_style', 'Current style')}: {styleLabelMap[style]} {tr('qrcode.tap_to_switch', 'Tap to switch')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyQRCodePage;
