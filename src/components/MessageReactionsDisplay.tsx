import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessageReactionsData } from '@/hooks/useMessageReactionsData';
import { cn } from '@/lib/utils';

interface MessageReactionsDisplayProps {
  messageId: string;
  className?: string;
}

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export const MessageReactionsDisplay: React.FC<MessageReactionsDisplayProps> = ({
  messageId,
  className,
}) => {
  const { reactions, toggleReaction, getReactionCount, hasUserReacted } =
    useMessageReactionsData(messageId);
  const [isOpen, setIsOpen] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = 0;
    }
    acc[reaction.emoji]++;
    return acc;
  }, {} as Record<string, number>);

  const handleReactionClick = async (emoji: string) => {
    await toggleReaction(emoji);
    setIsOpen(false);
  };

  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      {/* Display existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, count]) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          onClick={() => handleReactionClick(emoji)}
          className={cn(
            'h-6 px-2 text-xs rounded-full transition-all',
            hasUserReacted(emoji)
              ? 'bg-primary/20 hover:bg-primary/30 border-primary border'
              : 'bg-muted/50 hover:bg-muted'
          )}
        >
          <span className="mr-1">{emoji}</span>
          <span className="text-muted-foreground">{count}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full hover:bg-muted"
          >
            <Smile className="w-4 h-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleReactionClick(emoji)}
                className={cn(
                  'h-8 w-8 p-0 text-lg hover:bg-muted rounded-lg',
                  hasUserReacted(emoji) && 'bg-primary/20'
                )}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
