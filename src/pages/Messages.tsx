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

  const renderConversationsList = () => (
    <Card className="h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur border-purple-200/50 dark:border-purple-800/50 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-purple-700 dark:text-purple-300">Conversations</CardTitle>
          <div className="flex gap-2">
            <MessageSearch onStartConversation={startDirectConversation} messagesData={messagesData} />
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
          ) : allFilteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No conversations yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Start a conversation to connect with others</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {allFilteredConversations.map((conversation) => {
                if (conversation.isGroup) {
                  return (
                    <div
                      key={conversation.id}
                      className={cn(
                        "p-3 sm:p-4 cursor-pointer rounded-xl transition-all duration-200 hover:bg-purple-50/80 dark:hover:bg-purple-900/20 border-l-4 border-blue-400",
                        selectedConversation === conversation.id && 'bg-gradient-to-r from-purple-100/80 to-pink-100/40 dark:from-purple-900/40 dark:to-pink-900/20 shadow-sm'
                      )}
                      onClick={() => handleConversationSelect(conversation.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-white/50 dark:ring-slate-700/50">
                            <Hash className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {(conversation as any).member_count || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
                            {(conversation as any).name || 'Group Chat'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {conversation.last_message_at && 
                                new Date(conversation.last_message_at).toLocaleDateString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })
                              }
                            </span>
                            <GroupOptionsMenu
                              groupId={conversation.id}
                              groupName={(conversation as any).name || 'Group Chat'}
                              isAdmin={true} // TODO: Check actual admin status
                              onGroupDissolved={() => {
                                refetch();
                                setSelectedConversation(null);
                              }}
                            />
                          </div>
                        </div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {(conversation as any).last_message?.content || 'No messages yet...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const directConversation = conversation as any; // Direct conversation type
                  const otherUser = directConversation.participant_1 === user?.id 
                    ? directConversation.participant_2_profile 
                    : directConversation.participant_1_profile;
                  
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
                }
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
            Welcome to Chat
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Select a conversation to start chatting, or create a new one to connect with your friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <MessageSearch onStartConversation={startDirectConversation} messagesData={messagesData} />
            <GroupCreationDialog onGroupCreated={handleGroupCreated} />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950">
      <WebRTCCallManager />
      
      {/* Mobile Header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md">
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
      
      {/* Desktop Layout */}
      <div className="hidden sm:flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarNav />
        </div>
        
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
              <GroupCreationDialog onGroupCreated={handleGroupCreated} />
            </div>
            
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              {/* Desktop Tab Navigation */}
              <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide pb-2">
                {[
                  { id: 'all', label: 'All Chat', icon: MessageCircle },
                  { id: 'groups', label: 'Groups', icon: Hash },
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
                        "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 whitespace-nowrap flex-shrink-0",
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
              <div className="flex-1 overflow-y-auto">
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
                            "p-4 cursor-pointer rounded-xl transition-all duration-200 hover:bg-purple-50/80 dark:hover:bg-purple-900/20",
                            selectedConversation === conversation.id && 'bg-gradient-to-r from-purple-100/80 to-pink-100/40 dark:from-purple-900/40 dark:to-pink-900/20 shadow-sm'
                          )}
                          onClick={() => handleConversationSelect(conversation.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12 ring-2 ring-white/50 dark:ring-slate-700/50">
                                <AvatarImage src={otherUser?.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm">
                                  {otherUser?.display_name?.[0] || otherUser?.username?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
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
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden">
        {!selectedConversation ? (
          /* Mobile Conversations List */
          <div className="min-h-screen pt-20 pb-4">
            <div className="p-4">
              {/* Mobile Tab Navigation */}
              <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'all', label: 'All', icon: MessageCircle },
                  { id: 'groups', label: 'Groups', icon: Hash },
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
                        "flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap min-w-0",
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
              <div className="space-y-2">
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
                  filteredConversations.map((conversation) => {
                    const otherUser = conversation.participant_1 === user?.id 
                      ? conversation.participant_2_profile 
                      : conversation.participant_1_profile;
                    
                    return (
                      <div
                        key={conversation.id}
                        className="p-4 cursor-pointer rounded-xl transition-all duration-200 hover:bg-purple-50/80 dark:hover:bg-purple-900/20 bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-purple-200/30 dark:border-purple-800/30"
                        onClick={() => handleConversationSelect(conversation.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 ring-2 ring-white/50 dark:ring-slate-700/50">
                              <AvatarImage src={otherUser?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm">
                                {otherUser?.display_name?.[0] || otherUser?.username?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
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
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Mobile Chat Thread */
          <div className="fixed inset-0 pt-16 flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <MessageThread 
              conversationId={selectedConversation}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;