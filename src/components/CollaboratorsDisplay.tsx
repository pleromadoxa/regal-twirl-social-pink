import React from 'react';
import { Users, Crown, UserCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collaborator } from '@/hooks/useCollaboration';
import UserLink from './UserLink';

interface CollaboratorsDisplayProps {
  collaborators: Collaborator[];
  maxDisplay?: number;
  showLabels?: boolean;
  compact?: boolean;
}

const CollaboratorsDisplay = ({ 
  collaborators, 
  maxDisplay = 3, 
  showLabels = false,
  compact = false 
}: CollaboratorsDisplayProps) => {
  if (collaborators.length === 0) return null;

  const displayedCollaborators = collaborators.slice(0, maxDisplay);
  const remainingCount = collaborators.length - maxDisplay;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'collaborator':
        return <UserCheck className="w-3 h-3 text-blue-500" />;
      case 'contributor':
        return <Users className="w-3 h-3 text-green-500" />;
      default:
        return <Users className="w-3 h-3 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'creator':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'collaborator':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'contributor':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20';
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {displayedCollaborators.map((collaborator) => (
              <Tooltip key={collaborator.id}>
                <TooltipTrigger asChild>
                  <div className={`relative border-2 rounded-full ${getRoleColor(collaborator.role)}`}>
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={collaborator.profiles.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {collaborator.profiles.display_name?.[0]?.toUpperCase() || 
                         collaborator.profiles.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      {getRoleIcon(collaborator.role)}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">
                      {collaborator.profiles.display_name || collaborator.profiles.username}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {collaborator.role}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
            {remainingCount > 0 && (
              <div className="flex items-center justify-center w-6 h-6 bg-muted border-2 border-background rounded-full text-xs font-medium">
                +{remainingCount}
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Collaborators ({collaborators.length})
          </span>
        </div>
      )}
      
      <div className="space-y-2">
        {displayedCollaborators.map((collaborator) => (
          <div key={collaborator.id} className="flex items-center space-x-3">
            <div className={`relative border-2 rounded-full ${getRoleColor(collaborator.role)}`}>
              <UserLink
                userId={collaborator.user_id}
                username={collaborator.profiles.username}
                displayName={collaborator.profiles.display_name}
                avatarUrl={collaborator.profiles.avatar_url}
                showAvatar={true}
                className="w-8 h-8"
              />
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                {getRoleIcon(collaborator.role)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <UserLink
                userId={collaborator.user_id}
                username={collaborator.profiles.username}
                displayName={collaborator.profiles.display_name}
                className="font-medium text-sm hover:text-primary transition-colors"
              >
                {collaborator.profiles.display_name || collaborator.profiles.username}
              </UserLink>
              
              <div className="flex items-center space-x-2 mt-0.5">
                <Badge variant="secondary" className="text-xs capitalize">
                  {collaborator.role}
                </Badge>
                {collaborator.status === 'pending' && (
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="text-sm text-muted-foreground">
            and {remainingCount} more collaborator{remainingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaboratorsDisplay;