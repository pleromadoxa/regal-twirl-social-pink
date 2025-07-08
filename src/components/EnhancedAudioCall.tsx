
import { Button } from '@/components/ui/button';
import { PhoneOff } from 'lucide-react';

interface EnhancedAudioCallProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

const EnhancedAudioCall = ({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserAvatar,
  onCallEnd, 
  isIncoming = false 
}: EnhancedAudioCallProps) => {
  // Component maintained for compatibility but no call functionality
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex flex-col items-center justify-center">
      <div className="text-center text-white space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Call Unavailable</h2>
          <p className="text-lg opacity-75 mt-2">Audio calling is currently disabled</p>
        </div>

        <Button
          variant="destructive"
          size="lg"
          onClick={onCallEnd}
          className="rounded-full w-14 h-14 p-0"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedAudioCall;
