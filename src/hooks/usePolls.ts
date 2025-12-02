import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Poll {
  id: string;
  post_id: string;
  question: string;
  options: { text: string; votes: number }[];
  votes_count: number;
  ends_at?: string;
  created_at: string;
  userVote?: number;
}

export const usePolls = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createPoll = async (postId: string, question: string, options: string[], endsAt?: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      const pollOptions = options.map(text => ({ text, votes: 0 }));
      
      const { data, error } = await supabase
        .from('post_polls')
        .insert({
          post_id: postId,
          question,
          options: pollOptions,
          ends_at: endsAt
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Poll created",
        description: "Your poll has been added to the post"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const votePoll = async (pollId: string, optionIndex: number) => {
    if (!user) return false;

    try {
      setLoading(true);
      
      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id, option_index')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('poll_votes')
          .update({ option_index: optionIndex })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: pollId,
            user_id: user.id,
            option_index: optionIndex
          });

        if (error) throw error;
      }

      toast({
        title: "Vote recorded",
        description: "Your vote has been saved"
      });
      
      return true;
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPollByPostId = async (postId: string): Promise<Poll | null> => {
    try {
      const { data: poll, error } = await supabase
        .from('post_polls')
        .select('*')
        .eq('post_id', postId)
        .maybeSingle();

      if (error || !poll) return null;

      // Get vote counts for each option
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', poll.id);

      // Count votes for each option
      const pollOptions = Array.isArray(poll.options) ? poll.options : [];
      const optionVotes = pollOptions.map((option: any, index: number) => ({
        ...option,
        votes: votes?.filter(v => v.option_index === index).length || 0
      }));

      // Get user's vote if logged in
      let userVote;
      if (user) {
        const { data: userVoteData } = await supabase
          .from('poll_votes')
          .select('option_index')
          .eq('poll_id', poll.id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        userVote = userVoteData?.option_index;
      }

      return {
        id: poll.id,
        post_id: poll.post_id,
        question: poll.question,
        options: optionVotes,
        votes_count: poll.votes_count,
        ends_at: poll.ends_at,
        created_at: poll.created_at,
        userVote
      };
    } catch (error) {
      console.error('Error fetching poll:', error);
      return null;
    }
  };

  return {
    createPoll,
    votePoll,
    getPollByPostId,
    loading
  };
};