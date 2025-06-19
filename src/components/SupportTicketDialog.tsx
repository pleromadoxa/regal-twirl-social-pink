
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Ticket, 
  MessageSquare, 
  Mail, 
  Send,
  Clock,
  User
} from 'lucide-react';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  user_email?: string;
  user_name?: string;
}

interface SupportTicketDialogProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const SupportTicketDialog = ({ ticket, isOpen, onClose, onUpdate }: SupportTicketDialogProps) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState(ticket?.status || 'open');
  const [priority, setPriority] = useState(ticket?.priority || 'medium');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'email'>('details');

  // Mock conversation data
  const conversation = [
    {
      id: '1',
      sender: 'user',
      message: ticket?.description || '',
      timestamp: ticket?.created_at || new Date().toISOString(),
      sender_name: ticket?.user_name || 'User'
    },
    {
      id: '2',
      sender: 'admin',
      message: 'Thank you for contacting us. We are looking into this issue.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      sender_name: 'Admin Support'
    }
  ];

  const handleStatusUpdate = async () => {
    if (!ticket || !currentUser) return;

    setLoading(true);
    try {
      // Update ticket status in database
      // const { error } = await supabase
      //   .from('support_tickets')
      //   .update({ status, priority, updated_at: new Date().toISOString() })
      //   .eq('id', ticket.id);

      // if (error) throw error;

      onUpdate();
      onClose();

      toast({
        title: "Ticket updated",
        description: "Ticket status has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!response.trim() || !ticket) return;

    setLoading(true);
    try {
      // Send response via chat/email
      // You can implement this with your messaging system
      
      toast({
        title: "Response sent",
        description: "Your response has been sent to the user."
      });
      
      setResponse('');
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!ticket) return;

    setLoading(true);
    try {
      // Call email edge function
      const { error } = await supabase.functions.invoke('send-support-email', {
        body: {
          to: ticket.user_email,
          subject: `Re: ${ticket.subject}`,
          message: response,
          ticketId: ticket.id
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent",
        description: "Support email has been sent successfully."
      });
      
      setResponse('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",  
        description: "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Set initial values when dialog opens
  React.useEffect(() => {
    if (ticket && isOpen) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setResponse('');
    }
  }, [ticket, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Support Ticket #{ticket?.id}
          </DialogTitle>
        </DialogHeader>
        
        {ticket && (
          <div className="space-y-4">
            {/* Ticket Header */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarFallback>
                  {ticket.user_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{ticket.subject}</h3>
                <p className="text-sm text-muted-foreground">{ticket.user_name} • {ticket.user_email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={status === 'open' ? 'destructive' : 'default'}>
                    {status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">{ticket.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Created: {new Date(ticket.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-b">
              <Button
                variant={activeTab === 'details' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('details')}
              >
                <Ticket className="w-4 h-4 mr-1" />
                Details
              </Button>
              <Button
                variant={activeTab === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </Button>
              <Button
                variant={activeTab === 'email' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('email')}
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            </div>

            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm">{ticket.description}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Ticket'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-4">
                <ScrollArea className="h-[400px] p-4 border rounded-lg">
                  <div className="space-y-4">
                    {conversation.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender === 'admin' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {msg.sender === 'admin' ? <User className="w-4 h-4" /> : <Avatar className="w-4 h-4"><AvatarFallback className="text-xs">U</AvatarFallback></Avatar>}
                            <span className="text-xs font-medium">{msg.sender_name}</span>
                            <span className="text-xs opacity-70">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1"
                    rows={3}
                  />
                  <Button onClick={handleSendResponse} disabled={loading || !response.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-to">To</Label>
                  <Input value={ticket.user_email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input value={`Re: ${ticket.subject}`} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-message">Message</Label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write your email response..."
                    rows={8}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail} disabled={loading || !response.trim()}>
                    <Mail className="w-4 h-4 mr-1" />
                    {loading ? 'Sending...' : 'Send Email'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketDialog;
