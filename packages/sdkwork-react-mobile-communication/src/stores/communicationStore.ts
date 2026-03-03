import { create } from 'zustand';
import type { CommunicationState, CallRecord } from '../types';
import { callService } from '../services/CallService';

interface CommunicationStore extends CommunicationState {
  loadCallRecords: () => Promise<void>;
  addCallRecord: (record: Partial<CallRecord>) => Promise<void>;
  deleteCallRecord: (id: string) => Promise<void>;
}

export const useCommunicationStore = create<CommunicationStore>((set) => ({
  callRecords: [],
  isLoading: false,
  error: null,

  loadCallRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const callRecords = await callService.getCallRecords();
      set({ callRecords, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addCallRecord: async (record: Partial<CallRecord>) => {
    try {
      await callService.addCallRecord(record);
      const callRecords = await callService.getCallRecords();
      set({ callRecords });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteCallRecord: async (id: string) => {
    try {
      await callService.deleteCallRecord(id);
      const callRecords = await callService.getCallRecords();
      set({ callRecords });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
