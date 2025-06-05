
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Send, ArrowLeft, PlusCircle, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import SidebarNav from "@/components/SidebarNav";
import { format } from "date-fns";

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { conversations, messages, loading, selectedConversation, setSelectedConversation, sendMessage } = useMessages();
  
  const [newMessage, setNewMessage] = useState("");
  const [newConversationUserId, setNewConversationUserId] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId) {
      setNewConversationUserId(userId);
    }
  }, [searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (selectedConversation) {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation?.other_user) {
        await sendMessage(conversation.other_user.id, newMessage);
        setNewMessage("");
      }
    } else if (newConversationUserId) {
      await sendMessage(newConversationUserId, newMessage);
      setNewMessage("");
      setNewConversationUserId("");
      setShowNewChat(false);
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConversation ? messages : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 border-x border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 p-5 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Conversations</h1>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNewChat(!showNewChat)}
                  className="rounded-full"
                >
                  <PlusCircle className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <Users className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {showNewChat && (
              <div className="mt-4">
                <Input
                  placeholder="Enter user ID to start conversation..."
                  value={newConversationUserId}
                  onChange={(e) => setNewConversationUserId(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
            )}
          </div>

          {/* Conversations */}
          <div className="overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-slate-100 dark:bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                      {conversation.other_user?.avatar_url ? (
                        <img
                          src={conversation.other_user.avatar_url}
                          alt={conversation.other_user.display_name || conversation.other_user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                          {(conversation.other_user?.display_name || conversation.other_user?.username || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {conversation.other_user?.display_name || conversation.other_user?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {format(new Date(conversation.last_message_at), 'MMM d')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No conversations yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Start a new conversation using the + button</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation || newConversationUserId ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 bg-white dark:bg-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedConversation(null);
                    setNewConversationUserId("");
                    setShowNewChat(false);
                  }}
                  className="md:hidden"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                  {selectedConversationData?.other_user?.avatar_url ? (
                    <img
                      src={selectedConversationData.other_user.avatar_url}
                      alt={selectedConversationData.other_user.display_name || selectedConversationData.other_user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {(selectedConversationData?.other_user?.display_name || selectedConversationData?.other_user?.username || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedConversationData?.other_user?.display_name || selectedConversationData?.other_user?.username || 'New Conversation'}
                  </p>
                  {selectedConversationData?.other_user?.username && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      @{selectedConversationData.other_user.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-25 dark:bg-slate-900">
                {conversationMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 dark:text-slate-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          message.sender_id === user.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.sender_id === user.id
                            ? 'text-purple-200'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
                <div className="flex gap-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-2xl border-slate-300 dark:border-slate-600"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="rounded-2xl px-6 bg-purple-600 hover:bg-purple-700"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-25 dark:bg-slate-900">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Your Conversations
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Select a conversation to start messaging
                </p>
                <Button 
                  onClick={() => setShowNewChat(true)}
                  className="bg-purple-600 hover:bg-purple-700 rounded-2xl"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Messages;
