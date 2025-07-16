
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles } from 'lucide-react';

const TopNavigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-purple-200/50 dark:border-purple-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Slogan */}
          <Link to="/" className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png"
              alt="Regal Network Logo" 
              className="w-16 h-16 rounded-xl"
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-lg text-gray-600 dark:text-gray-300">
                <Heart className="w-4 h-4 text-red-400" />
                <span>A Christian Social Network</span>
                <Heart className="w-4 h-4 text-red-400" />
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
