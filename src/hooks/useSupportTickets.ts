
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  reviewed_at: string;
  assigned_to?: string;
  user_email?: string;
  user_name?: string;
  post_id?: string;
  reason?: string;
  reporter_id?: string;
  reviewed_by?: string;
  details?: string;
  admin_notes?: string;
}

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // For now, we'll fetch from post_reports as a placeholder
      // In a real app, you'd have a dedicated support_tickets table
      const { data, error } = await supabase
        .from('post_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching support tickets:', error);
        return;
      }

      // Transform post_reports data to match SupportTicket interface
      const transformedTickets = data?.map(report => ({
        id: report.id,
        user_id: report.reporter_id,
        subject: `Report: ${report.reason}`,
        description: report.details || report.reason,
        status: report.status as 'open' | 'in_progress' | 'resolved' | 'closed',
        priority: 'medium' as const,
        category: 'Content Report',
        created_at: report.created_at,
        reviewed_at: report.reviewed_at || report.created_at,
        assigned_to: report.reviewed_by,
        post_id: report.post_id,
        reason: report.reason,
        reporter_id: report.reporter_id,
        reviewed_by: report.reviewed_by,
        details: report.details,
        admin_notes: report.admin_notes
      })) || [];

      setTickets(transformedTickets);
    } catch (error) {
      console.error('Error in fetchTickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchTickets();
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  return {
    tickets,
    loading,
    refetch
  };
};
