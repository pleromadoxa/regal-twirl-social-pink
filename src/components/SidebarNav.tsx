
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
    <aside className="w-64 p-4 space-y-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Logo */}
      <div className="px-3 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-indigo-600 to-emerald-600 dark:from-slate-300 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
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
            className={`w-full justify-start px-4 py-6 text-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 dark:hover:from-slate-800 dark:hover:to-indigo-900 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all duration-300 group rounded-xl ${
              item.active 
                ? 'bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm border border-slate-200 dark:border-slate-700' 
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <item.icon className="w-6 h-6 mr-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="transition-all duration-300">{item.label}</span>
            {item.active && (
              <div className="ml-auto w-2 h-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        ))}
      </nav>

      {/* Post Button */}
      <div className="pt-4">
        <Button className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-indigo-600 via-emerald-500 to-slate-600 hover:from-indigo-700 hover:via-emerald-600 hover:to-slate-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
          <span className="relative z-10">Post</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Button>
      </div>
    </aside>
  );
};

export default SidebarNav;
