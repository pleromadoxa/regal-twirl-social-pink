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
  Bell,
  Shield,
  Trash2,
  Download,
  RefreshCw,
  Phone
} from "lucide-react";
import { useEnhancedMessages } from "@/hooks/useEnhancedMessages";
import ConversationStarter from "@/components/ConversationStarter";
import MessageThread from "@/components/MessageThread";
import CallHistorySection from "@/components/CallHistorySection";
import GroupCallDialog from "@/components/GroupCallDialog";
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
import { fetchUserGroupConversations, type GroupConversation } from "@/services/groupConversationService";

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
  const [groupChats, setGroupChats] = useState<GroupConversation[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchGroupChats = async () => {
    if (!user) return;
    
    setGroupsLoading(true);
    try {
      console.log('Fetching group chats for user:', user.id);
      const groups = await fetchUserGroupConversations(user.id);
      console.log('Fetched groups:', groups);
      setGroupChats(groups);
    } catch (error) {
      console.error('Error fetching group chats:', error);
      setGroupChats([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === "groups") {
      fetchGroupChats();
    }
  }, [user, activeTab]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearCache();
    await refetch();
    if (activeTab === "groups") {
      await fetchGroupChats();
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleGroupSelect = (groupId: string) => {
    console.log('Group selected:', groupId);
    // For now, just log the selection
    // In a real implementation, you'd open the group chat
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

  const filteredGroupChats = groupChats.filter(group => {
    const searchLower = searchQuery.toLowerCase();
    return group.name.toLowerCase().includes(searchLower);
  });

  // Get all conversation participants for group calls
  const allParticipants = conversations.map(conv => conv.other_user).filter(Boolean) as Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  }>;

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
        <div className="w-96 border-r border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-purple-600" />
                Messages
              </h1>
              <div className="flex items-center gap-2">
                <GroupCallDialog participants={allParticipants} />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:border-purple-600 dark:hover:bg-purple-900/20"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
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
            <TabsList className="grid w-full grid-cols-5 mx-4 mt-2">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="groups" className="text-xs">Groups</TabsTrigger>
              <TabsTrigger value="calls" className="text-xs">Calls</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
              <TabsTrigger value="archived" className="text-xs">Archive</TabsTrigger>
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

            <TabsContent value="groups" className="flex-1 overflow-hidden">
              {/* Group Chats List */}
              <div className="p-4 space-y-2 overflow-y-auto h-full">
                {groupsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500 text-sm">Loading group chats...</p>
                  </div>
                ) : filteredGroupChats.length > 0 ? (
                  filteredGroupChats.map((group) => (
                    <Card 
                      key={group.id} 
                      className="hover:shadow-md transition-all cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                    >
                      <CardContent className="p-3">
                        <div
                          onClick={() => handleGroupSelect(group.id)}
                          className="flex items-center space-x-3 w-full"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                              {group.avatar_url ? (
                                <img
                                  src={group.avatar_url}
                                  alt={group.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <Users className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-400 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">{group.member_count}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {group.name}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  {group.member_count} members
                                </Badge>
                              </div>
                              <span className="text-xs text-slate-500">
                                {group.last_message_at 
                                  ? formatDistanceToNow(new Date(group.last_message_at), { addSuffix: true })
                                  : formatDistanceToNow(new Date(group.created_at), { addSuffix: true })
                                }
                              </span>
                            </div>
                            {group.description && (
                              <p className="text-xs text-slate-500 truncate mt-1">
                                {group.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-slate-500">Members:</span>
                              <div className="flex -space-x-1">
                                {group.members.slice(0, 3).map((member) => (
                                  <div key={member.id} className="relative">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center border border-white dark:border-slate-800">
                                      {member.avatar_url ? (
                                        <img
                                          src={member.avatar_url}
                                          alt={member.display_name}
                                          className="w-full h-full object-cover rounded-full"
                                        />
                                      ) : (
                                        <span className="text-white text-xs font-bold">
                                          {member.display_name[0].toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {group.member_count > 3 && (
                                  <div className="w-5 h-5 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center border border-white dark:border-slate-800">
                                    <span className="text-white text-xs font-bold">+{group.member_count - 3}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      No group chats yet
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Create your first group chat to get started!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calls" className="flex-1 p-4 overflow-y-auto">
              <CallHistorySection />
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
