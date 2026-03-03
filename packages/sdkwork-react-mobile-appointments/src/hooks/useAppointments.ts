import { useEffect } from 'react';
import { useAppointmentsStore } from '../stores/appointmentsStore';
import type { AppointmentStatus } from '../types';

export function useAppointments(status: AppointmentStatus | 'all' = 'all') {
  const appointments = useAppointmentsStore((state) => state.appointments);
  const isLoading = useAppointmentsStore((state) => state.isLoading);
  const error = useAppointmentsStore((state) => state.error);
  const loadAppointments = useAppointmentsStore((state) => state.loadAppointments);
  const cancelAppointment = useAppointmentsStore((state) => state.cancelAppointment);

  useEffect(() => {
    void loadAppointments(status);
  }, [loadAppointments, status]);

  return {
    appointments,
    isLoading,
    error,
    cancelAppointment,
  };
}
