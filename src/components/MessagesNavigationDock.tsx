
import {
  MessageCircle,
  Users,
  Search,
  Settings,
  Archive,
  Bell,
  Phone,
  MoreVertical,
  Star,
  UserPlus
} from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { useState } from 'react';

interface MessagesNavigationDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAction: (action: string) => void;
}

const navigationItems = [
  {
    id: 'all',
    title: 'All Messages',
    icon: MessageCircle,
    action: 'tab'
  },
  {
    id: 'calls',
    title: 'Call History',
    icon: Phone,
    action: 'tab'
  },
  {
    id: 'unread',
    title: 'Unread',
    icon: Bell,
    action: 'tab'
  },
  {
    id: 'archived',
    title: 'Archived',
    icon: Archive,
    action: 'tab'
  },
  {
    id: 'search',
    title: 'Search Messages',
    icon: Search,
    action: 'search'
  },
  {
    id: 'new-group',
    title: 'New Group',
    icon: Users,
    action: 'new-group'
  },
  {
    id: 'add-contact',
    title: 'Add Contact',
    icon: UserPlus,
    action: 'add-contact'
  },
  {
    id: 'favorites',
    title: 'Favorites',
    icon: Star,
    action: 'favorites'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    action: 'settings'
  },
  {
    id: 'more',
    title: 'More Options',
    icon: MoreVertical,
    action: 'more'
  }
];

export function MessagesNavigationDock({ activeTab, onTabChange, onAction }: MessagesNavigationDockProps) {
  const handleItemClick = (item: typeof navigationItems[0]) => {
    if (item.action === 'tab') {
      onTabChange(item.id);
    } else {
      onAction(item.id);
    }
  };

  return (
    <div className='absolute bottom-4 left-1/2 max-w-full -translate-x-1/2 z-20'>
      <Dock className='items-end pb-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-purple-200 dark:border-purple-700'>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.action === 'tab' && activeTab === item.id;
          
          return (
            <DockItem
              key={item.id}
              className={`aspect-square rounded-full cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-gray-200 dark:bg-neutral-800 hover:bg-purple-100 dark:hover:bg-purple-900/20'
              }`}
              onClick={() => handleItemClick(item)}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>
                <IconComponent className={`h-full w-full ${
                  isActive 
                    ? 'text-white' 
                    : 'text-neutral-600 dark:text-neutral-300'
                }`} />
              </DockIcon>
            </DockItem>
          );
        })}
      </Dock>
    </div>
  );
}
