
import { useEffect } from 'react';
import { useUserPresence } from '@/hooks/useUserPresence';

interface PresenceIndicatorProps {
  userId: string;
  showText?: boolean;
  className?: string;
}

const PresenceIndicator = ({ userId, showText = false, className = "" }: PresenceIndicatorProps) => {
  const { fetchPresenceData, getUserStatus, formatLastSeen } = useUserPresence();

  useEffect(() => {
    if (userId) {
      fetchPresenceData([userId]);
    }
  }, [userId, fetchPresenceData]);

  if (!userId) {
    return null;
  }

  const { isOnline, lastSeen } = getUserStatus(userId);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="relative">
        <div 
          className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
            isOnline ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'
          }`}
        />
        {isOnline && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-pulse opacity-75" />
        )}
      </div>
      {showText && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isOnline ? (
            <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
          ) : lastSeen ? (
            `Last seen ${formatLastSeen(lastSeen)}`
          ) : (
            'Offline'
          )}
        </span>
      )}
    </div>
  );
};

export default PresenceIndicator;
