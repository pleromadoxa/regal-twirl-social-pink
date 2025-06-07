
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
    fetchPresenceData([userId]);
  }, [userId, fetchPresenceData]);

  const { isOnline, lastSeen } = getUserStatus(userId);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="relative">
        <div 
          className={`w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        {isOnline && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>
      {showText && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isOnline ? 'Online' : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default PresenceIndicator;
