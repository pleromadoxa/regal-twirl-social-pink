
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionStatus = (isAdmin: boolean, setProfile: (profile: any) => void) => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user, isAdmin]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    // Skip subscription checks for admin users - they stay on business plan
    if (isAdmin) {
      return;
    }
    
    try {
      // Check subscription status from subscribers table
      const { data: subscription } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscription && subscription.subscribed) {
        const now = new Date();
        const subscriptionEnd = new Date(subscription.subscription_end);
        
        if (subscriptionEnd > now) {
          setSubscriptionData(subscription);
          
          // Update profile premium tier based on active subscription
          const tierMapping = {
            'Pro': 'pro',
            'Business': 'business'
          };
          const premiumTier = tierMapping[subscription.subscription_tier] || 'pro';
          
          await supabase
            .from('profiles')
            .update({ premium_tier: premiumTier })
            .eq('id', user.id);
            
          setProfile(prev => prev ? { 
            ...prev, 
            premium_tier: premiumTier 
          } : null);
        } else {
          // Subscription expired, reset to free
          await supabase
            .from('profiles')
            .update({ premium_tier: 'free' })
            .eq('id', user.id);
            
          setProfile(prev => prev ? { ...prev, premium_tier: 'free' } : null);
        }
      } else {
        // No subscription, ensure they're on free tier
        await supabase
          .from('profiles')
          .update({ premium_tier: 'free' })
          .eq('id', user.id);
          
        setProfile(prev => prev ? { ...prev, premium_tier: 'free' } : null);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  return { subscriptionData };
};
