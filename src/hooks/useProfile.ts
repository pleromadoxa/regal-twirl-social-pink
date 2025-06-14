import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  banner_url: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_verified: boolean;
  premium_tier: string | null;
  verification_level: string | null;
  created_at: string;
}

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const targetUserId = userId || user?.id;

  const fetchProfile = async () => {
    if (!targetUserId) return;
    
    try {
      setLoading(true);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Ensure avatar_url is properly handled
      const processedProfile = {
        ...profileData,
        avatar_url: profileData.avatar_url || null,
        display_name: profileData.display_name || null,
        username: profileData.username || null,
        verification_level: profileData.verification_level || null
      };

      setProfile(processedProfile);

      // Check if current user follows this profile
      if (user && userId && user.id !== userId) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .single();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setProfile({ ...profile, ...updates });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user || !userId || user.id === userId) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) {
          console.error('Error unfollowing:', error);
          toast({
            title: "Error",
            description: "Failed to unfollow user",
            variant: "destructive"
          });
          return;
        }

        setIsFollowing(false);
        if (profile) {
          setProfile({
            ...profile,
            followers_count: Math.max(0, profile.followers_count - 1)
          });
        }

        toast({
          title: "Success",
          description: "You have unfollowed this user"
        });
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast({
              title: "Already following",
              description: "You are already following this user",
              variant: "destructive"
            });
            setIsFollowing(true);
            return;
          }
          console.error('Error following:', error);
          toast({
            title: "Error",
            description: "Failed to follow user",
            variant: "destructive"
          });
          return;
        }

        setIsFollowing(true);
        if (profile) {
          setProfile({
            ...profile,
            followers_count: profile.followers_count + 1
          });
        }

        toast({
          title: "Success",
          description: "You are now following this user"
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetUserId, user]);

  return {
    profile,
    loading,
    isFollowing,
    updateProfile,
    toggleFollow,
    refetch: fetchProfile
  };
};
