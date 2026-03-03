import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { Navbar } from '@sdkwork/react-mobile-commons';
import { useAppointments } from '../hooks/useAppointments';

interface AppointmentsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onAppointmentClick?: (appointment: any) => void;
}

const statusColors: Record<string, string> = {
  pending: 'text-yellow-500',
  confirmed: 'text-green-500',
  completed: 'text-gray-500',
  cancelled: 'text-red-500',
};

const statusLabelKeys: Record<string, string> = {
  pending: 'appointment.status.pending',
  confirmed: 'appointment.status.confirmed',
  completed: 'appointment.status.completed',
  cancelled: 'appointment.status.cancelled',
};

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ t, onBack, onAppointmentClick }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { appointments, isLoading } = useAppointments();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar title={tr('appointment.title', '我的预约')} onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            {tr('appointment.empty', '暂无预约记录')}
          </div>
        ) : (
          <div className="space-y-3 p-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => onAppointmentClick?.(apt)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <img src={apt.providerAvatar} alt="" className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">{apt.providerName}</h3>
                      <span className={`text-sm ${statusColors[apt.status]}`}>
                        {tr(statusLabelKeys[apt.status] || 'appointment.status.pending', '待确认')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{apt.serviceName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(apt.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {apt.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
