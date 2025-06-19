
import { NavLink } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { useNotifications } from '@/contexts/NotificationsContext';
import { getSidebarNavItems } from '@/utils/sidebarNavItems';

interface SidebarNavigationProps {
  hasValidSubscription: boolean;
  isPremiumUser: boolean;
  isBusinessUser: boolean;
  hasBusinessPages: boolean;
  subscriptionData: any;
  isAdmin: boolean;
}

const SidebarNavigation = ({ 
  hasValidSubscription, 
  isPremiumUser, 
  isBusinessUser, 
  hasBusinessPages, 
  subscriptionData, 
  isAdmin 
}: SidebarNavigationProps) => {
  const { unreadCount } = useNotifications();
  
  const navItems = getSidebarNavItems({
    hasValidSubscription,
    isPremiumUser,
    isBusinessUser,
    hasBusinessPages,
    subscriptionData,
    isAdmin
  });

  return (
    <nav className="flex-1 px-4 space-y-2">
      {navItems.map((item) => (
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
  );
};

export default SidebarNavigation;
