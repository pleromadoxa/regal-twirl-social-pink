import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LiveStream {
  id: string;
  streamer_id: string;
  title: string;
  description: string | null;
  stream_key: string | null;
  stream_url: string | null;
  thumbnail_url: string | null;
  status: 'offline' | 'live' | 'ended';
  viewer_count: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  streamer?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useLiveStreaming = () => {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [streamHistory, setStreamHistory] = useState<LiveStream[]>([]);
  const [myStream, setMyStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateStreamKey = () => {
    return `stream_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const fetchLiveStreams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'live')
        .order('viewer_count', { ascending: false });

      if (error) throw error;

      // Fetch streamer profiles
      if (data && data.length > 0) {
        const streamerIds = [...new Set(data.map(s => s.streamer_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', streamerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const streamsWithProfiles = data.map(stream => ({
          ...stream,
          streamer: profileMap.get(stream.streamer_id)
        }));

        setLiveStreams(streamsWithProfiles as LiveStream[]);
      } else {
        setLiveStreams([]);
      }
    } catch (error) {
      console.error('Error fetching live streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'ended')
        .order('ended_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const streamerIds = [...new Set(data.map(s => s.streamer_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', streamerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const streamsWithProfiles = data.map(stream => ({
          ...stream,
          streamer: profileMap.get(stream.streamer_id)
        }));

        setStreamHistory(streamsWithProfiles as LiveStream[]);
      } else {
        setStreamHistory([]);
      }
    } catch (error) {
      console.error('Error fetching stream history:', error);
    }
  };

  const fetchMyStream = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('streamer_id', user.id)
        .eq('status', 'live')
        .maybeSingle();

      if (error) throw error;
      setMyStream(data as LiveStream | null);
    } catch (error) {
      console.error('Error fetching my stream:', error);
    }
  };

  const startStream = async (title: string, description?: string) => {
    if (!user) return null;

    try {
      const streamKey = generateStreamKey();
      
      const { data, error } = await supabase
        .from('live_streams')
        .insert({
          streamer_id: user.id,
          title,
          description,
          stream_key: streamKey,
          status: 'live',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create a timeline post announcing the stream
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', user.id)
        .single();

      const displayName = profile?.display_name || profile?.username || 'Someone';
      
      await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: `🔴 I'm now live streaming: "${title}"\n\nJoin me now! #live #streaming`,
        });

      // Notify all followers
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (followers && followers.length > 0) {
        const notifications = followers.map(f => ({
          user_id: f.follower_id,
          actor_id: user.id,
          type: 'live_stream',
          message: `${displayName} started a live stream: "${title}"`
        }));

        await supabase.from('notifications').insert(notifications);
      }

      toast({
        title: "You're live!",
        description: "Your stream has started and followers have been notified"
      });

      setMyStream(data as LiveStream);
      await fetchLiveStreams();
      return data;
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Error",
        description: "Failed to start stream",
        variant: "destructive"
      });
      return null;
    }
  };

  const endStream = async () => {
    if (!user || !myStream) return;

    try {
      const { error } = await supabase
        .from('live_streams')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', myStream.id)
        .eq('streamer_id', user.id);

      if (error) throw error;

      toast({ title: "Stream ended" });
      setMyStream(null);
      await fetchLiveStreams();
      await fetchStreamHistory();
    } catch (error) {
      console.error('Error ending stream:', error);
      toast({
        title: "Error",
        description: "Failed to end stream",
        variant: "destructive"
      });
    }
  };

  const updateViewerCount = async (streamId: string, increment: boolean) => {
    try {
      const { data: stream } = await supabase
        .from('live_streams')
        .select('viewer_count')
        .eq('id', streamId)
        .single();

      if (stream) {
        await supabase
          .from('live_streams')
          .update({
            viewer_count: Math.max(0, (stream.viewer_count || 0) + (increment ? 1 : -1))
          })
          .eq('id', streamId);
      }
    } catch (error) {
      console.error('Error updating viewer count:', error);
    }
  };

  useEffect(() => {
    fetchLiveStreams();
    fetchStreamHistory();
    fetchMyStream();

    // Set up real-time subscription
    const channel = supabase
      .channel('live-streams')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_streams'
      }, () => {
        fetchLiveStreams();
        fetchStreamHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    liveStreams,
    streamHistory,
    myStream,
    loading,
    startStream,
    endStream,
    updateViewerCount,
    refetch: fetchLiveStreams
  };
};
