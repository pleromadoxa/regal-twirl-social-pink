
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
  // Import the regular AudioCall component
  const AudioCall = require('./AudioCall').default;
  
  return (
    <AudioCall
      conversationId={conversationId}
      otherUserId={otherUserId}
      otherUserName={otherUserName}
      otherUserAvatar={otherUserAvatar}
      onCallEnd={onCallEnd}
      isIncoming={isIncoming}
    />
  );
};

export default EnhancedAudioCall;
