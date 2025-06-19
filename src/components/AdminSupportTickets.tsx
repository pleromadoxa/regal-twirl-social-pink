
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ticket, 
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SupportTicketDialog from './SupportTicketDialog';

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

const AdminSupportTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Mock data for now - you can replace this with real Supabase queries
      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          user_id: 'user1',
          subject: 'Cannot upload profile picture',
          description: 'Getting an error when trying to upload my profile picture. Please help!',
          status: 'open',
          priority: 'medium',
          category: 'Technical',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_email: 'user@example.com',
          user_name: 'John Doe'
        },
        {
          id: '2',
          user_id: 'user2',
          subject: 'Account verification issue',
          description: 'My account verification has been pending for weeks. Can you help?',
          status: 'in_progress',
          priority: 'high',
          category: 'Account',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          assigned_to: 'admin1',
          user_email: 'jane@example.com',
          user_name: 'Jane Smith'
        }
      ];
      setTickets(mockTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTicketDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && ticket.status === activeTab;
  });

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ticketStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ticketStats.open}</p>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ticketStats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ticketStats.resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Support Tickets
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {loading ? (
                    <div className="text-center py-12">
                      <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Loading tickets...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTickets.map((ticket) => (
                        <div key={ticket.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => openTicketDialog(ticket)}>
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {ticket.user_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{ticket.subject}</h4>
                              <Badge variant={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                              <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{ticket.user_name} • {ticket.user_email}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{ticket.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <span>Category: {ticket.category}</span>
                              <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="w-4 h-4 mr-1" />
                              Email
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
        </Tabs>
      </div>

      <SupportTicketDialog
        ticket={selectedTicket}
        isOpen={ticketDialogOpen}
        onClose={() => {
          setTicketDialogOpen(false);
          setSelectedTicket(null);
        }}
        onUpdate={() => fetchTickets()}
      />
    </>
  );
};

export default AdminSupportTickets;
