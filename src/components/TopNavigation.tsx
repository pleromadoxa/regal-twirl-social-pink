
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import RegalLogo from '@/components/ui/regal-logo';

const TopNavigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-purple-200/50 dark:border-purple-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with correct slogan */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-lg"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-lg">
                    R
                  </span>
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-purple-600 leading-tight">Regal Network</span>
                <span className="text-xs text-gray-500 leading-tight">A Christian Social Network</span>
              </div>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Join Network
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
