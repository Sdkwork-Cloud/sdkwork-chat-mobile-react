import { useEffect } from 'react';
import { useToolsStore } from '../stores/toolsStore';

export function useTools() {
  const scanRecords = useToolsStore((state) => state.scanRecords);
  const isLoading = useToolsStore((state) => state.isLoading);
  const error = useToolsStore((state) => state.error);
  const loadScanRecords = useToolsStore((state) => state.loadScanRecords);
  const addScanRecord = useToolsStore((state) => state.addScanRecord);
  const deleteScanRecord = useToolsStore((state) => state.deleteScanRecord);

  useEffect(() => {
    void loadScanRecords();
  }, [loadScanRecords]);

  return {
    scanRecords,
    isLoading,
    error,
    addScanRecord,
    deleteScanRecord,
  };
}
