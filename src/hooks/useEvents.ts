import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  location?: string;
  starts_at: string;
  ends_at?: string;
  is_online: boolean;
  max_attendees?: number;
  attendees_count: number;
  cover_image_url?: string;
  created_at: string;
  userAttendance?: 'going' | 'interested' | 'not_going';
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
        const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true });

      if (error) throw error;

      // Get user attendance for each event if logged in
      if (user && data) {
        const eventsWithAttendance = await Promise.all(
          data.map(async (event: any) => {
            const { data: attendance } = await supabase
              .from('event_attendees')
              .select('status')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .maybeSingle();

            return {
              ...event,
              userAttendance: attendance?.status,
              profiles: event.profiles || {
                username: '',
                display_name: '',
                avatar_url: ''
              }
            };
          })
        );
        setEvents(eventsWithAttendance);
      } else {
        const eventsData = data?.map((event: any) => ({
          ...event,
          profiles: event.profiles || {
            username: '',
            display_name: '',
            avatar_url: ''
          }
        })) || [];
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    location?: string;
    starts_at: string;
    ends_at?: string;
    is_online: boolean;
    max_attendees?: number;
    cover_image_url?: string;
  }) => {
    if (!user) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          ...eventData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Event created",
        description: "Your event has been created successfully"
      });

      await fetchEvents(); // Refresh events list
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (eventId: string, status: 'going' | 'interested' | 'not_going') => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('event_attendees')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status
        });

      if (error) throw error;

      toast({
        title: "Attendance updated",
        description: `You are now marked as ${status}`
      });

      await fetchEvents(); // Refresh events list
      return true;
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully"
      });

      await fetchEvents(); // Refresh events list
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    createEvent,
    updateAttendance,
    deleteEvent,
    refetch: fetchEvents
  };
};