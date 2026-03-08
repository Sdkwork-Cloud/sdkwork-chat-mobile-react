import React from 'react';
import { Flashlight, FlashlightOff, Image, ScanLine, X } from 'lucide-react';
import { useTools } from '../hooks/useTools';
import {
  getCapacitorRuntimeFromWindow,
  resolveScanFlashlightCapability,
  toggleScanFlashlight,
  type CapacitorRuntimeLike,
} from './scanFlashlightSupport';
import './ScanPage.css';

interface ScanPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onScanResult?: (result: string) => void;
}

const SCAN_DELAY_MS = 1200;
const MOCK_SCAN_RESULTS = [
  'sdkwork://qr/entity?type=user&id=u_1001&name=Alice',
  'sdkwork://qr/entity?type=group&id=g_core&name=SDKWORK-Core',
  'sdkwork://qr/entity?type=agent&id=omni_core&name=Omni-Core',
];

export const ScanPage: React.FC<ScanPageProps> = ({ t, onBack, onScanResult }) => {
  const { addScanRecord } = useTools();
  const runtimeRef = React.useRef<CapacitorRuntimeLike | undefined>(undefined);
  const scanTimerRef = React.useRef<number | null>(null);
  const mockScanIndexRef = React.useRef(0);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<string | null>(null);
  const [supportsFlashlight, setSupportsFlashlight] = React.useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = React.useState(false);
  const [isFlashlightBusy, setIsFlashlightBusy] = React.useState(false);
  const [statusText, setStatusText] = React.useState('');

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (!value || value === key) return fallback;
      return value;
    },
    [t]
  );

  React.useEffect(() => {
    const runtime = getCapacitorRuntimeFromWindow();
    runtimeRef.current = runtime;
    const capability = resolveScanFlashlightCapability(runtime);
    setSupportsFlashlight(capability.supported);
    setStatusText(tr('tools.scan.tap_to_scan', '轻触扫码框开始识别'));
  }, [tr]);

  React.useEffect(() => () => {
    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  }, []);

  const handleClose = React.useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.history.pushState({}, '', '/discover');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [onBack]);

  const handleScan = React.useCallback(() => {
    if (isScanning) return;

    setIsScanning(true);
    setScanResult(null);
    setStatusText(tr('tools.scan.scanning', '正在识别...'));

    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
    }

    scanTimerRef.current = window.setTimeout(() => {
      const index = mockScanIndexRef.current % MOCK_SCAN_RESULTS.length;
      const mockResult = MOCK_SCAN_RESULTS[index];
      mockScanIndexRef.current += 1;
      setScanResult(mockResult);
      setIsScanning(false);
      setStatusText(tr('tools.scan.tap_to_scan', '轻触扫码框开始识别'));
      void addScanRecord(mockResult, 'qrcode');
      onScanResult?.(mockResult);
    }, SCAN_DELAY_MS);
  }, [addScanRecord, isScanning, onScanResult, tr]);

  const handleOpenAlbum = React.useCallback(() => {
    setStatusText(tr('tools.scan.album_coming_soon', '相册识别即将上线'));
  }, [tr]);

  const handleToggleFlashlight = React.useCallback(async () => {
    if (isFlashlightBusy) return;

    setIsFlashlightBusy(true);
    try {
      const next = await toggleScanFlashlight(runtimeRef.current, isFlashlightOn);
      setIsFlashlightOn(next);
    } catch {
      setSupportsFlashlight(false);
      setIsFlashlightOn(false);
      setStatusText(tr('tools.scan.flashlight_unsupported', '当前设备不支持手电筒'));
    } finally {
      setIsFlashlightBusy(false);
    }
  }, [isFlashlightBusy, isFlashlightOn, tr]);

  return (
    <div className="scan-page">
      <header className="scan-page__header">
        <button type="button" onClick={handleClose} className="scan-page__close-btn" aria-label="close-scan">
          <X size={22} />
        </button>
        <h1 className="scan-page__title">{tr('tools.scan.title', '扫一扫')}</h1>
        <span className="scan-page__header-placeholder" />
      </header>

      <main className="scan-page__content">
        <button
          type="button"
          className={`scan-page__viewport${isScanning ? ' is-scanning' : ''}`}
          onClick={handleScan}
          aria-label="scan-viewport"
        >
          <span className="scan-page__corner scan-page__corner--lt" />
          <span className="scan-page__corner scan-page__corner--rt" />
          <span className="scan-page__corner scan-page__corner--lb" />
          <span className="scan-page__corner scan-page__corner--rb" />
          <span className="scan-page__scan-line" />
          <span className="scan-page__scan-icon">
            <ScanLine size={40} />
          </span>
        </button>

        <p className="scan-page__tip">{tr('tools.scan.tip', '将二维码/条码放入框内，即可自动扫描')}</p>
        <p className="scan-page__status">{statusText}</p>

        {scanResult && (
          <section className="scan-page__result" aria-live="polite">
            <h2 className="scan-page__result-title">{tr('tools.scan.result', '识别结果')}</h2>
            <p className="scan-page__result-value">{scanResult}</p>
          </section>
        )}
      </main>

      <footer className="scan-page__actions">
        <button type="button" className="scan-page__action" onClick={handleOpenAlbum}>
          <span className="scan-page__action-icon">
            <Image size={20} />
          </span>
          <span className="scan-page__action-text">{tr('tools.scan.album', '相册')}</span>
        </button>

        {supportsFlashlight && (
          <button
            type="button"
            className={`scan-page__action${isFlashlightOn ? ' is-active' : ''}`}
            onClick={handleToggleFlashlight}
            disabled={isFlashlightBusy}
          >
            <span className="scan-page__action-icon">
              {isFlashlightOn ? <FlashlightOff size={20} /> : <Flashlight size={20} />}
            </span>
            <span className="scan-page__action-text">
              {isFlashlightOn
                ? tr('tools.scan.flashlight_on', '已开启')
                : tr('tools.scan.flashlight', '手电筒')}
            </span>
          </button>
        )}
      </footer>
    </div>
  );
};

export default ScanPage;
