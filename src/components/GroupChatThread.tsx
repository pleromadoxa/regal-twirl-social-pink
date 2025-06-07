
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Send, 
  MoreVertical, 
  Reply, 
  Settings, 
  UserPlus, 
  LogOut,
  Crown,
  Users,
  Copy,
  Pin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  fetchGroupMessages,
  sendGroupMessage,
  leaveGroup,
  type GroupConversation,
  type GroupMessage
} from '@/services/groupConversationService';

interface GroupChatThreadProps {
  group: GroupConversation;
  onLeaveGroup: () => void;
}

const GroupChatThread = ({ group, onLeaveGroup }: GroupChatThreadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<GroupMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
  }, [group.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!group.id) return;
    
    setLoading(true);
    try {
      const groupMessages = await fetchGroupMessages(group.id);
      setMessages(groupMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const message = await sendGroupMessage(
        group.id,
        user.id,
        newMessage.trim(),
        'text',
        replyTo?.id
      );
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    
    try {
      await leaveGroup(group.id, user.id);
      toast({
        title: "Left group",
        description: `You have left ${group.name}`,
      });
      onLeaveGroup();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive"
      });
    }
  };

  const copyInviteCode = () => {
    if (group.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      toast({
        title: "Invite code copied",
        description: "Share this code with others to invite them to the group",
      });
    }
  };

  const getUserRole = () => {
    if (!user) return 'member';
    const member = group.members.find(m => m.id === user.id);
    return member?.role || 'member';
  };

  const isAdmin = () => getUserRole() === 'admin';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={group.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Users className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              {group.is_private && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                  <Crown className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {group.name}
                </h2>
                {isAdmin() && (
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {group.member_count} members
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyInviteCode}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Invite Code
              </DropdownMenuItem>
              {isAdmin() && (
                <>
                  <DropdownMenuItem>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Manage Members
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Group Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={handleLeaveGroup}
                className="text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {group.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {group.description}
          </p>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={message.sender?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                    {(message.sender?.display_name || message.sender?.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex-1 max-w-[70%] ${message.sender_id === user?.id ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {message.sender?.display_name || message.sender?.username}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    {message.edited_at && (
                      <Badge variant="outline" className="text-xs">
                        edited
                      </Badge>
                    )}
                  </div>

                  {message.reply_to && (
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2 mb-2 border-l-2 border-purple-500">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Replying to {message.reply_to.sender_name}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                        {message.reply_to.content}
                      </p>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.sender_id === user?.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>

                  {message.sender_id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 text-xs"
                      onClick={() => setReplyTo(message)}
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">No messages yet</p>
              <p className="text-sm text-slate-400">Be the first to say hello!</p>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-purple-200 dark:border-purple-800 p-4">
        {replyTo && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Replying to {replyTo.sender?.display_name}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                {replyTo.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 border-0"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatThread;
