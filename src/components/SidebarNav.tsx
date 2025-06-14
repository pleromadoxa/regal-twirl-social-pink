import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Home, 
  Search, 
  Bell, 
  MessageCircle, 
  User, 
  Settings, 
  Gamepad2, 
  Pin, 
  Building2, 
  BarChart3, 
  Music,
  Megaphone,
  Briefcase,
  FolderOpen
} from 'lucide-react';

const SidebarNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { 
      icon: Home, 
      label: 'Home', 
      path: '/home',
      gradient: 'from-blue-500 to-purple-600',
      glassColor: 'bg-blue-500/20',
      hoverGlow: 'hover:shadow-blue-500/25'
    },
    { 
      icon: Search, 
      label: 'Explore', 
      path: '/explore',
      gradient: 'from-emerald-500 to-teal-600',
      glassColor: 'bg-emerald-500/20',
      hoverGlow: 'hover:shadow-emerald-500/25'
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      path: '/notifications',
      gradient: 'from-amber-500 to-orange-600',
      glassColor: 'bg-amber-500/20',
      hoverGlow: 'hover:shadow-amber-500/25'
    },
    { 
      icon: MessageCircle, 
      label: 'Messages', 
      path: '/messages',
      gradient: 'from-pink-500 to-rose-600',
      glassColor: 'bg-pink-500/20',
      hoverGlow: 'hover:shadow-pink-500/25'
    },
    { 
      icon: Pin, 
      label: 'Pinned', 
      path: '/pinned',
      gradient: 'from-indigo-500 to-blue-600',
      glassColor: 'bg-indigo-500/20',
      hoverGlow: 'hover:shadow-indigo-500/25'
    },
    { 
      icon: Gamepad2, 
      label: 'Games', 
      path: '/games',
      gradient: 'from-violet-500 to-purple-600',
      glassColor: 'bg-violet-500/20',
      hoverGlow: 'hover:shadow-violet-500/25'
    },
    { 
      icon: Music, 
      label: 'Music', 
      path: '/music',
      gradient: 'from-red-500 to-pink-600',
      glassColor: 'bg-red-500/20',
      hoverGlow: 'hover:shadow-red-500/25'
    },
    { 
      icon: Megaphone, 
      label: 'Ads', 
      path: '/ads-manager',
      gradient: 'from-cyan-500 to-blue-600',
      glassColor: 'bg-cyan-500/20',
      hoverGlow: 'hover:shadow-cyan-500/25'
    },
    { 
      icon: Briefcase, 
      label: 'Professional', 
      path: '/professional',
      gradient: 'from-slate-500 to-gray-600',
      glassColor: 'bg-slate-500/20',
      hoverGlow: 'hover:shadow-slate-500/25'
    },
    { 
      icon: Building2, 
      label: 'Business', 
      path: '/business-management',
      gradient: 'from-teal-500 to-emerald-600',
      glassColor: 'bg-teal-500/20',
      hoverGlow: 'hover:shadow-teal-500/25'
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      path: '/business-analytics',
      gradient: 'from-orange-500 to-red-600',
      glassColor: 'bg-orange-500/20',
      hoverGlow: 'hover:shadow-orange-500/25'
    },
    { 
      icon: FolderOpen, 
      label: 'Directory', 
      path: '/professional-directory',
      gradient: 'from-lime-500 to-green-600',
      glassColor: 'bg-lime-500/20',
      hoverGlow: 'hover:shadow-lime-500/25'
    },
  ];

  return (
    <div className="fixed left-0 top-0 w-80 bg-gradient-to-b from-purple-50/80 to-pink-50/80 dark:from-slate-900/80 dark:to-purple-900/80 backdrop-blur-xl border-r border-purple-200/30 dark:border-purple-800/30 h-screen flex flex-col z-20">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <img 
                  src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png"
                  alt="Regal Network Logo" 
                  className="h-8 w-auto relative z-10"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-md animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Regal Network
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Christian Social Network
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start text-left font-medium relative overflow-hidden group transition-all duration-300 ${
                  isActive(item.path) 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg ${item.hoverGlow} shadow-lg backdrop-blur-sm` 
                    : `text-slate-700 dark:text-slate-300 hover:${item.glassColor} hover:backdrop-blur-sm ${item.hoverGlow} hover:shadow-lg`
                }`}
                onClick={() => navigate(item.path)}
              >
                <div className="absolute inset-0 bg-white/10 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`relative z-10 flex items-center ${
                  isActive(item.path) 
                    ? '' 
                    : `group-hover:bg-gradient-to-r group-hover:${item.gradient} group-hover:bg-clip-text group-hover:text-transparent`
                }`}>
                  <item.icon className={`w-5 h-5 mr-3 transition-all duration-300 group-hover:scale-110 ${
                    isActive(item.path) 
                      ? 'text-white drop-shadow-lg' 
                      : 'group-hover:drop-shadow-md'
                  }`} />
                  <span className="transition-all duration-300 group-hover:translate-x-1">
                    {item.label}
                  </span>
                </div>
                {isActive(item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none"></div>
                )}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Profile Section */}
      {user && profile && (
        <div className="p-6 border-t border-purple-200/30 dark:border-purple-800/30 bg-white/10 dark:bg-black/10 backdrop-blur-md">
          <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
            <Avatar className="w-10 h-10 ring-2 ring-white/30 dark:ring-white/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {profile.display_name?.[0] || profile.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {profile.display_name || profile.username}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{profile.username}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-purple-100/50 dark:hover:bg-purple-800/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md group"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <User className="w-4 h-4 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-600" />
              <span className="transition-all duration-300 group-hover:translate-x-1">Profile</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-purple-100/50 dark:hover:bg-purple-800/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md group"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-4 h-4 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90 group-hover:text-purple-600" />
              <span className="transition-all duration-300 group-hover:translate-x-1">Settings</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarNav;
