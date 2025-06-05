
import { Home, Search, MessageCircle, Pin, User, MoreHorizontal, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const SidebarNav = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/", active: location.pathname === "/" },
    { icon: Search, label: "Explore", path: "/explore", active: location.pathname === "/explore" },
    { icon: MessageCircle, label: "Conversations", path: "/messages", active: location.pathname === "/messages" },
    { icon: Pin, label: "Pinned", path: "/pinned", active: location.pathname === "/pinned" },
    { icon: User, label: "Profile", path: `/profile/${user?.id}`, active: location.pathname.startsWith("/profile") },
    { icon: MoreHorizontal, label: "More", path: "/more", active: location.pathname === "/more" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigation = (path: string) => {
    if (path === "/more") {
      // This page doesn't exist yet, so we'll just return for now
      return;
    }
    navigate(path);
  };

  return (
    <aside className="w-64 p-4 space-y-2 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      {/* Logo */}
      <div className="px-3 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
            onClick={() => handleNavigation(item.path)}
            className={`w-full justify-start px-4 py-6 text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl ${
              item.active 
                ? 'bg-slate-100 dark:bg-slate-700 text-purple-600 dark:text-purple-400 font-semibold' 
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <item.icon className="w-6 h-6 mr-4" />
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>

      {/* Post Button or Auth Button */}
      <div className="pt-4 space-y-2">
        {user ? (
          <>
            <Button className="w-full py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-2xl">
              Post
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full py-3 text-sm font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-2xl"
          >
            Sign In
          </Button>
        )}
      </div>
    </aside>
  );
};

export default SidebarNav;
