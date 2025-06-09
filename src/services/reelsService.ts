
import { supabase } from '@/integrations/supabase/client';

export interface Reel {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  user_liked?: boolean;
}

export interface ReelComment {
  id: string;
  reel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const fetchReels = async (limit: number = 20, offset: number = 0): Promise<Reel[]> => {
  try {
    const { data: reelsData, error } = await supabase
      .from('reels')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    if (!reelsData) return [];

    // Check which reels the current user has liked
    const user = (await supabase.auth.getUser()).data.user;
    let reelsWithLikeStatus = reelsData;

    if (user) {
      const { data: likesData } = await supabase
        .from('reel_likes')
        .select('reel_id')
        .eq('user_id', user.id)
        .in('reel_id', reelsData.map(r => r.id));

      const likedReelIds = new Set(likesData?.map(l => l.reel_id) || []);
      
      reelsWithLikeStatus = reelsData.map(reel => ({
        ...reel,
        user_liked: likedReelIds.has(reel.id)
      }));
    }

    return reelsWithLikeStatus as Reel[];
  } catch (error) {
    console.error('Error fetching reels:', error);
    return [];
  }
};

export const createReel = async (
  title: string,
  description: string,
  videoFile: File,
  thumbnailFile?: File
): Promise<Reel | null> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Upload video file
    const videoExt = videoFile.name.split('.').pop();
    const videoFileName = `${user.id}/${Date.now()}-video.${videoExt}`;
    
    const { error: videoUploadError } = await supabase.storage
      .from('reels-videos')
      .upload(videoFileName, videoFile);

    if (videoUploadError) throw videoUploadError;

    const { data: videoData } = supabase.storage
      .from('reels-videos')
      .getPublicUrl(videoFileName);

    let thumbnailUrl = undefined;
    
    // Upload thumbnail if provided
    if (thumbnailFile) {
      const thumbExt = thumbnailFile.name.split('.').pop();
      const thumbFileName = `${user.id}/${Date.now()}-thumb.${thumbExt}`;
      
      const { error: thumbUploadError } = await supabase.storage
        .from('reels-thumbnails')
        .upload(thumbFileName, thumbnailFile);

      if (!thumbUploadError) {
        const { data: thumbData } = supabase.storage
          .from('reels-thumbnails')
          .getPublicUrl(thumbFileName);
        thumbnailUrl = thumbData.publicUrl;
      }
    }

    // Create video element to get duration
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    
    return new Promise((resolve) => {
      video.onloadedmetadata = async () => {
        const duration = Math.round(video.duration);
        URL.revokeObjectURL(video.src);

        // Create reel record
        const { data: reelData, error: reelError } = await supabase
          .from('reels')
          .insert({
            user_id: user.id,
            title,
            description,
            video_url: videoData.publicUrl,
            thumbnail_url: thumbnailUrl,
            duration
          })
          .select(`
            *,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .single();

        if (reelError) {
          console.error('Error creating reel:', reelError);
          resolve(null);
        } else {
          resolve(reelData as Reel);
        }
      };
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    return null;
  }
};

export const likeReel = async (reelId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return false;

    const { error } = await supabase
      .from('reel_likes')
      .insert({ reel_id: reelId, user_id: user.id });

    return !error;
  } catch (error) {
    console.error('Error liking reel:', error);
    return false;
  }
};

export const unlikeReel = async (reelId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return false;

    const { error } = await supabase
      .from('reel_likes')
      .delete()
      .eq('reel_id', reelId)
      .eq('user_id', user.id);

    return !error;
  } catch (error) {
    console.error('Error unliking reel:', error);
    return false;
  }
};

export const viewReel = async (reelId: string): Promise<void> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    await supabase
      .from('reel_views')
      .upsert({ 
        reel_id: reelId, 
        viewer_id: user.id,
        viewed_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error recording reel view:', error);
  }
};

export const fetchReelComments = async (reelId: string): Promise<ReelComment[]> => {
  try {
    const { data, error } = await supabase
      .from('reel_comments')
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('reel_id', reelId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ReelComment[];
  } catch (error) {
    console.error('Error fetching reel comments:', error);
    return [];
  }
};

export const addReelComment = async (reelId: string, content: string): Promise<ReelComment | null> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('reel_comments')
      .insert({
        reel_id: reelId,
        user_id: user.id,
        content
      })
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data as ReelComment;
  } catch (error) {
    console.error('Error adding reel comment:', error);
    return null;
  }
};
