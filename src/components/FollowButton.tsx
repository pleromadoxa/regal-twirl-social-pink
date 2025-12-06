import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton = ({ 
  userId, 
  initialFollowing,
  size = 'sm', 
  className,
  onFollowChange 
}: FollowButtonProps) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, checkFollowStatus, loading } = useFollow();
  const [isFollowing, setIsFollowing] = useState(initialFollowing ?? false);
  const [isChecking, setIsChecking] = useState(initialFollowing === undefined);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user || user.id === userId || initialFollowing !== undefined) {
        setIsChecking(false);
        return;
      }
      
      const status = await checkFollowStatus(userId);
      setIsFollowing(status);
      setIsChecking(false);
    };

    checkStatus();
  }, [userId, user, checkFollowStatus, initialFollowing]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || user.id === userId) return;

    if (isFollowing) {
      const success = await unfollowUser(userId);
      if (success) {
        setIsFollowing(false);
        onFollowChange?.(false);
      }
    } else {
      const success = await followUser(userId);
      if (success) {
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    }
  };

  // Don't show button for own profile
  if (!user || user.id === userId) return null;

  if (isChecking) {
    return (
      <Button size={size} variant="outline" disabled className={className}>
        <Loader2 className="w-3 h-3 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={isFollowing ? "secondary" : "outline"}
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "transition-all",
        isFollowing && "bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-3 h-3 mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-3 h-3 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
