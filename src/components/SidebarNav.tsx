
import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const SidebarNav = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Search, label: "Explore" },
    { icon: Bell, label: "Notifications" },
    { icon: Mail, label: "Messages" },
    { icon: Bookmark, label: "Bookmarks" },
    { icon: User, label: "Profile" },
    { icon: MoreHorizontal, label: "More" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside className="w-64 p-4 space-y-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Logo */}
      <div className="px-3 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 dark:from-purple-400 dark:via-blue-400 dark:to-pink-400 bg-clip-text text-transparent animate-pulse">
          Regal
        </h1>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={`w-full justify-start px-4 py-6 text-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900 dark:hover:to-pink-900 hover:text-purple-700 dark:hover:text-purple-400 transition-all duration-500 group rounded-xl transform hover:scale-105 hover:shadow-lg ${
              item.active 
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-400 font-semibold shadow-lg border border-purple-200 dark:border-purple-700 scale-105' 
                : 'text-slate-700 dark:text-slate-300 hover:translate-x-2'
            }`}
          >
            <item.icon className="w-6 h-6 mr-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
            <span className="transition-all duration-300">{item.label}</span>
            {item.active && (
              <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"></div>
            )}
          </Button>
        ))}
      </nav>

      {/* Post Button or Auth Button */}
      <div className="pt-4 space-y-2">
        {user ? (
          <>
            <Button className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 via-blue-500 to-pink-600 hover:from-purple-700 hover:via-blue-600 hover:to-pink-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 relative overflow-hidden group">
              <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">Post</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-full"></div>
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full py-3 text-sm font-medium border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 via-blue-500 to-pink-600 hover:from-purple-700 hover:via-blue-600 hover:to-pink-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2"
          >
            Sign In
          </Button>
        )}
      </div>
    </aside>
  );
};

export default SidebarNav;
