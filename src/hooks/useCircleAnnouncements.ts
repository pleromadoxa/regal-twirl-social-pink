import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CircleAnnouncement {
  id: string;
  circle_id: string;
  creator_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export const useCircleAnnouncements = (circleId: string | null) => {
  const [announcements, setAnnouncements] = useState<CircleAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    if (!circleId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('circle_announcements')
        .select('*')
        .eq('circle_id', circleId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [circleId]);

  const createAnnouncement = async (announcementData: {
    title: string;
    content: string;
    is_pinned?: boolean;
  }) => {
    if (!circleId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('circle_announcements')
        .insert([{
          circle_id: circleId,
          creator_id: user.id,
          ...announcementData
        }])
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Announcement created" });
      await fetchAnnouncements();
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to create announcement",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('circle_announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;

      toast({ title: "Announcement deleted" });
      await fetchAnnouncements();
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to delete announcement",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    announcements,
    loading,
    createAnnouncement,
    deleteAnnouncement,
    refetch: fetchAnnouncements
  };
};
