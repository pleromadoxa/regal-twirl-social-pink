
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSidebarProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkAdminAccess();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile({
        ...data,
        avatar_url: user.user_metadata?.avatar_url || data?.avatar_url,
        username: data?.username || user.user_metadata?.name || user.email?.split('@')[0]
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({
        avatar_url: user.user_metadata?.avatar_url,
        username: user.user_metadata?.name || user.email?.split('@')[0],
        premium_tier: 'free'
      });
    }
  };

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const isUserAdmin = user.email === 'pleromadoxa@gmail.com';
      setIsAdmin(isUserAdmin);
      
      if (isUserAdmin) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('premium_tier')
          .eq('id', user.id)
          .single();
        
        if (currentProfile?.premium_tier !== 'business') {
          await supabase
            .from('profiles')
            .update({ premium_tier: 'business' })
            .eq('id', user.id);
          
          setProfile(prev => prev ? { ...prev, premium_tier: 'business' } : null);
        }
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    }
  };

  return { profile, isAdmin, setProfile };
};
