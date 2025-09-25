import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MessageThread from '@/components/MessageThread';
import MessageSearch from '@/components/MessageSearch';
import AudioCall from '@/components/AudioCall';
import VideoCall from '@/components/VideoCall';
import CallPopup from '@/components/CallPopup';
import CallTestManager from '@/components/CallTestManager';
import CallDiagnostics from '@/components/CallDiagnostics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Bell, Archive, Search, User, Plus, Hash, Star, ArrowLeft, Phone, Video, PhoneCall, Clock, PhoneIncoming, PhoneOutgoing, PhoneMissed, Users } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import WebRTCCallManager from '@/components/WebRTCCallManager';
import { GroupOptionsMenu } from '@/components/GroupOptionsMenu';
import MobileBottomNav from '@/components/MobileBottomNav';
import GroupCreationDialog from '@/components/GroupCreationDialog';
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
  
  // ALL hooks must be called before any conditional returns
  
  const messagesData = useEnhancedMessages();
  const { callHistory, loading: callHistoryLoading } = useCallHistory();

  const selectedConversation = searchParams.get('conversation');
  const { conversations, groupConversations, loading, error } = messagesData;

  // handlers, filters

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50/80 via-white to-pink-50/80 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <SidebarNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Messages Sidebar */}
        <div className={cn(
          "w-full lg:w-80 xl:w-96 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-r border-purple-200/50",
          selectedConversation && "hidden lg:block"
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-purple-200/50">
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
              <div className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-xl p-1 backdrop-blur-sm">
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
              <div className="mt-4">
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
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading conversations...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Sample conversation items */}
                  <div className="p-4 cursor-pointer rounded-xl transition-all duration-200 bg-white/60 dark:bg-gray-800/60 hover:bg-purple-50/80 dark:hover:bg-purple-900/20">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            Test User
                          </h3>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            Now
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          Start a conversation...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <MessageThread
              conversationId={selectedConversation}
              onBack={() => setSearchParams({})}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:to-purple-900/20">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Select a conversation
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block">
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>

      {/* Call Test Dialog */}
      {showCallTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10"
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
          type={incomingCall.type}
          callerName={incomingCall.otherUser.display_name || incomingCall.otherUser.username || 'Unknown User'}
          callerAvatar={incomingCall.otherUser.avatar_url}
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
