
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MessageThreadCallManagerProps {
  conversationId: string;
  currentUserId?: string;
  otherParticipant: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  onCallStart: (type: 'audio' | 'video') => void;
  children: (initiateCall: (type: 'audio' | 'video') => void) => React.ReactNode;
}

const MessageThreadCallManager = ({ 
  conversationId, 
  currentUserId, 
  otherParticipant, 
  onCallStart,
  children 
}: MessageThreadCallManagerProps) => {
  const { toast } = useToast();

  const initiateCall = async (callType: 'audio' | 'video') => {
    // Placeholder - calls are disabled
    toast({
      title: "Feature unavailable",
      description: "Calling feature is currently disabled",
      variant: "destructive"
    });
  };

  return <>{children(initiateCall)}</>;
};

export default MessageThreadCallManager;
