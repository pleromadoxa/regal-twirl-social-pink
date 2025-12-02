import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, MapPin, MoreVertical, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PresenceIndicator from './PresenceIndicator';
import { useUserLocationContext } from '@/contexts/UserLocationContext';
import { formatLocation } from '@/services/locationService';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MessageThreadHeaderProps {
  otherParticipant?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  conversation?: {
    id?: string;
    streak_count?: number;
  };
  onAudioCall: () => void;
  onVideoCall: () => void;
  onDeleteChat?: () => Promise<boolean>;
}

const MessageThreadHeader = ({ 
  otherParticipant, 
  conversation,
  onAudioCall, 
  onVideoCall,
  onDeleteChat,
}: MessageThreadHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Safely get location context
  let getUserLocation: ((userId: string) => any) | undefined;
  try {
    const locationContext = useUserLocationContext();
    getUserLocation = locationContext.getUserLocation;
  } catch (error) {
    // Location context not available, continue without location features
    console.log('Location context not available');
  }

  const otherUserLocation = otherParticipant && getUserLocation ? 
    getUserLocation(otherParticipant.id) : null;

  const handleProfileClick = () => {
    if (otherParticipant) {
      navigate(`/profile/${otherParticipant.id}`);
    }
  };

  const handleDeleteChat = async () => {
    if (!onDeleteChat) return;
    
    setIsDeleting(true);
    const success = await onDeleteChat();
    setIsDeleting(false);
    
    if (success) {
      setShowDeleteDialog(false);
    }
  };
  
  return (
    <>
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative flex items-center space-x-3">
              <Avatar 
                className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleProfileClick}
              >
                <AvatarImage src={otherParticipant?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {(otherParticipant?.display_name || otherParticipant?.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <PresenceIndicator userId={otherParticipant?.id} className="absolute -bottom-1 -right-1" />
              
              <div 
                className="flex-1 cursor-pointer hover:bg-accent/20 rounded-md p-1 -m-1 transition-colors"
                onClick={handleProfileClick}
              >
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {otherParticipant?.display_name || otherParticipant?.username}
                </h2>
                <div className="flex items-center gap-2">
                  <PresenceIndicator userId={otherParticipant?.id} showText />
                  {otherUserLocation && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{formatLocation(otherUserLocation)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {otherParticipant && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAudioCall}
                  className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Audio call"
                >
                  <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onVideoCall}
                  className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Video call"
                >
                  <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="More options"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChat}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageThreadHeader;
