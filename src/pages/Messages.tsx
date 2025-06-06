import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import { 
  MessageCircle, 
  Users, 
  Search, 
  Settings, 
  Archive, 
  Zap,
  MoreVertical,
  Bell,
  Shield,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react";
import { useEnhancedMessages } from "@/hooks/useEnhancedMessages";
import ConversationStarter from "@/components/ConversationStarter";
import MessageThread from "@/components/MessageThread";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { 
    conversations, 
    messages, 
    loading: conversationsLoading, 
    selectedConversation,
    setSelectedConversation,
    refetch,
    clearCache
  } = useEnhancedMessages();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearCache();
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

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

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.other_user?.display_name?.toLowerCase().includes(searchLower) ||
      conv.other_user?.username?.toLowerCase().includes(searchLower)
    );
  });

  const handleSettingsAction = (action: string) => {
    switch (action) {
      case 'notifications':
        console.log('Open notification settings');
        break;
      case 'privacy':
        console.log('Open privacy settings');
        break;
      case 'export':
        console.log('Export chat history');
        break;
      case 'clear':
        console.log('Clear chat history');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-purple-600" />
                Messages
              </h1>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSettingsAction('notifications')}>
                      <Bell className="w-4 h-4 mr-2" />
                      Notification Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSettingsAction('privacy')}>
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSettingsAction('export')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Chat History
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleSettingsAction('clear')}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Chats
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-100 dark:bg-slate-700 border-0 rounded-full"
              />
            </div>

            {/* Quick Actions */}
            <ConversationStarter />
          </div>

          {/* Conversation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
              <TabsTrigger value="archived" className="text-xs">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-hidden">
              {/* Conversations List */}
              <div className="p-4 space-y-2 overflow-y-auto h-full">
                {conversationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500 text-sm">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <Card 
                      key={conversation.id} 
                      className={`hover:shadow-md transition-all cursor-pointer ${
                        selectedConversation === conversation.id 
                          ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                          : 'hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div
                          onClick={() => setSelectedConversation(conversation.id)}
                          className="flex items-center space-x-3 w-full"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                              {conversation.other_user?.avatar_url ? (
                                <img
                                  src={conversation.other_user.avatar_url}
                                  alt={conversation.other_user.display_name || conversation.other_user.username}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="text-white font-bold text-lg">
                                  {(conversation.other_user?.display_name || conversation.other_user?.username || 'U')[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white dark:border-slate-800 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {conversation.other_user?.display_name || conversation.other_user?.username || 'Unknown User'}
                                </h3>
                                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                                  <Zap className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                                  <span className="text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                                    {conversation.streak_count || 0}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              @{conversation.other_user?.username || 'unknown'}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-slate-500 truncate flex-1">
                                {conversation.last_message?.content || "No messages yet"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      No conversations yet
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Start your first conversation!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="unread" className="flex-1 p-4">
              <div className="text-center py-12">
                <Badge className="bg-purple-100 text-purple-700 mb-4">Coming Soon</Badge>
                <p className="text-sm text-slate-500">Unread messages will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="archived" className="flex-1 p-4">
              <div className="text-center py-12">
                <Archive className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-500">No archived conversations</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {selectedConversation ? (
            <MessageThread conversationId={selectedConversation} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white/40 dark:bg-slate-800/40">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                  Select a conversation
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Choose a conversation from the sidebar to start messaging, or create a new one!
                </p>
                <div className="space-y-3">
                  <ConversationStarter />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;
