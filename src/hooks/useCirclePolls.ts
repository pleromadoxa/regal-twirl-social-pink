import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CirclePoll {
  id: string;
  circle_id: string;
  creator_id: string;
  question: string;
  options: any;
  ends_at: string | null;
  allow_multiple: boolean;
  anonymous: boolean;
  created_at: string;
}

export const useCirclePolls = (circleId: string | null) => {
  const [polls, setPolls] = useState<CirclePoll[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPolls = async () => {
    if (!circleId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('circle_polls')
        .select('*')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls(data || []);
    } catch (error: any) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [circleId]);

  const createPoll = async (pollData: {
    question: string;
    options: string[];
    ends_at?: string;
    allow_multiple?: boolean;
    anonymous?: boolean;
  }) => {
    if (!circleId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const formattedOptions = pollData.options.map(text => ({ text, votes: 0 }));

      const { data, error } = await supabase
        .from('circle_polls')
        .insert([{
          circle_id: circleId,
          creator_id: user.id,
          question: pollData.question,
          options: formattedOptions,
          ends_at: pollData.ends_at,
          allow_multiple: pollData.allow_multiple || false,
          anonymous: pollData.anonymous || false
        }])
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Poll created successfully" });
      await fetchPolls();
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to create poll",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const vote = async (pollId: string, optionIndex: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_poll_votes')
        .insert([{
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex
        }]);

      if (error) throw error;

      toast({ title: "Vote recorded" });
      await fetchPolls();
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to vote",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    polls,
    loading,
    createPoll,
    vote,
    refetch: fetchPolls
  };
};
