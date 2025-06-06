
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import { MessageCircle, Users } from "lucide-react";
import { useEnhancedMessages } from "@/hooks/useEnhancedMessages";
import ConversationStarter from "@/components/ConversationStarter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading: conversationsLoading, setSelectedConversation } = useEnhancedMessages();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-purple-600" />
            Messages
          </h1>
        </div>

        <ConversationStarter />

        <div className="p-6">
          {conversationsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-slate-500">Loading conversations...</p>
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Your Conversations
              </h2>
              {conversations.map((conversation) => (
                <Card key={conversation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedConversation(conversation.id)}
                      className="w-full h-auto p-0 justify-start"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          {conversation.other_user?.avatar_url ? (
                            <img
                              src={conversation.other_user.avatar_url}
                              alt={conversation.other_user.display_name || conversation.other_user.username}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {(conversation.other_user?.display_name || conversation.other_user?.username || 'U')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {conversation.other_user?.display_name || conversation.other_user?.username || 'Unknown User'}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            @{conversation.other_user?.username || 'unknown'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Last active {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-300px)]">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-16 h-16 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                  No conversations yet
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                  Start your first conversation by clicking "New Message" above. Connect with friends and colleagues through private messages!
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Messages;
