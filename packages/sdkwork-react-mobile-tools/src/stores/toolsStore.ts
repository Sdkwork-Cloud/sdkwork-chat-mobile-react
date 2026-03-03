import { create } from 'zustand';
import type { ToolsState, ScanRecord, ScanType } from '../types';
import { scanService } from '../services/ScanService';

interface ToolsStore extends ToolsState {
  loadScanRecords: () => Promise<void>;
  addScanRecord: (content: string, type: ScanType) => Promise<void>;
  deleteScanRecord: (id: string) => Promise<void>;
}

export const useToolsStore = create<ToolsStore>((set) => ({
  scanRecords: [],
  isLoading: false,
  error: null,

  loadScanRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const scanRecords = await scanService.getScanRecords();
      set({ scanRecords, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addScanRecord: async (content: string, type: ScanType) => {
    try {
      await scanService.addScanRecord(content, type);
      const scanRecords = await scanService.getScanRecords();
      set({ scanRecords });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteScanRecord: async (id: string) => {
    try {
      await scanService.deleteScanRecord(id);
      const scanRecords = await scanService.getScanRecords();
      set({ scanRecords });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
