
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles } from 'lucide-react';

const TopNavigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-purple-200/50 dark:border-purple-700/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24 md:h-28 lg:h-32">
          {/* Logo Section */}
          <Link to="/" className="flex flex-col items-center justify-center min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <img 
                src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png"
                alt="Regal Network Logo" 
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl flex-shrink-0"
              />
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Regal Network
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                A Global Christian Social Network
              </span>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs sm:text-sm px-2 sm:px-3" asChild>
              <Link to="/auth" className="flex items-center gap-1 sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Join Network</span>
                <span className="sm:hidden">Join</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
