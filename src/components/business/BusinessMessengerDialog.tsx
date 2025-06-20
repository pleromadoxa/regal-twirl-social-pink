
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageSquare } from 'lucide-react';

interface BusinessMessengerDialogProps {
  businessPage: any;
  trigger?: React.ReactNode;
}

interface Message {
  id: string;
  message: string;
  sender_type: 'business' | 'customer';
  created_at: string;
  is_read: boolean;
}

const BusinessMessengerDialog = ({ businessPage, trigger }: BusinessMessengerDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationLoaded, setConversationLoaded] = useState(false);

  const loadConversation = async () => {
    if (!user || conversationLoaded) return;

    try {
      const { data, error } = await supabase
        .from('business_messages')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'business' | 'customer'
      }));

      setMessages(formattedMessages);
      setConversationLoaded(true);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_messages')
        .insert([{
          business_page_id: businessPage.id,
          customer_id: user.id,
          sender_type: 'customer',
          message: newMessage.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      const newMsg: Message = {
        ...data,
        sender_type: 'customer'
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

      toast({
        title: "Message sent",
        description: "Your message has been sent to the business"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !conversationLoaded) {
      loadConversation();
    }
  };

  if (!user) {
    return (
      <Button variant="outline" disabled>
        <MessageSquare className="w-4 h-4 mr-2" />
        Sign in to message
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={businessPage.avatar_url || businessPage.page_avatar_url} />
              <AvatarFallback>
                {businessPage.page_name[0]}
              </AvatarFallback>
            </Avatar>
            {businessPage.page_name}
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 h-[400px] pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with {businessPage.page_name}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      message.sender_type === 'customer'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_type === 'customer' ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2 mt-4">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[40px] max-h-[100px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || loading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessMessengerDialog;
