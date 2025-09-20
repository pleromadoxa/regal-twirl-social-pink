import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePolls, Poll } from '@/hooks/usePolls';
import { formatDistanceToNow } from 'date-fns';

interface PollComponentProps {
  postId: string;
}

const PollComponent = ({ postId }: PollComponentProps) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const { votePoll, getPollByPostId, loading } = usePolls();

  useEffect(() => {
    const fetchPoll = async () => {
      const pollData = await getPollByPostId(postId);
      setPoll(pollData);
    };

    fetchPoll();
  }, [postId]);

  const handleVote = async (optionIndex: number) => {
    if (!poll) return;

    const success = await votePoll(poll.id, optionIndex);
    if (success) {
      // Refetch poll data to get updated results
      const updatedPoll = await getPollByPostId(postId);
      setPoll(updatedPoll);
    }
  };

  if (!poll) return null;

  const isExpired = poll.ends_at && new Date(poll.ends_at) < new Date();
  const hasVoted = poll.userVote !== undefined;
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="border border-border rounded-lg p-4 mt-3 bg-card">
      <h4 className="font-medium text-foreground mb-3">{poll.question}</h4>
      
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isUserChoice = poll.userVote === index;
          
          return (
            <div key={index} className="space-y-1">
              <Button
                variant={hasVoted || isExpired ? "ghost" : "outline"}
                className={`w-full text-left justify-start h-auto p-3 ${
                  isUserChoice ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => handleVote(index)}
                disabled={loading || hasVoted || isExpired}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="flex-1">{option.text}</span>
                  {(hasVoted || isExpired) && (
                    <span className="text-sm text-muted-foreground ml-2">
                      {option.votes} votes ({percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </Button>
              
              {(hasVoted || isExpired) && (
                <Progress value={percentage} className="h-1" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
        <span>{totalVotes} total votes</span>
        {poll.ends_at && (
          <span>
            {isExpired 
              ? 'Poll ended'
              : `Ends ${formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}`
            }
          </span>
        )}
      </div>
    </div>
  );
};

export default PollComponent;