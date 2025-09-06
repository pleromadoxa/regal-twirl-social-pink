
import { useState, useEffect } from 'react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MessageThread from '@/components/MessageThread';
import MessageSearch from '@/components/MessageSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Bell, Archive, Search, User, Plus, Hash, Star } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useAuth } from '@/contexts/AuthContext';
import WebRTCCallManager from '@/components/WebRTCCallManager';
import GroupCreationDialog from '@/components/GroupCreationDialog';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const {
    conversations,
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    refetch,
    startDirectConversation,
    createGroupConversation
  } = useEnhancedMessages();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedConversation(null);
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartConversation = (userId: string) => {
    startDirectConversation(userId);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const otherUser = conv.participant_1 === user?.id 
      ? conv.participant_2_profile 
      : conv.participant_1_profile;
    return otherUser?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const renderConversationsList = () => (
    <div className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
      <div className="p-6 border-b border-purple-200/50 dark:border-purple-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connect with your community</p>
            </div>
          </div>
          <div className="flex gap-2">
            <MessageSearch onStartConversation={handleStartConversation} />
            <GroupCreationDialog onGroupCreated={(groupId) => console.log('Group created:', groupId)} />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-white/60 dark:bg-slate-700/60 border-purple-200/50 dark:border-purple-700/50 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No conversations yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Start a conversation to connect with others</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.participant_1 === user?.id 
                ? conversation.participant_2_profile 
                : conversation.participant_1_profile;
              
              return (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer rounded-xl transition-all duration-200 hover:bg-purple-50/80 dark:hover:bg-purple-900/20 ${
                    selectedConversation === conversation.id ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/40 dark:from-purple-900/40 dark:to-pink-900/20 shadow-sm' : ''
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-white/50 dark:ring-slate-700/50">
                        <AvatarImage src={otherUser?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                          {otherUser?.display_name?.[0] || otherUser?.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {otherUser?.display_name || otherUser?.username || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {conversation.last_message_at && 
                            new Date(conversation.last_message_at).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {typeof conversation.last_message === 'string' 
                          ? conversation.last_message 
                          : 'Start a conversation...'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return selectedConversation ? (
          <MessageThread 
            conversationId={selectedConversation}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Welcome to Messages
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              Select a conversation from the left to start messaging, or search for someone new to connect with.
            </p>
            <MessageSearch onStartConversation={handleStartConversation} />
          </div>
        );
      case 'unread':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
            <Bell className="w-16 h-16 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No unread messages</h3>
            <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
          </div>
        );
      case 'starred':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
            <Star className="w-16 h-16 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No starred messages</h3>
            <p className="text-gray-500 dark:text-gray-400">Star important messages to find them easily</p>
          </div>
        );
      case 'archived':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
            <Archive className="w-16 h-16 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No archived messages</h3>
            <p className="text-gray-500 dark:text-gray-400">Archived conversations will appear here</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
            <Hash className="w-16 h-16 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Feature coming soon</h3>
            <p className="text-gray-500 dark:text-gray-400">This feature is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />

      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 max-w-6xl mx-auto">
          <WebRTCCallManager />
          
          {/* Enhanced Header */}
          <div className="mb-6 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Messages
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">Stay connected with your community</p>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'All Messages', icon: MessageCircle },
                { id: 'unread', label: 'Unread', icon: Bell },
                { id: 'starred', label: 'Starred', icon: Star },
                { id: 'archived', label: 'Archived', icon: Archive }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-purple-100/50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex gap-6 h-[calc(100vh-250px)]">
            {/* Conversations Sidebar */}
            <div className="w-96 flex-shrink-0">
              {renderConversationsList()}
            </div>
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Messages;
