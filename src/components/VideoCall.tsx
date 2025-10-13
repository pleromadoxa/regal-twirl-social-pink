import EnhancedVideoCall from './EnhancedVideoCall';

interface VideoCallProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

const VideoCall = (props: VideoCallProps) => {
  return <EnhancedVideoCall {...props} />;
  
};

export default VideoCall;