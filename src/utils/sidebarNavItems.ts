
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
  Music,
  Play,
  Gamepad2,
  Headphones,
  Building2,
  TrendingUp,
  Calendar,
  Users,
  HelpCircle,
  UserPlus,
  Trophy,
  Heart,
  Lock,
  Palette
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
    { name: 'Chat', path: '/messages', icon: MessageCircle },
    { name: 'Circles', path: '/circles', icon: Users },
    { name: 'Explore', path: '/explore', icon: Search },
    { name: 'Regal AI Engine', path: '/regal-ai', icon: Crown, accent: 'from-purple-400 to-pink-500' },
    { name: 'Time Capsules', path: '/time-capsules', icon: Lock },
    { name: 'Mood Boards', path: '/mood', icon: Palette },
    { name: 'Milestones', path: '/friendship-milestones', icon: Heart },
    { name: 'Reels', path: '/reels', icon: Play },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Collaboration', path: '/collaboration', icon: UserPlus },
    { name: 'Challenges', path: '/challenges', icon: Trophy },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Music', path: '/music', icon: Headphones },
    { name: 'Games', path: '/games', icon: Gamepad2 },
  ];

  const premiumItems: NavItem[] = [];
  
  if (hasValidSubscription) {
    premiumItems.push(
      { name: 'Regal AI Studio', path: '/ai-studio', icon: Crown, accent: 'from-yellow-400 to-orange-500' }
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
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return [...baseItems, ...premiumItems, ...settingsItems];
};
