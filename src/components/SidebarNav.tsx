
import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

const SidebarNav = () => {
  const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Search, label: "Explore" },
    { icon: Bell, label: "Notifications" },
    { icon: Mail, label: "Messages" },
    { icon: Bookmark, label: "Bookmarks" },
    { icon: User, label: "Profile" },
    { icon: MoreHorizontal, label: "More" },
  ];

  return (
    <aside className="w-64 p-4 space-y-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-pink-100 dark:border-gray-700">
      {/* Logo */}
      <div className="px-3 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
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
            className={`w-full justify-start px-4 py-6 text-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-pink-700 dark:hover:text-pink-400 transition-all duration-300 group ${
              item.active 
                ? 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 text-pink-700 dark:text-pink-400 font-semibold shadow-sm' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <item.icon className="w-6 h-6 mr-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="transition-all duration-300">{item.label}</span>
            {item.active && (
              <div className="ml-auto w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        ))}
      </nav>

      {/* Post Button */}
      <div className="pt-4">
        <Button className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
          <span className="relative z-10">Post</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Button>
      </div>
    </aside>
  );
};

export default SidebarNav;
