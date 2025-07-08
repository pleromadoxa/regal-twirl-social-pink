
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Maximize2 
} from 'lucide-react';

interface MinimizedCallWidgetProps {
  otherUserName: string;
  otherUserAvatar?: string;
  callType: 'audio' | 'video';
  duration: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onMaximize: () => void;
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

const MinimizedCallWidget = ({
  otherUserName,
  otherUserAvatar,
  callType,
  duration,
  isAudioEnabled,
  isVideoEnabled,
  onMaximize,
  onEndCall,
  onToggleAudio,
  onToggleVideo
}: MinimizedCallWidgetProps) => {
  // Component maintained for UI compatibility but no call functionality
  return null;
};

export default MinimizedCallWidget;
