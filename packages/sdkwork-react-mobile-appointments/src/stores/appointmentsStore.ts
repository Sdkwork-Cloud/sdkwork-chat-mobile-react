import { create } from 'zustand';
import type { AppointmentsState, Appointment, AppointmentStatus } from '../types';
import { appointmentService } from '../services/AppointmentService';

interface AppointmentsStore extends AppointmentsState {
  loadAppointments: (status?: AppointmentStatus | 'all') => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
}

export const useAppointmentsStore = create<AppointmentsStore>((set) => ({
  appointments: [],
  isLoading: false,
  error: null,

  loadAppointments: async (status = 'all') => {
    set({ isLoading: true, error: null });
    try {
      const appointments = await appointmentService.getAppointments(status);
      set({ appointments, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  cancelAppointment: async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id);
      const appointments = await appointmentService.getAppointments();
      set({ appointments });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
