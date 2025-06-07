
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, User } from 'lucide-react';

interface BusinessMessagesProps {
  businessPage: any;
}

interface Message {
  id: string;
  customer_id: string;
  sender_type: 'business' | 'customer';
  message: string;
  is_read: boolean;
  created_at: string;
  customer_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface Conversation {
  customer_id: string;
  customer_profile: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const BusinessMessages = ({ businessPage }: BusinessMessagesProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, [businessPage.id]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchMessages(selectedCustomer);
      markMessagesAsRead(selectedCustomer);
    }
  }, [selectedCustomer]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Get all messages for this business page
      const { data: messagesData, error } = await supabase
        .from('business_messages')
        .select(`
          customer_id,
          message,
          created_at,
          sender_type,
          is_read
        `)
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by customer and get customer profiles
      const customerIds = [...new Set(messagesData?.map(m => m.customer_id) || [])];
      
      if (customerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', customerIds);

        // Create conversations summary
        const conversationsMap = new Map();
        
        messagesData?.forEach(msg => {
          if (!conversationsMap.has(msg.customer_id)) {
            const profile = profilesData?.find(p => p.id === msg.customer_id);
            conversationsMap.set(msg.customer_id, {
              customer_id: msg.customer_id,
              customer_profile: profile || { username: 'Unknown', display_name: 'Unknown User', avatar_url: null },
              last_message: msg.message,
              last_message_time: msg.created_at,
              unread_count: 0
            });
          }
          
          // Count unread messages from customers
          if (msg.sender_type === 'customer' && !msg.is_read) {
            const conv = conversationsMap.get(msg.customer_id);
            conv.unread_count++;
          }
        });

        setConversations(Array.from(conversationsMap.values()));
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_messages')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Get customer profile separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', customerId)
        .single();

      const messagesWithProfile = data?.map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'business' | 'customer',
        customer_profile: profileData
      })) || [];

      setMessages(messagesWithProfile);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive"
      });
    }
  };

  const markMessagesAsRead = async (customerId: string) => {
    try {
      await supabase
        .from('business_messages')
        .update({ is_read: true })
        .eq('business_page_id', businessPage.id)
        .eq('customer_id', customerId)
        .eq('sender_type', 'customer')
        .eq('is_read', false);

      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer) return;

    try {
      const { error } = await supabase
        .from('business_messages')
        .insert([{
          business_page_id: businessPage.id,
          customer_id: selectedCustomer,
          sender_type: 'business',
          message: newMessage.trim()
        }]);

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedCustomer);
      fetchConversations();

      toast({
        title: "Success",
        description: "Message sent"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const selectedConversation = conversations.find(c => c.customer_id === selectedCustomer);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Customer Messages</h2>
        <p className="text-muted-foreground">Communicate with your customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No customer messages yet
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.customer_id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b ${
                      selectedCustomer === conversation.customer_id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                    }`}
                    onClick={() => setSelectedCustomer(conversation.customer_id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.customer_profile.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium truncate">
                            {conversation.customer_profile.display_name || conversation.customer_profile.username}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conversation.last_message_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="col-span-2">
          {selectedCustomer ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedConversation?.customer_profile.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  {selectedConversation?.customer_profile.display_name || selectedConversation?.customer_profile.username}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full p-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'business' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_type === 'business'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_type === 'business' ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[40px] max-h-[120px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BusinessMessages;
