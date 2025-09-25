import { useState } from 'react';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface MessageReactionsProps {
  messageId: string;
  className?: string;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '💯'];

const MessageReactions = ({ messageId, className = '' }: MessageReactionsProps) => {
  const { user } = useAuth();
  const { reactions, addReaction, getReactionCounts, getUserReactions, isLoading } = useMessageReactions(messageId);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const reactionCounts = getReactionCounts();
  const userReactions = getUserReactions(user?.id || '');

  const handleReactionClick = async (emoji: string) => {
    if (!user?.id || isLoading) return;
    
    await addReaction(emoji, user.id);
    setShowReactionPicker(false);
  };

  const hasReactions = Object.keys(reactionCounts).length > 0;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Display existing reactions */}
      {hasReactions && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <Badge
              key={emoji}
              variant={userReactions.includes(emoji) ? "default" : "secondary"}
              className="cursor-pointer text-xs px-2 py-1 hover:scale-105 transition-transform bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => handleReactionClick(emoji)}
            >
              <span className="text-sm">{emoji}</span> <span className="ml-1">{count}</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Reaction picker */}
      <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Add reaction"
          >
            <span className="text-xs">😊</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2 bg-white dark:bg-gray-800 border shadow-lg z-50" 
          align="start"
          sideOffset={5}
        >
          <div className="grid grid-cols-4 gap-2">
            {REACTION_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:scale-110 transition-transform hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleReactionClick(emoji)}
                disabled={isLoading}
              >
                <span className="text-base">{emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;