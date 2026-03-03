import type { BaseEntity } from '@sdkwork/react-mobile-core';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ServiceType = 'medical' | 'dining' | 'beauty' | 'hotel' | 'transport' | 'sports' | 'course' | 'general';

export interface Appointment extends BaseEntity {
  providerName: string;
  serviceName: string;
  providerAvatar: string;
  startTime: number;
  endTime?: number;
  location: string;
  status: AppointmentStatus;
  type: ServiceType;
  bookingId: string;
  ticketCode: string;
  price?: number;
  meta?: Record<string, string | number>;
  notes?: string;
}

export interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}

export interface IAppointmentService {
  getAppointments(status?: AppointmentStatus | 'all'): Promise<Appointment[]>;
  cancelAppointment(id: string): Promise<void>;
}
