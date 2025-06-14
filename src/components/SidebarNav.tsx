
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
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Pin, label: 'Pinned', path: '/pinned' },
    { icon: Gamepad2, label: 'Games', path: '/games' },
    { icon: Music, label: 'Music', path: '/music' },
    { icon: Megaphone, label: 'Ads', path: '/ads-manager' },
    { icon: Briefcase, label: 'Professional', path: '/professional' },
    { icon: Building2, label: 'Business', path: '/business-management' },
    { icon: BarChart3, label: 'Analytics', path: '/business-analytics' },
    { icon: FolderOpen, label: 'Directory', path: '/professional-directory' },
  ];

  // Get logo URLs from Supabase storage
  const getLightLogoUrl = () => {
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl('regal-network-light.png');
    return data.publicUrl;
  };

  const getDarkLogoUrl = () => {
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl('regal-network-dark.png');
    return data.publicUrl;
  };

  return (
    <div className="fixed left-0 top-0 w-80 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 border-r border-purple-200 dark:border-purple-800 h-screen flex flex-col z-20">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <img 
                src={theme === 'dark' ? getLightLogoUrl() : getDarkLogoUrl()}
                alt="Regal Network Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('span');
                  fallback.className = 'text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent';
                  fallback.textContent = 'RN';
                  target.parentNode?.appendChild(fallback);
                }}
              />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Regal Network
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`w-full justify-start text-left font-medium ${
                  isActive(item.path) 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-800'
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Profile Section */}
      {user && profile && (
        <div className="p-6 border-t border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>{profile.display_name?.[0] || profile.username?.[0] || 'U'}</AvatarFallback>
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
              className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-800"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <User className="w-4 h-4 mr-3" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-800"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarNav;
