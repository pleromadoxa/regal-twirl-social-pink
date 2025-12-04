import { 
  Home,
  Search,
  MessageCircle,
  Bell,
  Settings,
  Crown,
  Shield,
  BarChart3,
  Briefcase,
  Headphones,
  Building2,
  TrendingUp,
  Calendar,
  Users,
  Trophy,
  Sparkles,
  Play,
  Gamepad2
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: any;
  accent?: string;
}

interface GetSidebarNavItemsProps {
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
}: GetSidebarNavItemsProps): NavItem[] => {
  // Merged and organized navigation items
  const baseItems: NavItem[] = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Chat', path: '/messages', icon: MessageCircle },
    { name: 'Circles', path: '/circles', icon: Users },
    { name: 'Explore', path: '/explore', icon: Search },
    { name: 'Regal AI', path: '/regal-ai', icon: Crown, accent: 'from-purple-400 to-pink-500' },
    { name: 'Create', path: '/mood', icon: Sparkles }, // Merged: Mood Boards, Time Capsules, Milestones
    { name: 'Reels', path: '/reels', icon: Play },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Challenges', path: '/challenges', icon: Trophy },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Entertainment', path: '/music', icon: Headphones }, // Merged: Music & Games
  ];

  const premiumItems: NavItem[] = [];
  
  if (hasValidSubscription) {
    premiumItems.push(
      { name: 'AI Studio', path: '/ai-studio', icon: Crown, accent: 'from-yellow-400 to-orange-500' }
    );
  }

  if (isBusinessUser || hasBusinessPages) {
    premiumItems.push(
      { name: 'Business', path: '/business', icon: Building2, accent: 'from-blue-500 to-indigo-600' },
      { name: 'Analytics', path: '/business-analytics', icon: BarChart3 },
      { name: 'Management', path: '/business-management', icon: Briefcase },
      { name: 'Ads', path: '/ads-manager', icon: TrendingUp }
    );
  }

  if (isAdmin) {
    premiumItems.push(
      { name: 'Admin', path: '/admin', icon: Shield, accent: 'from-red-500 to-pink-600' }
    );
  }

  const settingsItems: NavItem[] = [
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return [...baseItems, ...premiumItems, ...settingsItems];
};
