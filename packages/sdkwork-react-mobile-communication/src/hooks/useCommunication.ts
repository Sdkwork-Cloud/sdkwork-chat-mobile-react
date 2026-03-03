import { useEffect } from 'react';
import { useCommunicationStore } from '../stores/communicationStore';

export function useCommunication() {
  const callRecords = useCommunicationStore((state) => state.callRecords);
  const isLoading = useCommunicationStore((state) => state.isLoading);
  const error = useCommunicationStore((state) => state.error);
  const loadCallRecords = useCommunicationStore((state) => state.loadCallRecords);
  const addCallRecord = useCommunicationStore((state) => state.addCallRecord);
  const deleteCallRecord = useCommunicationStore((state) => state.deleteCallRecord);

  useEffect(() => {
    void loadCallRecords();
  }, [loadCallRecords]);

  return {
    callRecords,
    isLoading,
    error,
    addCallRecord,
    deleteCallRecord,
  };
}
