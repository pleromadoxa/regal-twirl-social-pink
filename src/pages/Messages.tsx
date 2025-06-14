
import { useState } from 'react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { MessagesNavigationDock } from '@/components/MessagesNavigationDock';
import MessageThread from '@/components/MessageThread';
import GroupMessagesSection from '@/components/GroupMessagesSection';
import CallHistorySection from '@/components/CallHistorySection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Phone, Bell, Archive, Search, Settings } from 'lucide-react';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedConversation(null);
  };

  const handleAction = (action: string) => {
    console.log('Action triggered:', action);
    // Handle other actions like search, new group, etc.
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        return selectedConversation ? (
          <MessageThread conversationId={selectedConversation} />
        ) : (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">All Messages</h2>
            <div className="text-center text-gray-500 dark:text-gray-400">
              Select a conversation to start messaging
            </div>
          </div>
        );
      case 'calls':
        return <CallHistorySection />;
      case 'unread':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Unread Messages</h2>
            <div className="text-center text-gray-500 dark:text-gray-400">
              No unread messages
            </div>
          </div>
        );
      case 'archived':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Archived Messages</h2>
            <div className="text-center text-gray-500 dark:text-gray-400">
              No archived messages
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Messages</h2>
            <div className="text-center text-gray-500 dark:text-gray-400">
              Feature coming soon
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto relative">
          {renderContent()}
          
          {/* Navigation Dock */}
          <MessagesNavigationDock
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAction={handleAction}
          />
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Messages;
