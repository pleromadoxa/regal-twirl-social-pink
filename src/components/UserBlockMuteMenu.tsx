import React, { useState, useEffect } from 'react';
import { MoreHorizontal, UserX, VolumeX, UserCheck, Volume2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useBlockMute } from '@/hooks/useBlockMute';

interface UserBlockMuteMenuProps {
  userId: string;
  username?: string;
  asMenuItems?: boolean;
}

const UserBlockMuteMenu = ({ userId, username, asMenuItems = false }: UserBlockMuteMenuProps) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { blockUser, unblockUser, muteUser, unmuteUser, checkBlockStatus, checkMuteStatus, loading } = useBlockMute();

  useEffect(() => {
    const checkStatuses = async () => {
      const [blocked, muted] = await Promise.all([
        checkBlockStatus(userId),
        checkMuteStatus(userId)
      ]);
      setIsBlocked(blocked);
      setIsMuted(muted);
    };

    checkStatuses();
  }, [userId]);

  const handleBlock = async () => {
    if (isBlocked) {
      const success = await unblockUser(userId);
      if (success) setIsBlocked(false);
    } else {
      const success = await blockUser(userId);
      if (success) setIsBlocked(true);
    }
  };

  const handleMute = async () => {
    if (isMuted) {
      const success = await unmuteUser(userId);
      if (success) setIsMuted(false);
    } else {
      const success = await muteUser(userId);
      if (success) setIsMuted(true);
    }
  };

  if (asMenuItems) {
    return (
      <>
        <DropdownMenuItem onClick={handleBlock} disabled={loading}>
          {isBlocked ? (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Unblock {username || 'user'}
            </>
          ) : (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Block {username || 'user'}
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleMute} disabled={loading}>
          {isMuted ? (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Unmute {username || 'user'}
            </>
          ) : (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              Mute {username || 'user'}
            </>
          )}
        </DropdownMenuItem>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleBlock} disabled={loading}>
          {isBlocked ? (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Unblock {username || 'user'}
            </>
          ) : (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Block {username || 'user'}
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleMute} disabled={loading}>
          {isMuted ? (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Unmute {username || 'user'}
            </>
          ) : (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              Mute {username || 'user'}
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserBlockMuteMenu;