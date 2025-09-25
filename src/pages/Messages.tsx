import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MessageThread from '@/components/MessageThread';
import AudioCall from '@/components/AudioCall';
import VideoCall from '@/components/VideoCall';
import CallPopup from '@/components/CallPopup';
import CallTestManager from '@/components/CallTestManager';
import WebRTCCallManager from '@/components/WebRTCCallManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Bell, 
  Search, 
  Hash, 
  ArrowLeft, 
  Phone, 
  Video, 
  PhoneCall, 
  Clock, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Users 
} from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MobileBottomNav from '@/components/MobileBottomNav';
import { JoinGroupDialog } from '@/components/JoinGroupDialog';
import PresenceIndicator from '@/components/PresenceIndicator';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showJoinGroupDialog, setShowJoinGroupDialog] = useState(false);
  const [showCallTest, setShowCallTest] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    conversationId: string;
    otherUser: any;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    type: 'audio' | 'video';
    conversationId: string;
    otherUser: any;
  } | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const messagesData = useEnhancedMessages();
  const { callHistory, loading: callHistoryLoading } = useCallHistory();

  const selectedConversation = searchParams.get('conversation');
  const { conversations, groupConversations, loading } = messagesData;

  // Filter conversations based on search and active tab
  const filteredConversations = conversations.filter(conversation => {
    if (searchTerm) {
      const otherUser = conversation.participant_1 === user?.id 
        ? conversation.participant_2_profile 
        : conversation.participant_1_profile;
      const searchableText = `${otherUser?.display_name || ''} ${otherUser?.username || ''}`.toLowerCase();
      if (!searchableText.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    switch (activeTab) {
      case 'all':
        return true;
      case 'calls':
        return false;
      case 'groups':
        return false;
      case 'unread':
        if (conversation.last_message_at) {
          const lastMessageTime = new Date(conversation.last_message_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return lastMessageTime > oneDayAgo;
        }
        return false;
      default:
        return true;
    }
  });

  const filteredGroupConversations = groupConversations.filter(group => {
    if (searchTerm) {
      const searchableText = `${group.name} ${group.description || ''}`.toLowerCase();
      if (!searchableText.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    switch (activeTab) {
      case 'all':
        return true;
      case 'calls':
        return false;
      case 'groups':
        return true;
      case 'unread':
        if (group.last_message_at) {
          const lastMessageTime = new Date(group.last_message_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return lastMessageTime > oneDayAgo;
        }
        return false;
      default:
        return true;
    }
  });

  // Handle call history for calls tab
  const renderCallHistoryItem = (call: any) => {
    const isOutgoing = call.caller_id === user?.id;
    const otherUser = isOutgoing ? call.recipient : call.caller;
    
    const getCallIcon = () => {
      if (call.call_status === 'missed') {
        return <PhoneMissed className="w-4 h-4 text-red-500" />;
      } else if (isOutgoing) {
        return <PhoneOutgoing className="w-4 h-4 text-green-500" />;
      } else {
        return <PhoneIncoming className="w-4 h-4 text-blue-500" />;
      }
    };

    const formatDuration = (seconds: number | null) => {
      if (!seconds) return 'No answer';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div
        key={call.id}
        className="p-4 cursor-pointer rounded-xl transition-all duration-200 bg-white/60 dark:bg-gray-800/60 hover:bg-purple-50/80 dark:hover:bg-purple-900/20"
        onClick={() => {
          if (otherUser) {
            setActiveCall({
              type: 'audio',
              conversationId: call.id,
              otherUser
            });
          }
        }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={otherUser?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
              {otherUser?.display_name?.[0] || otherUser?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {otherUser?.display_name || otherUser?.username || 'Unknown User'}
              </h3>
              <div className="flex items-center gap-2">
                {getCallIcon()}
                <span className="text-xs text-gray-400">
                  {new Date(call.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(call.duration)}</span>
              <span className="text-xs">•</span>
              <span className="text-xs capitalize">{call.call_type}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="w-8 h-8 p-0 text-green-600 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation();
                setActiveCall({
                  type: 'audio',
                  conversationId: call.id,
                  otherUser
                });
              }}
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-8 h-8 p-0 text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                setActiveCall({
                  type: 'video',
                  conversationId: call.id,
                  otherUser
                });
              }}
            >
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  let displayData: any[] = [];
  
  if (activeTab === 'calls') {
    displayData = callHistory.filter(call => {
      if (searchTerm) {
        const otherUser = call.caller_id === user?.id ? call.recipient : call.caller;
        const searchableText = `${otherUser?.display_name || ''} ${otherUser?.username || ''}`.toLowerCase();
        if (!searchableText.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  } else {
    displayData = [
      ...filteredConversations.map(conv => ({ ...conv, isGroup: false })),
      ...filteredGroupConversations.map(group => ({ ...group, isGroup: true }))
    ].sort((a, b) => {
      const aTime = new Date(a.last_message_at || a.created_at).getTime();
      const bTime = new Date(b.last_message_at || b.created_at).getTime();
      return bTime - aTime;
    });
  }

  const renderConversationItem = (conversation: any) => {
    if (conversation.isGroup) {
      return (
        <div
          key={conversation.id}
          className={cn(
            "p-4 cursor-pointer rounded-xl transition-all duration-200 bg-white/60 dark:bg-gray-800/60 border-l-4 border-blue-400 hover:bg-purple-50/80 dark:hover:bg-purple-900/20",
            selectedConversation === conversation.id && 'bg-gradient-to-r from-purple-100/80 to-pink-100/40 shadow-sm'
          )}
          onClick={() => setSearchParams({ conversation: conversation.id })}
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
          onClick={() => setSearchParams({ conversation: conversation.id })}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                  {otherUser?.display_name?.[0] || otherUser?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <PresenceIndicator userId={otherUser?.id} className="absolute -bottom-1 -right-1" />
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
    <div className="flex h-screen bg-gradient-to-br from-purple-50/80 via-white to-pink-50/80 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 flex-shrink-0">
        <SidebarNav />
      </div>

      {/* Middle Section - Messages List */}
      <div className={cn(
        "w-full lg:w-80 xl:w-96 flex-shrink-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-r border-purple-200/50",
        selectedConversation && "hidden lg:flex"
      )}>
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="p-6 border-b border-purple-200/50 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Messages
              </h1>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowCallTest(true)}
                  className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  <PhoneCall className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-xl p-1 backdrop-blur-sm mb-4">
              {[
                { id: 'all', label: 'All', icon: MessageCircle },
                { id: 'calls', label: 'Calls', icon: PhoneCall },
                { id: 'groups', label: 'Groups', icon: Users },
                { id: 'unread', label: 'Unread', icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Search */}
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
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2 pb-20 lg:pb-4">
              {loading || (activeTab === 'calls' && callHistoryLoading) ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading {activeTab === 'calls' ? 'call history' : 'conversations'}...</p>
                </div>
              ) : displayData.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {activeTab === 'calls' ? (
                      <PhoneCall className="w-8 h-8 text-purple-400" />
                    ) : (
                      <MessageCircle className="w-8 h-8 text-purple-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {activeTab === 'calls' ? 'No call history' : 'No conversations yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {activeTab === 'calls' ? 'Your call history will appear here' : 'Start a conversation to connect with others'}
                  </p>
                </div>
              ) : (
                activeTab === 'calls'
                  ? displayData.map(renderCallHistoryItem)
                  : displayData.map(renderConversationItem)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Chat Area - Full Width with left margin */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConversation ? (
          <MessageThread
            conversationId={selectedConversation}
            messagesData={messagesData}
            onCallStart={(callType, otherUser) => {
              setActiveCall({
                type: callType,
                conversationId: selectedConversation,
                otherUser
              });
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:to-purple-900/20">
            <div className="text-center space-y-4 p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Choose a conversation from the left sidebar to start messaging, or create a new conversation to connect with others.
              </p>
              <div className="lg:hidden">
                <Button 
                  variant="ghost" 
                  onClick={() => setSearchParams({})}
                  className="mt-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to conversations
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <MobileBottomNav />
      </div>

      {/* Modals and Overlays */}
      {showCallTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10 bg-white rounded-full"
              onClick={() => setShowCallTest(false)}
            >
              ✕
            </Button>
            <CallTestManager
              onTestComplete={(success) => {
                if (success) {
                  toast({
                    title: "Connection Test Passed!",
                    description: "Your device is ready for calls."
                  });
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Join Group Dialog */}
      <JoinGroupDialog 
        isOpen={showJoinGroupDialog}
        onClose={() => setShowJoinGroupDialog(false)}
        onGroupJoined={() => {
          setShowJoinGroupDialog(false);
          messagesData.refetch();
        }}
      />

      {/* WebRTC Call Manager for handling incoming calls */}
      <WebRTCCallManager />

      {/* Active Call Components */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          {activeCall.type === 'audio' ? (
            <AudioCall
              conversationId={activeCall.conversationId}
              otherUserId={activeCall.otherUser.id}
              otherUserName={activeCall.otherUser.display_name || activeCall.otherUser.username || 'Unknown User'}
              otherUserAvatar={activeCall.otherUser.avatar_url}
              onCallEnd={() => setActiveCall(null)}
            />
          ) : (
            <VideoCall
              conversationId={activeCall.conversationId}
              otherUserId={activeCall.otherUser.id}
              otherUserName={activeCall.otherUser.display_name || activeCall.otherUser.username || 'Unknown User'}
              otherUserAvatar={activeCall.otherUser.avatar_url}
              onCallEnd={() => setActiveCall(null)}
            />
          )}
        </div>
      )}

      {/* Incoming Call Popup */}
      {incomingCall && (
        <CallPopup
          isIncoming={true}
          callType={incomingCall.type}
          otherUser={{
            id: incomingCall.otherUser.id,
            username: incomingCall.otherUser.username,
            display_name: incomingCall.otherUser.display_name,
            avatar_url: incomingCall.otherUser.avatar_url,
            is_verified: incomingCall.otherUser.is_verified
          }}
          onAccept={() => {
            setActiveCall(incomingCall);
            setIncomingCall(null);
          }}
          onDecline={() => setIncomingCall(null)}
        />
      )}
    </div>
  );
};

export default Messages;