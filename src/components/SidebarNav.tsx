
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { getSidebarNavItems } from '@/utils/sidebarNavItems';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { 
  Menu,
  X
} from 'lucide-react';

const SidebarNav = () => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { pages } = useBusinessPages();
  const { hasValidSubscription, subscriptionData } = useSubscriptionStatus(
    user?.email === 'pleromadoxa@gmail.com' || profile?.username === 'pleromadoxa',
    () => {}
  );

  // Check if user is admin
  const isAdmin = user?.email === 'pleromadoxa@gmail.com' || profile?.username === 'pleromadoxa';
  
  // Check subscription tiers
  const isPremiumUser = hasValidSubscription && subscriptionData?.subscription_tier === 'Premium';
  const isBusinessUser = hasValidSubscription && subscriptionData?.subscription_tier === 'Business';
  const hasBusinessPages = pages && pages.length > 0;

  const navItems = getSidebarNavItems({
    hasValidSubscription,
    isPremiumUser,
    isBusinessUser,
    hasBusinessPages,
    subscriptionData,
    isAdmin
  });

  // Handle mobile responsive behavior
  const sidebarWidth = isMobile ? (isCollapsed ? 'w-0' : 'w-80') : (isCollapsed ? 'w-16' : 'w-80');
  const sidebarClass = `fixed left-0 top-0 h-full ${sidebarWidth} bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-purple-200 dark:border-purple-800 z-40 transition-all duration-300 ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'} max-w-[80vw]`;

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </Button>
      )}

      {/* Sidebar */}
      <div className={sidebarClass}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-purple-200 dark:border-purple-800">
            <Link to="/home" className="flex flex-col items-center space-y-2">
              <img 
                src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png"
                alt="Regal Network Logo" 
                className="w-36 h-36 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              />
              {!isCollapsed && (
                <div className="text-center">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Regal Network
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">A Global Christian Social Network</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? item.accent
                            ? `bg-gradient-to-r ${item.accent} text-white shadow-lg`
                            : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                      }`}
                      onClick={() => isMobile && setIsCollapsed(true)}
                    >
                      <div className={`p-2 rounded-lg ${
                        isActive && item.accent
                          ? 'bg-white/20'
                          : isActive
                          ? 'bg-purple-200 dark:bg-purple-800'
                          : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-800'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          isActive && item.accent
                            ? 'text-white'
                            : isActive
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      {!isCollapsed && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          {user && !isCollapsed && (
            <div className="p-4 border-t border-purple-200 dark:border-purple-800">
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                onClick={() => isMobile && setIsCollapsed(true)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.display_name?.[0] || profile?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {profile?.display_name || profile?.username || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{profile?.username || 'username'}
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default SidebarNav;
