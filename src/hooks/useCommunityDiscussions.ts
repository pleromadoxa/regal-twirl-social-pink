import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CommunityDiscussion {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
  is_liked?: boolean;
}

export interface CommunityDiscussionReply {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
}

export const useCommunityDiscussions = () => {
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: user } = await supabase.auth.getUser();

      const { data, error: fetchError } = await supabase
        .from('community_discussions')
        .select(`
          *,
          profiles!community_discussions_user_id_fkey (
            id,
            username, 
            display_name, 
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Check which discussions the current user has liked
      let discussionsWithLikes = data || [];

      if (user?.user) {
        const discussionIds = (data || []).map(d => d.id);
        if (discussionIds.length > 0) {
          const { data: likes } = await supabase
            .from('community_discussion_likes')
            .select('discussion_id')
            .eq('user_id', user.user.id)
            .in('discussion_id', discussionIds);

          const likedIds = new Set(likes?.map(l => l.discussion_id) || []);
          discussionsWithLikes = (data || []).map(discussion => ({
            ...discussion,
            is_liked: likedIds.has(discussion.id)
          }));
        }
      }

      setDiscussions(discussionsWithLikes);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError('Failed to load community discussions');
      toast({
        title: "Error",
        description: "Failed to load community discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDiscussion = async (content: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('community_discussions')
        .insert([
          {
            user_id: user.user.id,
            content: content.trim()
          }
        ])
        .select(`
          *,
          profiles!community_discussions_user_id_fkey (
            id,
            username, 
            display_name, 
            avatar_url,
            is_verified
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setDiscussions(prev => [{ ...data, is_liked: false }, ...prev]);
        toast({
          title: "Success",
          description: "Discussion posted successfully!",
        });
      }

      return data;
    } catch (err) {
      console.error('Error creating discussion:', err);
      toast({
        title: "Error",
        description: "Failed to post discussion",
        variant: "destructive",
      });
      throw err;
    }
  };

  const toggleLike = async (discussionId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      const discussion = discussions.find(d => d.id === discussionId);
      if (!discussion) return;

      if (discussion.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('community_discussion_likes')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', user.user.id);

        if (error) throw error;

        setDiscussions(prev => prev.map(d => 
          d.id === discussionId 
            ? { ...d, is_liked: false, likes_count: Math.max(0, d.likes_count - 1) }
            : d
        ));
      } else {
        // Like
        const { error } = await supabase
          .from('community_discussion_likes')
          .insert([{
            discussion_id: discussionId,
            user_id: user.user.id
          }]);

        if (error) throw error;

        setDiscussions(prev => prev.map(d => 
          d.id === discussionId 
            ? { ...d, is_liked: true, likes_count: d.likes_count + 1 }
            : d
        ));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  return {
    discussions,
    loading,
    error,
    createDiscussion,
    toggleLike,
    refetch: fetchDiscussions
  };
};