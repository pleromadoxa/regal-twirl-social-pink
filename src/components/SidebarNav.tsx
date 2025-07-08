
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  User, 
  MessageSquare, 
  Bell, 
  Search, 
  Settings, 
  Briefcase,
  Music,
  Camera,
  Gamepad2,
  Crown,
  Sparkles
} from 'lucide-react';

const SidebarNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Camera, label: 'Gallery', path: '/gallery' },
    { icon: Camera, label: 'Reels', path: '/reels' },
    { icon: Music, label: 'Music', path: '/music' },
    { icon: Gamepad2, label: 'Games', path: '/games' },
    { icon: Briefcase, label: 'Professional', path: '/professional' },
    { 
      icon: Crown, 
      label: 'Regal AI Engine', 
      path: '/ai-engine',
      premium: true,
      gradient: true
    },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-purple-200 dark:border-purple-800 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-purple-200 dark:border-purple-800">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Love Tap
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connect & Create</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
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
                        ? item.gradient
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive && item.gradient
                        ? 'bg-white/20'
                        : isActive
                        ? 'bg-purple-200 dark:bg-purple-800'
                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-800'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        isActive && item.gradient
                          ? 'text-white'
                          : isActive
                          ? 'text-purple-700 dark:text-purple-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {item.premium && (
                      <div className="flex items-center gap-1">
                        <Sparkles className={`w-4 h-4 ${
                          isActive && item.gradient ? 'text-yellow-300' : 'text-amber-500'
                        }`} />
                        {!isActive && (
                          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-1 rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-t border-purple-200 dark:border-purple-800">
            <Link
              to="/profile"
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.user_metadata?.display_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.user_metadata?.display_name || user?.email || 'User'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{user?.user_metadata?.username || 'username'}
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarNav;
