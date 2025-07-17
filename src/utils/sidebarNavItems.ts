
import { 
  Home, 
  Search, 
  Bell, 
  MessageCircle, 
  Briefcase, 
  Gamepad2,
  Music,
  Sparkles,
  Pin,
  BarChart3,
  Megaphone,
  Video,
  PlayCircle,
  Compass
} from 'lucide-react';

interface NavItemsConfig {
  hasValidSubscription: boolean;
  isPremiumUser: boolean;
  isBusinessUser: boolean;
  hasBusinessPages: boolean;
  subscriptionData: any;
  isAdmin: boolean;
}

export const getSidebarNavItems = ({
  hasValidSubscription,
  isPremiumUser,
  isBusinessUser,
  hasBusinessPages,
  subscriptionData,
  isAdmin
}: NavItemsConfig) => {
  const baseItems = [
    { name: 'Home', icon: Home, path: '/home', accent: 'from-purple-500 to-purple-600' },
    { name: 'Explore', icon: Compass, path: '/explore', accent: 'from-blue-500 to-cyan-500' },
    { name: 'Reels', icon: Video, path: '/reels', accent: 'from-pink-500 to-red-500' },
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
