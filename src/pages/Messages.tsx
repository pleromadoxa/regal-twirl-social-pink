
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageThread from '@/components/MessageThread';
import SidebarNav from '@/components/SidebarNav';
import CallHistorySection from '@/components/CallHistorySection';
import GroupMessagesSection from '@/components/GroupMessagesSection';
import { MessagesNavigationDock } from '@/components/MessagesNavigationDock';
import { MessageCircle, Users, Bell } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const { conversations, loading } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedConversation(null);
  };

  const handleAction = (action: string) => {
    console.log('Action:', action);
    // Handle various actions like search, new group, etc.
  };

  const formatLastMessage = (message: string) => {
    return message.length > 50 ? message.substring(0, 50) + '...' : message;
  };

  const getFilteredConversations = () => {
    switch (activeTab) {
      case 'unread':
        return conversations.filter(conv => 
          conv.last_message && !conv.last_message.read_at && 
          conv.last_message.sender_id !== user?.id
        );
      case 'archived':
        return []; // Would filter archived conversations
      default:
        return conversations;
    }
  };

  const filteredConversations = getFilteredConversations();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 pl-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 pl-80 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-96 border-r border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="p-4 border-b border-purple-200 dark:border-purple-800">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              {activeTab === 'calls' ? <Bell className="w-5 h-5" /> : 
               activeTab === 'groups' ? <Users className="w-5 h-5" /> : 
               <MessageCircle className="w-5 h-5" />}
              {activeTab === 'calls' ? 'Call History' :
               activeTab === 'groups' ? 'Group Messages' :
               activeTab === 'unread' ? 'Unread Messages' :
               activeTab === 'archived' ? 'Archived Messages' :
               'Messages'}
            </h2>
          </div>

          <ScrollArea className="h-[calc(100vh-140px)]">
            {activeTab === 'calls' ? (
              <CallHistorySection />
            ) : activeTab === 'groups' ? (
              <GroupMessagesSection />
            ) : (
              <div className="p-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">
                      {activeTab === 'unread' ? 'No unread messages' : 'No conversations yet'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    // Get the other participant
                    const otherParticipant = conversation.participant_1 === user?.id 
                      ? conversation.participant_2_profile
                      : conversation.participant_1_profile;
                    
                    const isUnread = conversation.last_message && 
                                   !conversation.last_message.read_at && 
                                   conversation.last_message.sender_id !== user?.id;

                    return (
                      <Card
                        key={conversation.id}
                        className={`mb-2 cursor-pointer transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
                          selectedConversation?.id === conversation.id ? 'bg-purple-100 dark:bg-purple-900/30' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={otherParticipant?.avatar_url || ''} />
                                <AvatarFallback className="bg-purple-500 text-white">
                                  {otherParticipant?.display_name?.charAt(0) || 
                                   otherParticipant?.username?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              {isUnread && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">
                                  {otherParticipant?.display_name || otherParticipant?.username || 'Unknown User'}
                                </p>
                                {conversation.last_message && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(conversation.last_message.created_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {conversation.last_message && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {formatLastMessage(conversation.last_message.content)}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {conversation.streak_count && conversation.streak_count > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    🔥 {conversation.streak_count}
                                  </Badge>
                                )}
                                {isUnread && (
                                  <Badge variant="destructive" className="text-xs">
                                    New
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Thread */}
        <div className="flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {selectedConversation && activeTab === 'all' ? (
            <MessageThread conversationId={selectedConversation.id} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  {activeTab === 'calls' ? 'Call History' :
                   activeTab === 'groups' ? 'Group Messages' :
                   'Select a conversation'}
                </p>
                <p className="text-sm">
                  {activeTab === 'calls' ? 'View your call history and make new calls' :
                   activeTab === 'groups' ? 'Manage your group conversations' :
                   'Choose a conversation from the sidebar to start messaging'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Dock */}
      <MessagesNavigationDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAction={handleAction}
      />
    </div>
  );
};

export default Messages;
