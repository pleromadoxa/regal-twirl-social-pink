
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SupportTicket } from '@/types/supportTickets';

export const useSupportTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      console.log('Fetching support tickets...');
      
      // First, get all post reports
      const { data: reportData, error: reportError } = await supabase
        .from('post_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportError) {
        console.error('Error fetching post reports:', reportError);
        throw reportError;
      }

      console.log('Post reports fetched:', reportData?.length || 0);

      // Get user profiles separately for each report
      const transformedTickets: SupportTicket[] = [];

      if (reportData && reportData.length > 0) {
        for (const report of reportData) {
          // Fetch user profile for each report
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', report.reporter_id)
            .single();

          if (profileError) {
            console.warn('Could not fetch profile for reporter:', report.reporter_id, profileError);
          }

          transformedTickets.push({
            id: report.id,
            user_id: report.reporter_id,
            subject: `Content Report: ${report.reason}`,
            description: report.details || `Report submitted for ${report.reason}`,
            status: report.status === 'pending' ? 'open' : 
                   report.status === 'reviewed' ? 'resolved' : 'closed',
            priority: report.reason === 'spam' || report.reason === 'harassment' ? 'high' : 'medium',
            category: 'Content Moderation',
            created_at: report.created_at,
            updated_at: report.reviewed_at || report.created_at,
            user_name: profileData?.display_name || profileData?.username || 'Anonymous User',
            user_email: `${profileData?.username || 'user'}@example.com`
          });
        }
      }

      // Add some mock technical support tickets to demonstrate the system
      const mockTechnicalTickets: SupportTicket[] = [
        {
          id: 'tech_1',
          user_id: 'mock_user_1',
          subject: 'Unable to upload profile picture',
          description: 'I am trying to upload a new profile picture but it keeps failing. The image is less than 5MB and in JPG format.',
          status: 'open',
          priority: 'medium',
          category: 'Technical',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_email: 'john@example.com',
          user_name: 'John Doe'
        },
        {
          id: 'billing_1',
          user_id: 'mock_user_2',
          subject: 'Billing issue with premium subscription',
          description: 'I was charged twice for my premium subscription this month. Can you please help me get a refund?',
          status: 'in_progress',
          priority: 'high',
          category: 'Billing',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString(),
          user_email: 'jane@example.com',
          user_name: 'Jane Smith',
          assigned_to: 'admin1'
        }
      ];

      const allTickets = [...transformedTickets, ...mockTechnicalTickets];
      console.log('Total tickets processed:', allTickets.length);
      setTickets(allTickets);

    } catch (error) {
      console.error('Error fetching support tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return { tickets, loading, refetch: fetchTickets };
};
