import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMusicLikes = () => {
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserLikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('music_likes')
        .select('track_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user likes:', error);
        return;
      }

      setLikedTracks(new Set(data.map(like => like.track_id)));
    } catch (error) {
      console.error('Error in fetchUserLikes:', error);
    }
  };

  const toggleLike = async (trackId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like tracks",
        variant: "destructive"
      });
      return;
    }

    try {
      const isLiked = likedTracks.has(trackId);

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('music_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('track_id', trackId);

        if (error) {
          console.error('Error unliking track:', error);
          toast({
            title: "Error",
            description: "Failed to unlike track",
            variant: "destructive"
          });
          return;
        }

        setLikedTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });

        toast({
          title: "Track unliked",
          description: "Track removed from your favorites"
        });
      } else {
        // Like
        const { error } = await supabase
          .from('music_likes')
          .insert({
            user_id: user.id,
            track_id: trackId
          });

        if (error) {
          console.error('Error liking track:', error);
          toast({
            title: "Error",
            description: "Failed to like track",
            variant: "destructive"
          });
          return;
        }

        setLikedTracks(prev => new Set([...prev, trackId]));

        toast({
          title: "Track liked",
          description: "Track added to your favorites"
        });
      }
    } catch (error) {
      console.error('Error in toggleLike:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const isTrackLiked = (trackId: string): boolean => {
    return likedTracks.has(trackId);
  };

  useEffect(() => {
    fetchUserLikes();
  }, [user]);

  return {
    isTrackLiked,
    toggleLike,
    refetch: fetchUserLikes
  };
};