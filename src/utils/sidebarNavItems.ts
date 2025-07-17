
import { 
  Home,
  Search,
  MessageCircle,
  Bell,
  User,
  Settings,
  Crown,
  Shield,
  BarChart3,
  Briefcase,
  Music,
  Hash,
  Image,
  Play,
  Gamepad2,
  Headphones,
  Building2,
  TrendingUp,
  Calendar,
  Users,
  HelpCircle
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
  const baseItems: NavItem[] = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Explore', path: '/explore', icon: Search },
    { name: 'Hashtags', path: '/hashtags', icon: Hash },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'Reels', path: '/reels', icon: Play },
    { name: 'Music', path: '/music', icon: Headphones },
    { name: 'Games', path: '/games', icon: Gamepad2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const premiumItems: NavItem[] = [];
  
  if (hasValidSubscription) {
    premiumItems.push(
      { name: 'AI Studio', path: '/ai-studio', icon: Crown, accent: 'from-yellow-400 to-orange-500' }
    );
  }

  if (isBusinessUser || hasBusinessPages) {
    premiumItems.push(
      { name: 'Professional', path: '/business', icon: Building2, accent: 'from-blue-500 to-indigo-600' },
      { name: 'Business Analytics', path: '/business-analytics', icon: BarChart3 },
      { name: 'Business Management', path: '/business-management', icon: Briefcase },
      { name: 'Ads Manager', path: '/ads-manager', icon: TrendingUp }
    );
  }

  if (isAdmin) {
    premiumItems.push(
      { name: 'Admin Dashboard', path: '/admin', icon: Shield, accent: 'from-red-500 to-pink-600' }
    );
  }

  const settingsItems: NavItem[] = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Support', path: '/support', icon: HelpCircle }
  ];

  return [...baseItems, ...premiumItems, ...settingsItems];
};
