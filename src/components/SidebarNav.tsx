
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Bell, 
  Mail, 
  User, 
  Search, 
  Settings, 
  Briefcase,
  Building,
  Menu,
  X,
  Bookmark,
  Hash,
  Users,
  Video,
  TrendingUp,
  Megaphone
} from 'lucide-react';
import AccountSwitcher from './AccountSwitcher';

const SidebarNav = () => {
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const navigation = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Explore', href: '/explore' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Mail, label: 'Messages', href: '/messages' },
    { icon: Bookmark, label: 'Pinned', href: '/pinned' },
    { icon: Video, label: 'Reels', href: '/?tab=reels' },
    { icon: Hash, label: 'Hashtags', href: '/explore?type=hashtags' },
    { icon: User, label: 'Profile', href: `/profile/${user?.id}` },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const businessNavigation = [
    { icon: Building, label: 'My Businesses', href: '/professional' },
    { icon: TrendingUp, label: 'Analytics', href: '/business-analytics' },
    { icon: Megaphone, label: 'Ads Manager', href: '/ads-manager' },
    { icon: Users, label: 'Directory', href: '/professional-accounts' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/' && !location.search.includes('tab=reels');
    }
    if (href === '/?tab=reels') {
      return location.pathname === '/' && location.search.includes('tab=reels');
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={`${isExpanded ? 'w-80' : 'w-20'} transition-all duration-300 ease-in-out fixed left-0 top-0 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-purple-200 dark:border-purple-800 z-40 overflow-y-auto`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {isExpanded && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Lovable
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Account Switcher */}
        {isExpanded && user && (
          <div className="mb-6">
            <AccountSwitcher />
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-2 mb-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 transition-colors ${
                    active 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' 
                      : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  } ${!isExpanded ? 'px-3' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {isExpanded && <Separator className="my-6" />}

        {/* Business Navigation */}
        {isExpanded && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Business</h3>
            <nav className="space-y-2">
              {businessNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={active ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 transition-colors ${
                        active 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' 
                          : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* My Business Pages */}
        {isExpanded && myPages.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">My Pages</h3>
            <div className="space-y-2">
              {myPages.slice(0, 3).map((page) => (
                <Link key={page.id} to={`/business/${page.id}`}>
                  <Card className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{page.page_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {page.business_type || page.page_type}
                          </p>
                          {page.shop_status && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {page.shop_status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              
              {myPages.length > 3 && (
                <Link to="/professional">
                  <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                    View all {myPages.length} pages
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarNav;
