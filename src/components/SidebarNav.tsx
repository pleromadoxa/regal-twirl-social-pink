
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  LogOut,
  Gamepad2,
  Music,
  Sparkles,
  Pin
} from 'lucide-react';

const SidebarNav = () => {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfile({
        avatar_url: user.user_metadata?.avatar_url,
        username: user.user_metadata?.name || user.email?.split('@')[0]
      });
    }
  }, [user]);

  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/20 dark:from-slate-900 dark:via-purple-950/20 dark:to-pink-950/10 border-r border-gradient-to-b from-purple-200 via-purple-300 to-pink-200 dark:from-purple-800 dark:via-purple-700 dark:to-pink-800 py-4 px-3 flex flex-col z-50 shadow-lg shadow-purple-100/50 dark:shadow-purple-900/20">
      {/* Logo and App Name */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
          <img 
            src="/lovable-uploads/1c8fdda0-b186-484f-a4d2-052b7342178b.png" 
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
        {[
          { name: 'Home', icon: Home, path: '/home', accent: 'from-purple-500 to-purple-600' },
          { name: 'Explore', icon: Search, path: '/explore', accent: 'from-blue-500 to-cyan-500' },
          { name: 'Notifications', icon: Bell, path: '/notifications', accent: 'from-orange-500 to-red-500' },
          { name: 'Games', icon: Gamepad2, path: '/games', accent: 'from-green-500 to-emerald-500' },
          { name: 'Messages', icon: MessageCircle, path: '/messages', accent: 'from-pink-500 to-rose-500' },
          { name: 'Professional', icon: Briefcase, path: '/professional', accent: 'from-indigo-500 to-blue-600' },
          { name: 'Music', icon: Music, path: '/music', accent: 'from-violet-500 to-purple-600' },
          { name: 'AI Studio', icon: Sparkles, path: '/ai-studio', accent: 'from-yellow-500 to-orange-500' },
          { name: 'Pinned', icon: Pin, path: '/pinned', accent: 'from-teal-500 to-cyan-600' },
        ].map((item) => (
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
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                @{profile?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-gradient-to-r hover:from-purple-100/60 hover:to-pink-100/40 dark:hover:from-purple-700/40 dark:hover:to-pink-700/20 transition-all duration-300 group">
              <Settings className="w-4 h-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-gradient-to-r hover:from-red-100/60 hover:to-orange-100/40 dark:hover:from-red-900/40 dark:hover:to-orange-900/20 transition-all duration-300 group" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
              Logout
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
