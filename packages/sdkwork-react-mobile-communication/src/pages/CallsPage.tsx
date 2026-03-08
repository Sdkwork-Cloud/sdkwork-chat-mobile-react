import React from 'react';
import { Phone, Video, PhoneMissed, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { Page } from '@sdkwork/react-mobile-commons';
import { useCommunication } from '../hooks/useCommunication';

interface CallsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onCallClick?: (record: any) => void;
}

const getIcon = (type: string, status: string) => {
  if (status === 'missed') return <PhoneMissed className="w-5 h-5 text-red-500" />;
  if (status === 'received') return <PhoneIncoming className="w-5 h-5 text-green-500" />;
  if (type === 'video') return <Video className="w-5 h-5 text-blue-500" />;
  return <PhoneOutgoing className="w-5 h-5 text-blue-500" />;
};

const formatDuration = (seconds: number, missedLabel: string): string => {
  if (seconds === 0) return missedLabel;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const CallsPage: React.FC<CallsPageProps> = ({ t, onBack, onCallClick }) => {
  const { callRecords, isLoading } = useCommunication();
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  return (
    <Page
      title={tr('calls.title', 'Call History')}
      onBack={onBack}
      noPadding
      background="var(--bg-body)"
    >
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800">
              {callRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => onCallClick?.(record)}
                  className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
                >
                  <img src={record.contactAvatar} alt="" className="w-10 h-10 rounded-full" />
                  <div className="flex-1 ml-3">
                    <div className="font-medium text-gray-900 dark:text-white">{record.contactName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      {getIcon(record.type, record.status)}
                      <span>{formatDuration(record.duration, tr('calls.missed', 'No Answer'))}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default CallsPage;
