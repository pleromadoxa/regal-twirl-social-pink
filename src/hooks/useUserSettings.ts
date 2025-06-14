
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type UserSettings = {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  private_account: boolean;
  show_online_status: boolean;
  follows_notifications?: boolean | null;
  likes_notifications?: boolean | null;
  mentions_notifications?: boolean | null;
  messages_notifications?: boolean | null;
  allow_messages?: boolean | null;
  discoverable?: boolean | null;
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user_settings from supabase
  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
      setSettings(null);
    } else {
      setSettings(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchSettings();
    // Optionally: add Supabase realtime listener for live updates
    // Clean up on unload
    // ...
  }, [fetchSettings]);

  // Update any field and sync to supabase
  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    if (!user || !settings) return;
    const { error } = await supabase
      .from('user_settings')
      .update({ [key]: value })
      .eq('user_id', user.id);
    if (error) {
      toast({
        title: "Failed to update setting",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
    toast({
      title: "Settings updated",
      description: "Your setting was updated successfully.",
    });
  };

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings,
  };
};
