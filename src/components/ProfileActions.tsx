
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Video, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { findExistingConversation, createConversation } from '@/services/conversationService';

interface ProfileActionsProps {
  userId: string;
  username?: string;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
}

const ProfileActions = ({ userId, username, isOwnProfile = false, isFollowing = false, onFollowToggle }: ProfileActionsProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMessage = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    if (user.id === userId) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot send a message to your own profile",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if conversation already exists
      let conversation = await findExistingConversation(user.id, userId);
      
      if (!conversation) {
        // Create new conversation
        conversation = await createConversation(user.id, userId);
      }
      
      // Navigate to messages
      navigate('/messages');
      
      toast({
        title: "Success",
        description: `Started conversation with ${username || 'user'}`,
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    toast({
      title: "Voice Call",
      description: "Voice calling feature coming soon!",
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call",
      description: "Video calling feature coming soon!",
    });
  };

  const handleFollow = () => {
    if (onFollowToggle) {
      onFollowToggle();
    }
  };

  // Don't show any buttons on own profile - this is the key fix
  if (isOwnProfile || (user && user.id === userId)) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleMessage}
        disabled={loading}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {loading ? 'Loading...' : 'Message'}
      </Button>
      
      <Button
        onClick={handleCall}
        variant="outline"
        className="border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
      >
        <Phone className="w-4 h-4 mr-2" />
        Call
      </Button>
      
      <Button
        onClick={handleVideoCall}
        variant="outline"
        className="border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
      >
        <Video className="w-4 h-4 mr-2" />
        Video
      </Button>

      <Button
        onClick={handleFollow}
        variant={isFollowing ? "outline" : "default"}
        className={isFollowing 
          ? "border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20" 
          : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        }
      >
        {isFollowing ? <UserCheck className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
};

export default ProfileActions;
