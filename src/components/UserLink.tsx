
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserLinkProps {
  userId: string;
  children?: ReactNode;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  className?: string;
  showAvatar?: boolean;
}

const UserLink = ({ 
  userId, 
  children, 
  username, 
  displayName, 
  avatarUrl, 
  className = '',
  showAvatar = false
}: UserLinkProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  if (showAvatar) {
    return (
      <Avatar 
        className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={handleClick}
      >
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          {displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <span 
      className={`cursor-pointer hover:text-purple-600 hover:underline transition-colors ${className}`}
      onClick={handleClick}
    >
      {children || displayName || username || 'Unknown User'}
    </span>
  );
};

export default UserLink;
