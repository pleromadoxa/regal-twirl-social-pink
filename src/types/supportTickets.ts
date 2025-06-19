
export interface SupportTicket {
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

export interface SupportTicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}
