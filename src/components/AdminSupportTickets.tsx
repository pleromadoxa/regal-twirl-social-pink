
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket } from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import type { SupportTicket, SupportTicketStats } from '@/types/supportTickets';
import SupportTicketDialog from './SupportTicketDialog';
import SupportTicketStatsCards from './support/SupportTicketStatsCards';
import SupportTicketsList from './support/SupportTicketsList';
import SupportTicketsFilters from './support/SupportTicketsFilters';

const AdminSupportTickets = () => {
  const { tickets, loading, refetch } = useSupportTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  const handleTicketUpdate = () => {
    refetch(); // Refresh tickets after update
  };

  const openTicketDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketDialogOpen(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats: SupportTicketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <SupportTicketStatsCards stats={stats} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Support Tickets
            </CardTitle>
            <SupportTicketsFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
            />
          </CardHeader>
          <CardContent>
            <SupportTicketsList
              tickets={filteredTickets}
              loading={loading}
              onTicketClick={openTicketDialog}
            />
          </CardContent>
        </Card>
      </div>

      <SupportTicketDialog
        ticket={selectedTicket}
        isOpen={ticketDialogOpen}
        onClose={() => {
          setTicketDialogOpen(false);
          setSelectedTicket(null);
        }}
        onUpdate={handleTicketUpdate}
      />
    </>
  );
};

export default AdminSupportTickets;
