import { useState, useEffect } from 'react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MessageThread from '@/components/MessageThread';
import CallHistorySection from '@/components/CallHistorySection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Phone, Bell, Archive, Search, User, Plus } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useAuth } from '@/contexts/AuthContext';
import WebRTCCallManager from '@/components/WebRTCCallManager';

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

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const otherUser = conv.participant_1 === user?.id 
      ? conv.participant_2_profile 
      : conv.participant_1_profile;
    return otherUser?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const renderConversationsList = () => (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 text-center">Loading conversations...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.participant_1 === user?.id 
                ? conversation.participant_2_profile 
                : conversation.participant_1_profile;
              
              return (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUser?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium truncate">
                          {otherUser?.display_name || otherUser?.username || 'Unknown User'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {conversation.last_message_at && 
                            new Date(conversation.last_message_at).toLocaleDateString()
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {typeof conversation.last_message === 'string' 
                          ? conversation.last_message 
                          : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return selectedConversation ? (
          <MessageThread 
            conversationId={selectedConversation}
          />
        ) : (
          <div className="p-6 text-center text-gray-500">
            Select a conversation to start messaging
          </div>
        );
      case 'calls':
        return <CallHistorySection />;
      case 'unread':
        return (
          <div className="p-6 text-center text-gray-500">
            No unread messages
          </div>
        );
      case 'archived':
        return (
          <div className="p-6 text-center text-gray-500">
            No archived messages
          </div>
        );
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Feature coming soon
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />

      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          <WebRTCCallManager />
          {/* Tab Navigation */}
          <div className="border-b border-purple-200 dark:border-purple-800 p-4">
            <div className="flex space-x-1">
              {[
                { id: 'all', label: 'All Messages', icon: MessageCircle },
                { id: 'calls', label: 'Calls', icon: Phone },
                { id: 'unread', label: 'Unread', icon: Bell },
                { id: 'archived', label: 'Archived', icon: Archive }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'text-gray-600 dark:text-gray-300'
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
          <div className="flex h-[calc(100vh-200px)]">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-purple-200 dark:border-purple-800">
              {renderConversationsList()}
            </div>
            {/* Main Content */}
            <div className="flex-1">
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
