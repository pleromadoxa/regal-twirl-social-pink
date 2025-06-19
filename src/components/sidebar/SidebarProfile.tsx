
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Crown } from 'lucide-react';

interface SidebarProfileProps {
  profile: any;
  isPremiumUser: boolean;
  isAdmin: boolean;
}

const SidebarProfile = ({ profile, isPremiumUser, isAdmin }: SidebarProfileProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  if (!user) return null;

  return (
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
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              @{profile?.username}
            </p>
            {isPremiumUser && (
              <Crown className="w-3 h-3 text-amber-500" />
            )}
            {isAdmin && (
              <Badge variant="secondary" className="text-xs px-1 py-0">Admin</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {profile?.premium_tier === 'business' ? 'Business Plan' : 
             profile?.premium_tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
          </p>
        </div>
      </div>
      
      <div className="space-y-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start hover:bg-gradient-to-r hover:from-purple-100/60 hover:to-pink-100/40 dark:hover:from-purple-700/40 dark:hover:to-pink-700/20 transition-all duration-300 group"
          onClick={handleSettingsClick}
        >
          <Settings className="w-4 h-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default SidebarProfile;
