import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  Bell, 
  MessageCircle, 
  Briefcase, 
  Settings, 
  Logout,
  Gamepad2,
  Music,
  Sparkles,
  Pin
} from 'lucide-react';

const SidebarNav = () => {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        avatar_url: user.user_metadata?.avatar_url,
        username: user.user_metadata?.name || user.email?.split('@')[0]
      });
    }
  }, [user]);

  return (
    <div className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-slate-900 border-r border-purple-200 dark:border-purple-800 py-4 px-3 flex flex-col z-50">
      {/* Logo and Profile */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Regal Logo" className="h-8 w-auto" />
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Regal</span>
        </div>
        
        {user && (
          <div className="relative group">
            <Avatar className="ring-2 ring-purple-300 dark:ring-purple-500 transition-all duration-300 hover:ring-pink-400">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <div className="py-2 px-4">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                <Button variant="ghost" size="sm" className="w-full justify-start mt-2 hover:bg-purple-100 dark:hover:bg-purple-700/50">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-purple-100 dark:hover:bg-purple-700/50" onClick={signOut}>
                  <Logout className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      
        
          <nav className="flex-1 px-4 space-y-2">
            {[
              { name: 'Home', icon: Home, path: '/home' },
              { name: 'Explore', icon: Search, path: '/explore' },
              { name: 'Notifications', icon: Bell, path: '/notifications' },
              { name: 'Games', icon: Gamepad2, path: '/games' },
              { name: 'Messages', icon: MessageCircle, path: '/messages' },
              { name: 'Professional', icon: Briefcase, path: '/professional' },
              { name: 'Music', icon: Music, path: '/music' },
              { name: 'AI Studio', icon: Sparkles, path: '/ai-studio' },
              { name: 'Pinned', icon: Pin, path: '/pinned' },
            ].map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 shadow-sm'
                      : ''
                  }`
                }
              >
                <item.icon className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.name}</span>
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>
        

      {/* Footer */}
      <div className="mt-auto px-4">
        <p className="text-center text-xs text-gray-500 dark:text-gray-600">
          © {new Date().getFullYear()} Regal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SidebarNav;
