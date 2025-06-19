import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PremiumDialog from "@/components/PremiumDialog";
import { 
  Home, 
  Search, 
  Bell, 
  MessageCircle, 
  Briefcase, 
  Settings,
  Gamepad2,
  Music,
  Sparkles,
  Pin,
  BarChart3,
  Megaphone,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SidebarNav = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { myPages } = useBusinessPages();
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkAdminAccess();
      checkSubscriptionStatus();
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
      
      // Admins automatically get business tier premium
      if (isUserAdmin) {
        await supabase
          .from('profiles')
          .update({ premium_tier: 'business' })
          .eq('id', user.id);
        
        setProfile(prev => prev ? { ...prev, premium_tier: 'business' } : null);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
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
          // Subscription expired, reset to free (unless admin)
          if (!isAdmin) {
            await supabase
              .from('profiles')
              .update({ premium_tier: 'free' })
              .eq('id', user.id);
              
            setProfile(prev => prev ? { ...prev, premium_tier: 'free' } : null);
          }
        }
      } else if (!isAdmin) {
        // No subscription and not admin, ensure they're on free tier
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

  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Check if user has valid subscription or is admin
  const hasValidSubscription = (subscriptionData?.subscribed && subscriptionData?.subscription_end && new Date(subscriptionData.subscription_end) > new Date()) || isAdmin;
  const isPremiumUser = profile?.premium_tier !== 'free';
  const isBusinessUser = profile?.premium_tier === 'business';
  const hasBusinessPages = myPages && myPages.length > 0;

  // Filter navigation items based on user permissions
  const getFilteredNavItems = () => {
    const baseItems = [
      { name: 'Home', icon: Home, path: '/home', accent: 'from-purple-500 to-purple-600' },
      { name: 'Explore', icon: Search, path: '/explore', accent: 'from-blue-500 to-cyan-500' },
      { name: 'Notifications', icon: Bell, path: '/notifications', accent: 'from-orange-500 to-red-500' },
      { name: 'Games', icon: Gamepad2, path: '/games', accent: 'from-green-500 to-emerald-500' },
      { name: 'Messages', icon: MessageCircle, path: '/messages', accent: 'from-pink-500 to-rose-500' },
      { name: 'Music', icon: Music, path: '/music', accent: 'from-violet-500 to-purple-600' },
      { name: 'Pinned', icon: Pin, path: '/pinned', accent: 'from-teal-500 to-cyan-600' },
    ];

    // Professional - only for premium users (paid subscription or admin)
    if (hasValidSubscription && isPremiumUser) {
      baseItems.push({
        name: 'Professional', 
        icon: Briefcase, 
        path: '/professional', 
        accent: 'from-indigo-500 to-blue-600'
      });
    }

    // Business Analytics - only for business tier users with valid subscription or admins
    if (hasBusinessPages && ((hasValidSubscription && subscriptionData?.subscription_tier === 'Business') || isAdmin)) {
      baseItems.push(
        { name: 'Business Analytics', icon: BarChart3, path: '/business-analytics', accent: 'from-teal-500 to-cyan-600' }
      );
    }

    // Ads Manager - only for business tier users with valid subscription or admins
    if (hasBusinessPages && ((hasValidSubscription && subscriptionData?.subscription_tier === 'Business') || isAdmin)) {
      baseItems.push(
        { name: 'Ads Manager', icon: Megaphone, path: '/ads-manager', accent: 'from-red-500 to-pink-600' }
      );
    }

    // AI Studio - only for business tier users with valid subscription or admins
    if ((hasValidSubscription && isBusinessUser && subscriptionData?.subscription_tier === 'Business') || isAdmin) {
      baseItems.push({
        name: 'AI Studio', 
        icon: Sparkles, 
        path: '/ai-studio', 
        accent: 'from-yellow-500 to-orange-500'
      });
    }

    return baseItems;
  };

  return (
    <div className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/20 dark:from-slate-900 dark:via-purple-950/20 dark:to-pink-950/10 border-r border-gradient-to-b from-purple-200 via-purple-300 to-pink-200 dark:from-purple-800 dark:via-purple-700 dark:to-pink-800 py-4 px-3 flex flex-col z-50 shadow-lg shadow-purple-100/50 dark:shadow-purple-900/20">
      {/* Logo and App Name */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
          <img 
            src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png" 
            alt="Regal Network Logo" 
            className="h-16 w-auto mb-3 relative z-10" 
          />
        </div>
        <div>
          <h1 className="font-bold text-xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-purple-300 dark:to-pink-400 mb-1">
            Regal Network
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            A Global Christian Social Network
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-2">
        {getFilteredNavItems().map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-100/60 hover:to-pink-100/40 dark:hover:from-purple-900/40 dark:hover:to-pink-900/20 group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-purple-100 via-purple-50/80 to-pink-100/60 dark:from-purple-900/60 dark:via-purple-800/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 shadow-md shadow-purple-200/50 dark:shadow-purple-900/30 border border-purple-200/50 dark:border-purple-700/50'
                  : ''
              }`
            }
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${item.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`}></div>
            <item.icon className="mr-3 h-6 w-6 group-hover:scale-110 transition-all duration-300 relative z-10 group-hover:drop-shadow-sm" />
            <span className="font-medium relative z-10">{item.name}</span>
            {item.name === 'Notifications' && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-lg shadow-red-200/50 dark:shadow-red-900/30">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Premium Button - Only show for non-premium users and non-admins */}
      {!hasValidSubscription && !isAdmin && (
        <div className="px-4 mb-4">
          <PremiumDialog
            trigger={
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            }
          />
        </div>
      )}

      {/* Profile Section at Bottom */}
      {user && (
        <div className="mt-auto px-4 border-t border-gradient-to-r from-purple-200 via-purple-300 to-pink-200 dark:from-purple-700 dark:via-purple-600 dark:to-pink-700 pt-4 bg-gradient-to-r from-purple-50/30 to-pink-50/20 dark:from-purple-950/30 dark:to-pink-950/20 rounded-t-xl">
          <div 
            className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gradient-to-r hover:from-purple-100/60 hover:to-pink-100/40 dark:hover:from-purple-700/40 dark:hover:to-pink-700/20 rounded-xl p-2 transition-all duration-300 group"
            onClick={handleProfileClick}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <Avatar className="ring-2 ring-gradient-to-r from-purple-300 via-purple-400 to-pink-300 dark:from-purple-500 dark:via-purple-400 dark:to-pink-500 relative z-10 group-hover:scale-105 transition-transform">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold shadow-lg">
                  {profile?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  @{profile?.username}
                </p>
                {isPremiumUser && (
                  <Crown className="w-3 h-3 text-amber-500" />
                )}
                {isAdmin && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">Admin</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {profile?.premium_tier === 'business' ? 'Business Plan' : 
                 profile?.premium_tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start hover:bg-gradient-to-r hover:from-purple-100/60 hover:to-pink-100/40 dark:hover:from-purple-700/40 dark:hover:to-pink-700/20 transition-all duration-300 group"
              onClick={handleSettingsClick}
            >
              <Settings className="w-4 h-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 px-4">
        <p className="text-center text-xs text-gray-500 dark:text-gray-600">
          © {new Date().getFullYear()} Regal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SidebarNav;
