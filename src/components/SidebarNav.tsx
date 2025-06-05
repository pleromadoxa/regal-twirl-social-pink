
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
