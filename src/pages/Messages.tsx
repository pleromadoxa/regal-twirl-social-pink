import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MessageThread from '@/components/MessageThread';
import MessageSearch from '@/components/MessageSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Bell, Archive, Search, User, Plus, Hash, Star, ArrowLeft } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useAuth } from '@/contexts/AuthContext';
import WebRTCCallManager from '@/components/WebRTCCallManager';
import { GroupOptionsMenu } from '@/components/GroupOptionsMenu';
import MobileBottomNav from '@/components/MobileBottomNav';
import GroupCreationDialog from '@/components/GroupCreationDialog';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const messagesData = useEnhancedMessages();
  const {
    conversations,
    groupConversations,
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    refetch,
    startDirectConversation,
    createGroupConversation
  } = messagesData;

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

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleGroupCreated = (groupId: string) => {
    refetch();
    setSelectedConversation(groupId);
  };

  const filteredConversations = conversations.filter(conversation => {
    // First filter by search term
    if (searchTerm) {
      const otherUser = conversation.participant_1 === user?.id 
        ? conversation.participant_2_profile 
        : conversation.participant_1_profile;
      const searchableText = `${otherUser?.display_name || ''} ${otherUser?.username || ''} ${conversation.last_message || ''}`.toLowerCase();
      if (!searchableText.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Then filter by active tab - exclude groups for non-group tabs
    switch (activeTab) {
      case 'all':
        return true;
      case 'groups':
        return false; // Direct messages don't belong in groups tab
      case 'unread':
        if (conversation.last_message_at) {
          const lastMessageTime = new Date(conversation.last_message_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return lastMessageTime > oneDayAgo;
        }
        return false;
      case 'starred':
        return false;
      case 'archived':
        return false;
      default:
        return true;
    }
  });

  const filteredGroupConversations = groupConversations.filter(group => {
    // First filter by search term
    if (searchTerm) {
      const searchableText = `${group.name} ${group.description || ''} ${group.last_message?.content || ''}`.toLowerCase();
      if (!searchableText.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Then filter by active tab
    switch (activeTab) {
      case 'all':
        return true;
      case 'groups':
        return true; // Groups belong in groups tab
      case 'unread':
        if (group.last_message_at) {
          const lastMessageTime = new Date(group.last_message_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return lastMessageTime > oneDayAgo;
        }
        return false;
      case 'starred':
        return false;
      case 'archived':
        return false;
      default:
        return true;
    }
  });

  // Combine and sort all conversations
  const allFilteredConversations = [
    ...filteredConversations.map(conv => ({ ...conv, isGroup: false })),
    ...filteredGroupConversations.map(group => ({ ...group, isGroup: true }))
  ].sort((a, b) => {
    const aTime = new Date(a.last_message_at || a.created_at).getTime();
    const bTime = new Date(b.last_message_at || b.created_at).getTime();
    return bTime - aTime;
  });

  const renderConversationItem = (conversation: any) => {
    if (conversation.isGroup) {
      return (
        <div
          key={conversation.id}
          className={cn(
            "p-4 cursor-pointer rounded-xl transition-all duration-200 bg-white/60 dark:bg-gray-800/60 border-l-4 border-blue-400 hover:bg-purple-50/80 dark:hover:bg-purple-900/20",
            selectedConversation === conversation.id && 'bg-gradient-to-r from-purple-100/80 to-pink-100/40 shadow-sm'
          )}
          onClick={() => handleConversationSelect(conversation.id)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {conversation.member_count || 0}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {conversation.name || 'Group Chat'}
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
                {conversation.last_message?.content || 'No messages yet...'}
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      const otherUser = conversation.participant_1 === user?.id 
        ? conversation.participant_2_profile 
        : conversation.participant_1_profile;
      
      return (
        <div
          key={conversation.id}
          className={cn(
            "p-4 cursor-pointer rounded-xl transition-all duration-200 bg-white/60 dark:bg-gray-800/60 hover:bg-purple-50/80 dark:hover:bg-purple-900/20",
            selectedConversation === conversation.id && 'bg-gradient-to-r from-purple-100/80 to-pink-100/40 shadow-sm'
          )}
          onClick={() => handleConversationSelect(conversation.id)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                  {otherUser?.display_name?.[0] || otherUser?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950">
      <WebRTCCallManager />
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      
      {/* Mobile Sidebar - Overlay */}
      <div className="lg:hidden">
        <SidebarNav />
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex h-screen">
        {/* Main Content Container */}
        <div className="flex-1 flex overflow-hidden lg:ml-80">
          {/* Chat Thread Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedConversation ? (
              <MessageThread 
                conversationId={selectedConversation}
                messagesData={messagesData}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center glass">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-glow animate-pulse">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent mb-3">
                  Welcome to Chat
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                  Select a conversation to start chatting, or create a new one to connect with your friends.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <MessageSearch onStartConversation={startDirectConversation} messagesData={messagesData} />
                  <GroupCreationDialog onGroupCreated={handleGroupCreated} />
                </div>
              </div>
            )}
          </div>

          {/* Conversations Sidebar - Right Side */}
          <div className="w-80 lg:w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-l border-purple-200/50 dark:border-purple-800/50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-purple-200/50 dark:border-purple-800/50">
              <h1 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Chat</h1>
              <div className="flex gap-2">
                <MessageSearch onStartConversation={startDirectConversation} messagesData={messagesData} />
                <GroupCreationDialog onGroupCreated={handleGroupCreated} />
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-purple-200/50 dark:border-purple-800/50 bg-white/40 dark:bg-gray-800/40">
              {['all', 'groups', 'unread'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "flex-1 px-3 py-3 text-sm font-medium capitalize transition-all duration-200 relative",
                    activeTab === tab
                      ? "text-purple-700 dark:text-purple-300 bg-white/60 dark:bg-slate-700/60"
                      : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/30 dark:hover:bg-slate-700/30"
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-purple-200/50 dark:border-purple-800/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 bg-white/60 dark:bg-slate-700/60 border-purple-200/50 dark:border-purple-700/50 rounded-xl text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading conversations...</p>
                </div>
              ) : allFilteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No conversations yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Start a conversation to connect with others</p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {allFilteredConversations.map(renderConversationItem)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md border-b border-purple-200/50">
          <div className="flex items-center justify-between p-4">
            {selectedConversation ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="p-2 hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">Chat</h1>
                <div className="w-10" /> {/* Spacer for centering */}
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">Chat</h1>
                <div className="flex gap-2">
                  <MessageSearch onStartConversation={startDirectConversation} messagesData={messagesData} />
                  <GroupCreationDialog onGroupCreated={handleGroupCreated} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 min-h-screen bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {selectedConversation ? (
            <MessageThread 
              conversationId={selectedConversation}
              messagesData={messagesData}
            />
          ) : (
            <div className="p-4">
              {/* Tab Navigation */}
              <div className="flex mb-4 bg-white/60 dark:bg-gray-800/60 rounded-xl p-1">
                {['all', 'groups', 'unread'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-medium capitalize rounded-lg transition-all duration-200",
                      activeTab === tab
                        ? "bg-gradient-primary text-white shadow-glow"
                        : "text-gray-600 dark:text-gray-400 hover:text-purple-600"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10 bg-white/60 dark:bg-slate-700/60 border-purple-200/50 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="space-y-2">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading conversations...</p>
                  </div>
                ) : allFilteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No conversations yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Start a conversation to connect with others</p>
                  </div>
                ) : (
                  allFilteredConversations.map(renderConversationItem)
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default Messages;