
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSidebarProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  useEffect(() => {
    if (user && isAdmin !== null) {
      fetchProfile();
    }
  }, [user, isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const isUserAdmin = user.email === 'pleromadoxa@gmail.com';
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      // Set profile with proper admin tier handling
      const profileData = {
        ...data,
        avatar_url: user.user_metadata?.avatar_url || data?.avatar_url,
        username: data?.username || user.user_metadata?.name || user.email?.split('@')[0],
        premium_tier: isAdmin ? 'business' : (data?.premium_tier || 'free')
      };

      setProfile(profileData);
      
      // Update database if admin user doesn't have business tier
      if (isAdmin && data?.premium_tier !== 'business') {
        await supabase
          .from('profiles')
          .update({ premium_tier: 'business' })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({
        avatar_url: user.user_metadata?.avatar_url,
        username: user.user_metadata?.name || user.email?.split('@')[0],
        premium_tier: isAdmin ? 'business' : 'free'
      });
    }
  };

  return { profile, isAdmin: !!isAdmin, setProfile };
};
