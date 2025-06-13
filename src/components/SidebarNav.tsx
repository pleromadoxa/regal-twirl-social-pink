
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  Hash,
  Gamepad2,
  Building2,
  MoreHorizontal,
  LogOut,
  Sparkles,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Camera,
  Music,
  Video,
  Heart,
  Star,
  Zap
} from 'lucide-react';

const SidebarNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/home', gradient: 'from-blue-500 to-purple-600' },
    { icon: Search, label: 'Explore', path: '/explore', gradient: 'from-green-500 to-blue-500' },
    { 
      icon: Bell, 
      label: 'Notifications', 
      path: '/notifications', 
      badge: unreadCount > 0 ? unreadCount : undefined,
      gradient: 'from-red-500 to-pink-500'
    },
    { icon: Mail, label: 'Messages', path: '/messages', gradient: 'from-purple-500 to-pink-500' },
    { icon: Bookmark, label: 'Pinned', path: '/pinned', gradient: 'from-yellow-500 to-orange-500' },
    { icon: Hash, label: 'Hashtags', path: '/hashtag/rhapsodyTeeVo', gradient: 'from-cyan-500 to-blue-500' },
    { icon: Gamepad2, label: 'Games', path: '/games', gradient: 'from-indigo-500 to-purple-500' },
    { icon: Building2, label: 'Business', path: '/business-management', gradient: 'from-emerald-500 to-teal-500' },
    { icon: Users, label: 'Professional', path: '/professional', gradient: 'from-violet-500 to-purple-500' },
  ];

  const quickActions = [
    { icon: TrendingUp, label: 'Trending', gradient: 'from-orange-400 to-red-500' },
    { icon: Calendar, label: 'Events', gradient: 'from-blue-400 to-purple-500' },
    { icon: MapPin, label: 'Places', gradient: 'from-green-400 to-blue-500' },
    { icon: Camera, label: 'Photos', gradient: 'from-pink-400 to-rose-500' },
    { icon: Music, label: 'Music', gradient: 'from-purple-400 to-pink-500' },
    { icon: Video, label: 'Videos', gradient: 'from-red-400 to-pink-500' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-purple-200/50 dark:border-purple-800/50 shadow-2xl transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-80'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center justify-between">
            <Link 
              to="/home" 
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <img 
                  src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png"
                  alt="Regal Network" 
                  className="h-12 w-auto transition-transform group-hover:scale-110"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Regal Network
                  </h1>
                  <p className="text-xs text-muted-foreground">Christian Social Network</p>
                </div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-full"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-4">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start gap-4 h-12 relative overflow-hidden group transition-all duration-300 ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-purple-500/25`
                      : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20'
                  } ${isCollapsed ? 'px-3' : 'px-4'}`}
                >
                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <div className={`relative ${isActive(item.path) ? '' : 'group-hover:scale-110 transition-transform'}`}>
                      <item.icon className="w-6 h-6" />
                      {item.badge && (
                        <Badge className="absolute -top-2 -right-2 min-w-[18px] h-5 px-1 text-xs bg-red-500 text-white border-0 shadow-lg">
                          {item.badge > 99 ? '99+' : item.badge}
                        </Badge>
                      )}
                    </div>
                    {!isCollapsed && (
                      <span className="font-medium truncate">{item.label}</span>
                    )}
                  </div>
                  {isActive(item.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="mt-8 px-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-16 flex-col gap-1 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 group"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${action.gradient} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-200/50 dark:border-purple-800/50 space-y-3">
          {/* User Profile */}
          <Link to={`/profile/${user.id}`}>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm truncate">Profile</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
            </Button>
          </Link>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link to="/settings" className="flex-1">
              <Button 
                variant="ghost" 
                size={isCollapsed ? "icon" : "default"}
                className="w-full hover:bg-purple-100 dark:hover:bg-purple-900/20"
              >
                <Settings className="w-5 h-5" />
                {!isCollapsed && <span className="ml-2">Settings</span>}
              </Button>
            </Link>
            
            <ThemeToggle />
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              className="hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Premium Badge */}
          {!isCollapsed && (
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-semibold">Go Premium</span>
                </div>
                <p className="text-xs opacity-90">Unlock exclusive features</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
