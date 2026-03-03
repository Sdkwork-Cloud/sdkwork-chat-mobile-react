import React, { useState } from 'react';
import { ScanLine, QrCode, Barcode, X } from 'lucide-react';
import { useTools } from '../hooks/useTools';

interface ScanPageProps {
  onBack?: () => void;
  onScanResult?: (result: string) => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({ onBack, onScanResult }) => {
  const { scanRecords, addScanRecord } = useTools();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    
    // Simulate scanning
    setTimeout(() => {
      const mockResult = 'https://example.com/product/' + Math.random().toString(36).substring(7);
      setScanResult(mockResult);
      setIsScanning(false);
      addScanRecord(mockResult, 'qrcode');
      onScanResult?.(mockResult);
    }, 2000);
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium">扫一扫</span>
        <div className="w-6" />
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center" onClick={handleScan}>
        <div className="relative w-64 h-64 border-2 border-white/30 rounded-lg">
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500" />
          
          {/* Scan line */}
          {isScanning && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500 animate-pulse" 
                 style={{ animation: 'scan 2s linear infinite' }} />
          )}
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ScanLine className="w-16 h-16 text-white/50" />
          </div>
        </div>
      </div>

      {/* Result */}
      {scanResult && (
        <div className="absolute bottom-24 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-xl">
          <div className="text-sm text-gray-500">扫描结果</div>
          <div className="text-gray-900 dark:text-white font-medium mt-1">{scanResult}</div>
        </div>
      )}

      {/* History */}
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl p-4 max-h-48 overflow-y-auto">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">扫描历史</div>
        {scanRecords.map((record) => (
          <div key={record.id} className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700">
            {record.type === 'qrcode' ? <QrCode className="w-4 h-4 text-gray-400" /> : <Barcode className="w-4 h-4 text-gray-400" />}
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">{record.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanPage;
