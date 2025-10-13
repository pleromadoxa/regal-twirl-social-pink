import EnhancedAudioCall from './EnhancedAudioCall';

interface AudioCallProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

const AudioCall = (props: AudioCallProps) => {
  return <EnhancedAudioCall {...props} />;
  
};

export default AudioCall;