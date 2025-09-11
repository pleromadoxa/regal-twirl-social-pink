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

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleGroupCreated = (groupId: string) => {
    refetch();
    setSelectedConversation(groupId);
  };

  const filteredConversations = conversations.filter(conversation => {
    // For now, show all conversations - these properties may not exist yet
    return true;
  }).filter(conversation => {
    if (!searchTerm) return true;
    const otherUser = conversation.participant_1 === user?.id 
      ? conversation.participant_2_profile 
      : conversation.participant_1_profile;
    const searchableText = `${otherUser?.display_name || ''} ${otherUser?.username || ''} ${conversation.last_message || ''}`.toLowerCase();
    return searchableText.includes(searchTerm.toLowerCase());
  });

  const renderConversationsList = () => (
    <Card className="h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur border-purple-200/50 dark:border-purple-800/50 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-purple-700 dark:text-purple-300">Conversations</CardTitle>
          <div className="flex gap-2">
            <MessageSearch onStartConversation={startDirectConversation} />
            <GroupCreationDialog onGroupCreated={handleGroupCreated} />
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-white/60 dark:bg-slate-700/60 border-purple-200/50 dark:border-purple-700/50 rounded-xl text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-300px)]">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading conversations...</p>
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
                    className={cn(
                      "p-3 sm:p-4 cursor-pointer rounded-xl transition-all duration-200 hover:bg-purple-50/80 dark:hover:bg-purple-900/20",
                      selectedConversation === conversation.id && 'bg-gradient-to-r from-purple-100/80 to-pink-100/40 dark:from-purple-900/40 dark:to-pink-900/20 shadow-sm'
                    )}
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-white/50 dark:ring-slate-700/50">
                          <AvatarImage src={otherUser?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm">
                            {otherUser?.display_name?.[0] || otherUser?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
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
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
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
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    if (selectedConversation) {
      return (
        <div className="h-full">
          <MessageThread 
            conversationId={selectedConversation}
          />
        </div>
      );
    }

    return (
      <Card className="h-full bg-white/60 dark:bg-gray-900/60 backdrop-blur border-purple-200/50 dark:border-purple-800/50 shadow-xl">
        <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Welcome to Messages
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Select a conversation to start chatting, or create a new one to connect with your friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <MessageSearch onStartConversation={startDirectConversation} />
            <GroupCreationDialog onGroupCreated={handleGroupCreated} />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <WebRTCCallManager />
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      
      {/* Mobile Back Button */}
      {selectedConversation && (
        <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b">
          <div className="flex items-center gap-3 p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Messages</h1>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile: Show conversations list OR chat thread */}
        {/* Desktop: Show both side by side */}
        
        {/* Conversations Sidebar */}
        <div className={cn(
          "w-full sm:w-80 lg:w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-r border-purple-200 dark:border-purple-800 flex flex-col",
          selectedConversation && "hidden sm:flex"
        )}>
          <div className="hidden sm:flex items-center justify-between p-4 border-b border-purple-200 dark:border-purple-800">
            <h1 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Messages</h1>
            <GroupCreationDialog onGroupCreated={handleGroupCreated} />
          </div>
          
          <div className="flex-1 p-3 sm:p-4 pt-16 sm:pt-4">
            {/* Mobile Tab Navigation */}
            <div className="sm:hidden flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[
                { id: 'all', label: 'All', icon: MessageCircle },
                { id: 'unread', label: 'Unread', icon: Bell },
                { id: 'starred', label: 'Starred', icon: Star },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs",
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'text-gray-600 dark:text-gray-300'
                    )}
                  >
                    <IconComponent className="w-3 h-3" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Desktop Tab Navigation */}
            <div className="hidden sm:flex space-x-2 mb-4">
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
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-purple-100/50 dark:hover:bg-purple-900/20'
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-white/60 dark:bg-slate-700/60 border-purple-200/50 dark:border-purple-700/50 rounded-xl text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Conversations List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading conversations...</p>
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
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => {
                    const otherUser = conversation.participant_1 === user?.id 
                      ? conversation.participant_2_profile 
                      : conversation.participant_1_profile;
                    
                    return (
                      <div
                        key={conversation.id}
                        className={cn(
                          "p-3 sm:p-4 cursor-pointer rounded-xl transition-all duration-200 hover:bg-purple-50/80 dark:hover:bg-purple-900/20",
                          selectedConversation === conversation.id && 'bg-gradient-to-r from-purple-100/80 to-pink-100/40 dark:from-purple-900/40 dark:to-pink-900/20 shadow-sm'
                        )}
                        onClick={() => handleConversationSelect(conversation.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-white/50 dark:ring-slate-700/50">
                              <AvatarImage src={otherUser?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm">
                                {otherUser?.display_name?.[0] || otherUser?.username?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
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
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
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
        </div>
        
        {/* Chat Thread Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          !selectedConversation && "hidden sm:flex"
        )}>
          <div className={cn(
            "flex-1 p-0",
            selectedConversation && "pt-16 sm:pt-0"
          )}>
            {selectedConversation ? (
              <MessageThread 
                conversationId={selectedConversation}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Welcome to Messages
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                  Select a conversation to start chatting, or create a new one to connect with your friends.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <MessageSearch onStartConversation={startDirectConversation} />
                  <GroupCreationDialog onGroupCreated={handleGroupCreated} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Desktop Right Sidebar */}
      <div className="hidden xl:block">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Messages;