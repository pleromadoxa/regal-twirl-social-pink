import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CircleEvent {
  id: string;
  circle_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  is_online: boolean;
  event_link: string | null;
  max_attendees: number | null;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'going' | 'maybe' | 'not_going';
  created_at: string;
}

export const useCircleEvents = (circleId: string | null) => {
  const [events, setEvents] = useState<CircleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!circleId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('circle_events')
        .select('*')
        .eq('circle_id', circleId)
        .order('starts_at', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Failed to load events",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [circleId]);

  const createEvent = async (eventData: Partial<CircleEvent>) => {
    if (!circleId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('circle_events')
        .insert([{ ...eventData, circle_id: circleId, creator_id: user.id } as any])
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Event created successfully" });
      await fetchEvents();
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateEventStatus = async (eventId: string, status: EventAttendee['status']) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_event_attendees')
        .upsert([{
          event_id: eventId,
          user_id: user.id,
          status
        }]);

      if (error) throw error;

      toast({ title: "RSVP updated" });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to update RSVP",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    events,
    loading,
    createEvent,
    updateEventStatus,
    refetch: fetchEvents
  };
};
