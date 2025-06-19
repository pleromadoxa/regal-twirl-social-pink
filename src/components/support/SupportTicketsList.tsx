
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar
} from 'lucide-react';
import { SupportTicket } from '@/types/supportTickets';

interface SupportTicketsListProps {
  tickets: SupportTicket[];
  loading: boolean;
  onTicketClick: (ticket: SupportTicket) => void;
}

const SupportTicketsList = ({ tickets, loading, onTicketClick }: SupportTicketsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Loading support tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No tickets found</h3>
        <p className="text-gray-500">No support tickets match your current filters.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div 
            key={ticket.id} 
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            onClick={() => onTicketClick(ticket)}
          >
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {ticket.user_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">{ticket.subject}</h4>
                <Badge variant={getStatusColor(ticket.status)} className="flex items-center gap-1">
                  {getStatusIcon(ticket.status)}
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge variant={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2 truncate">
                {ticket.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {ticket.user_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
                {ticket.assigned_to && (
                  <span>Assigned to: {ticket.assigned_to}</span>
                )}
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SupportTicketsList;
