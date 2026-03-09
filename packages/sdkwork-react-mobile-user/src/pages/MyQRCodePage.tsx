import React from 'react';
import { ActionSheet, Icon, Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { buildOpenChatQrLink } from '@sdkwork/react-mobile-core';
import * as QRCode from 'qrcode';
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
  const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState('');
  const [isQrReady, setIsQrReady] = React.useState(false);

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
    return buildOpenChatQrLink({
      type,
      id: entityId || defaultId,
      name: displayName,
    });
  }, [displayName, entityId, type]);

  React.useEffect(() => {
    let cancelled = false;
    setIsQrReady(false);

    void QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111111',
        light: '#FFFFFF',
      },
    })
      .then((value) => {
        if (cancelled) return;
        setQrCodeDataUrl(value);
      })
      .catch((error) => {
        console.error('[MyQRCodePage] Failed to generate QR code:', error);
        if (cancelled) return;
        setQrCodeDataUrl('');
      })
      .finally(() => {
        if (cancelled) return;
        setIsQrReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [qrPayload]);

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

          <div className={`my-qrcode-page__qr-shell my-qrcode-page__qr-shell--${style}`}>
            {isQrReady && qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt={title} className="my-qrcode-page__qr-image" aria-label="qrcode-image" />
            ) : (
              <div className="my-qrcode-page__qr-loading">{tr('qrcode.generating', 'Generating QR...')}</div>
            )}
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
