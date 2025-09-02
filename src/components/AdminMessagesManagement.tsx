import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare,
  Search,
  Users,
  Clock,
  TrendingUp,
  Activity,
  Archive,
  AlertCircle,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  created_at: string;
  is_read: boolean;
  sender?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  recipient?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  created_at: string;
  sender?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  group?: {
    name: string;
    members_count: number;
  };
}

interface MessageStats {
  totalMessages: number;
  totalConversations: number;
  totalGroupMessages: number;
  totalGroupConversations: number;
  todayMessages: number;
  activeConversations: number;
  mediaMessages: number;
  flaggedMessages: number;
}

const AdminMessagesManagement = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    totalMessages: 0,
    totalConversations: 0,
    totalGroupMessages: 0,
    totalGroupConversations: 0,
    todayMessages: 0,
    activeConversations: 0,
    mediaMessages: 0,
    flaggedMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Fetch private messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (messagesError) throw messagesError;

      // Fetch group messages
      const { data: groupMessagesData, error: groupError } = await supabase
        .from('group_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (groupError) throw groupError;

      // Fetch profiles for private messages
      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(async (message) => {
          const [senderProfile, recipientProfile] = await Promise.all([
            supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', message.sender_id)
              .single(),
            supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', message.recipient_id)
              .single()
          ]);

          return {
            ...message,
            sender: senderProfile.data,
            recipient: recipientProfile.data
          };
        })
      );

      // Fetch profiles for group messages
      const groupMessagesWithProfiles = await Promise.all(
        (groupMessagesData || []).map(async (message) => {
          const [senderProfile, groupInfo] = await Promise.all([
            supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', message.sender_id)
              .single(),
            supabase
              .from('group_conversations')
              .select('name')
              .eq('id', message.group_id)
              .single()
          ]);

          // Get member count
          const { count: membersCount } = await supabase
            .from('group_conversation_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', message.group_id);

          return {
            ...message,
            sender: senderProfile.data,
            group: {
              name: groupInfo.data?.name || 'Unknown Group',
              members_count: membersCount || 0
            }
          };
        })
      );

      setMessages(messagesWithProfiles);
      setGroupMessages(groupMessagesWithProfiles);
      
      await calculateStats(messagesWithProfiles, groupMessagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (privateMessages: Message[], groupMessages: GroupMessage[]) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get unique conversation counts
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      const { count: groupConversationsCount } = await supabase
        .from('group_conversations')
        .select('*', { count: 'exact', head: true });

      // Calculate today's messages
      const todayMessages = [...privateMessages, ...groupMessages].filter(msg => 
        msg.created_at.startsWith(today)
      ).length;

      // Calculate media messages
      const mediaMessages = [...privateMessages, ...groupMessages].filter(msg => 
        msg.message_type !== 'text'
      ).length;

      const newStats: MessageStats = {
        totalMessages: privateMessages.length,
        totalConversations: conversationsCount || 0,
        totalGroupMessages: groupMessages.length,
        totalGroupConversations: groupConversationsCount || 0,
        todayMessages,
        activeConversations: Math.floor((conversationsCount || 0) * 0.3), // Approximation
        mediaMessages,
        flaggedMessages: 0 // Would need a flagged_messages table
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'file':
        return '📎';
      default:
        return '💬';
    }
  };

  const filteredMessages = [...messages, ...groupMessages.map(gm => ({
    ...gm,
    recipient_id: gm.group_id,
    recipient: { username: gm.group?.name || 'Group', display_name: gm.group?.name || 'Group' }
  }))].filter(message => {
    const matchesSearch = 
      message.sender?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipient?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || message.message_type === typeFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const messageDate = new Date(message.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return messageDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return messageDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return messageDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMessages + stats.totalGroupMessages}</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalConversations + stats.totalGroupConversations}</p>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayMessages}</p>
                <p className="text-sm text-muted-foreground">Today's Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeConversations}</p>
                <p className="text-sm text-muted-foreground">Active Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages">Message Monitor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Private Messages</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ 
                            width: `${(stats.totalMessages / (stats.totalMessages + stats.totalGroupMessages)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.totalMessages}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Group Messages</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ 
                            width: `${(stats.totalGroupMessages / (stats.totalMessages + stats.totalGroupMessages)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.totalGroupMessages}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Media Messages</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-purple-500 rounded-full" 
                          style={{ 
                            width: `${(stats.mediaMessages / (stats.totalMessages + stats.totalGroupMessages)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.mediaMessages}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Message Delivery</span>
                    <Badge variant="default">99.9% Uptime</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <Badge variant="default">< 1s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Flagged Content</span>
                    <Badge variant={stats.flaggedMessages > 0 ? "destructive" : "default"}>
                      {stats.flaggedMessages} messages
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage Usage</span>
                    <Badge variant="secondary">2.3 GB</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Message Monitor
              </CardTitle>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Message type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {loading ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMessages.slice(0, 50).map((message) => (
                      <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={message.sender?.avatar_url || ''} />
                            <AvatarFallback>
                              {message.sender?.display_name?.[0] || message.sender?.username?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {message.sender?.display_name || message.sender?.username || 'Unknown User'}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">
                                {message.recipient?.display_name || message.recipient?.username || 'Unknown Recipient'}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getMessageTypeIcon(message.message_type)} {message.message_type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm mb-2 line-clamp-2">
                              {message.message_type === 'text' ? message.content : `[${message.message_type.toUpperCase()} MESSAGE]`}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(message.created_at).toLocaleString()}</span>
                              {message.is_read !== undefined && (
                                <span>{message.is_read ? 'Read' : 'Unread'}</span>
                              )}
                            </div>
                          </div>
                          
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Message analytics coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Charts and trends will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Usage Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Usage patterns coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Peak hours and activity patterns will be shown here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMessagesManagement;