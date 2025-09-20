import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, MessageCircle, Bell, User } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Explore', path: '/explore', icon: Search },
    { name: 'Chat', path: '/messages', icon: MessageCircle },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: `/profile/${user?.id}`, icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass backdrop-blur-md border-t border-white/20 pb-safe">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-white/10'
              }`}
            >
              <IconComponent className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;