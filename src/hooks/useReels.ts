
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchReels, likeReel, unlikeReel, viewReel, type Reel } from '@/services/reelsService';

export const useReels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const loadReels = async (offset: number = 0) => {
    try {
      setLoading(true);
      const newReels = await fetchReels(20, offset);
      
      if (offset === 0) {
        setReels(newReels);
      } else {
        setReels(prev => [...prev, ...newReels]);
      }
      
      setHasMore(newReels.length === 20);
    } catch (error) {
      console.error('Error loading reels:', error);
      toast({
        title: "Error",
        description: "Failed to load reels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (reelId: string) => {
    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;

    const wasLiked = reel.user_liked;
    
    // Optimistic update
    setReels(prev => prev.map(r => 
      r.id === reelId 
        ? { 
            ...r, 
            user_liked: !wasLiked,
            likes_count: Math.max(0, wasLiked ? r.likes_count - 1 : r.likes_count + 1)
          }
        : r
    ));

    // Perform the actual like/unlike
    const success = wasLiked ? await unlikeReel(reelId) : await likeReel(reelId);
    
    if (!success) {
      // Revert on failure
      setReels(prev => prev.map(r => 
        r.id === reelId 
          ? { 
              ...r, 
              user_liked: wasLiked,
              likes_count: Math.max(0, wasLiked ? r.likes_count + 1 : r.likes_count - 1)
            }
          : r
      ));
      
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const recordView = async (reelId: string) => {
    await viewReel(reelId);
    
    // Update view count optimistically
    setReels(prev => prev.map(r => 
      r.id === reelId 
        ? { ...r, views_count: r.views_count + 1 }
        : r
    ));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadReels(reels.length);
    }
  };

  const refresh = () => {
    loadReels(0);
  };

  useEffect(() => {
    loadReels(0);
  }, []);

  return {
    reels,
    loading,
    hasMore,
    toggleLike,
    recordView,
    loadMore,
    refresh
  };
};
