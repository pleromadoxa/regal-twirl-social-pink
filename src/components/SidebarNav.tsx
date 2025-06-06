import { Home, Search, MessageCircle, Pin, User, MoreHorizontal, LogOut, UserCheck, Briefcase, Star, TrendingUp, Crown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import BusinessPageDialog from "./BusinessPageDialog";
import PremiumDialog from "./PremiumDialog";
import { useTheme } from "@/contexts/ThemeContext";

const SidebarNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme } = useTheme();

  const navigationItems = [
    { icon: Home, label: "Home", path: "/", active: location.pathname === "/" },
    { icon: Search, label: "Explore", path: "/explore", active: location.pathname === "/explore" },
    { icon: MessageCircle, label: "Messages", path: "/messages", active: location.pathname === "/messages" },
    { icon: Pin, label: "Pinned", path: "/pinned", active: location.pathname === "/pinned" },
    { icon: User, label: "Profile", path: `/profile/${user?.id}`, active: location.pathname.startsWith("/profile") },
    { icon: Settings, label: "Settings", path: "/settings", active: location.pathname === "/settings" }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="w-72 p-6 space-y-4 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 border-r border-purple-200 dark:border-purple-800">
      {/* Logo */}
      <div className="px-3 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Regal
          </h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <InteractiveHoverButton
            key={item.label}
            onClick={() => handleNavigation(item.path)}
            text={item.label}
            className={`w-full justify-start px-6 py-4 text-lg rounded-2xl transition-all duration-200 ${
              item.active 
                ? 'shadow-lg bg-[rgba(170,202,255,0.2)]' 
                : 'opacity-80 hover:opacity-100'
            }`}
          />
        ))}
      </nav>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        {user ? (
          <>
            <InteractiveHoverButton 
              text="Create Post"
              className="w-full py-4 text-lg font-semibold rounded-2xl shadow-lg transition-all duration-200"
            />
            
            {/* Premium Subscription */}
            <PremiumDialog
              trigger={
                <Button 
                  variant="outline"
                  className="w-full py-3 text-sm font-medium rounded-2xl border-amber-200 hover:bg-amber-50 text-amber-600 dark:border-amber-800 dark:hover:bg-amber-900/20 dark:text-amber-400 transition-all duration-200"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              }
            />
            
            {/* Professional Account Creation */}
            <BusinessPageDialog
              trigger={
                <Button 
                  variant="outline"
                  className="w-full py-3 text-sm font-medium rounded-2xl border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/50 transition-all duration-200"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Create Professional Account
                </Button>
              }
            />
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full py-3 text-sm font-medium rounded-2xl border-red-200 hover:bg-red-50 text-red-600 dark:border-red-800 dark:hover:bg-red-900/20 dark:text-red-400 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <InteractiveHoverButton 
            onClick={() => navigate('/auth')}
            text="Sign In"
            className="w-full py-4 text-lg font-semibold rounded-2xl shadow-lg transition-all duration-200"
          />
        )}
      </div>

      {/* User Card */}
      {user && (
        <div className="mt-8 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                Welcome back!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SidebarNav;
