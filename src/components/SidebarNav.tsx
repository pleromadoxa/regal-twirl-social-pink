
import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <aside className="w-64 p-4 space-y-2">
      {/* Logo */}
      <div className="px-3 py-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Regal
        </h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={`w-full justify-start px-3 py-6 text-lg hover:bg-pink-50 hover:text-pink-700 ${
              item.active ? 'bg-pink-50 text-pink-700 font-semibold' : 'text-gray-700'
            }`}
          >
            <item.icon className="w-6 h-6 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Tweet Button */}
      <div className="pt-4">
        <Button className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
          Tweet
        </Button>
      </div>
    </aside>
  );
};

export default SidebarNav;
