import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Appointment, AppointmentStatus, IAppointmentService } from '../types';

const TAG = 'AppointmentService';

const createSeedAppointments = (now: number): Partial<Appointment>[] => [
  {
    id: 'apt_hotel_01',
    providerName: 'Aegis Travel Hotel',
    serviceName: 'Deluxe Suite (2 nights)',
    providerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AT&backgroundColor=00695c',
    startTime: now + 86400000 * 10,
    endTime: now + 86400000 * 12,
    location: 'No.36 Riverside Road',
    status: 'confirmed',
    type: 'hotel',
    bookingId: 'HT-29910022',
    ticketCode: '88291029',
    price: 4888,
  },
  {
    id: 'apt_medical_01',
    providerName: 'Harmony Hospital',
    serviceName: 'Dental Checkup',
    providerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HS&backgroundColor=00a0e9',
    startTime: now + 86400000,
    location: 'No.12 Health Street',
    status: 'confirmed',
    type: 'medical',
    bookingId: 'Y20240522001',
    ticketCode: '8829 1029 3341',
    price: 50,
  },
];

class AppointmentServiceImpl extends AbstractStorageService<Appointment> implements IAppointmentService {
  protected STORAGE_KEY = 'sys_appointments_v5';
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0) {
      const now = this.deps.clock.now();
      this.cache = createSeedAppointments(now).map((item) => ({
        ...item,
        createTime: now,
        updateTime: now,
      })) as Appointment[];
      await this.commit();
      this.deps.logger.info(TAG, 'Seed appointments initialized');
    }
  }

  async getAppointments(status: AppointmentStatus | 'all' = 'all'): Promise<Appointment[]> {
    const page = await this.findAll({
      sort: { field: 'startTime', order: 'asc' },
    });
    const list = page.content || [];

    if (status === 'all') {
      return list;
    }

    return list.filter((a) => a.status === status);
  }

  async cancelAppointment(id: string): Promise<void> {
    const appointment = await this.findById(id);
    if (appointment && (appointment.status === 'pending' || appointment.status === 'confirmed')) {
      appointment.status = 'cancelled';
      appointment.updateTime = this.deps.clock.now();
      await this.save(appointment);
      this.deps.logger.info(TAG, 'Appointment cancelled', { id });
    }
  }
}

export function createAppointmentService(_deps?: ServiceFactoryDeps): IAppointmentService {
  return new AppointmentServiceImpl(_deps);
}

export const appointmentService: IAppointmentService = createAppointmentService();
