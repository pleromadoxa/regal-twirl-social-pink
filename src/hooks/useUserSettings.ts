
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
  post_visibility?: string | null;
  who_can_comment?: string | null;
  who_can_message?: string | null;
  who_can_tag?: string | null;
  show_followers_list?: boolean | null;
  show_following_list?: boolean | null;
  two_factor_enabled?: boolean | null;
  read_receipts_enabled?: boolean | null;
  story_replies_enabled?: boolean | null;
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user_settings from supabase
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log('Fetching user settings for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user settings:', error);
        toast({
          title: "Error loading settings",
          description: error.message,
          variant: "destructive",
        });
        setSettings(null);
      } else if (data) {
        console.log('User settings loaded:', data);
        setSettings(data);
      } else {
        // No settings found, create default settings
        console.log('No settings found, creating default settings');
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Unexpected error fetching settings:', error);
      toast({
        title: "Error loading settings",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Create default settings for new users
  const createDefaultSettings = async () => {
    if (!user) return;

    console.log('Creating default settings for user:', user.id);
    
    const defaultSettings = {
      user_id: user.id,
      email_notifications: true,
      push_notifications: true,
      private_account: false,
      show_online_status: true,
      follows_notifications: true,
      likes_notifications: true,
      mentions_notifications: true,
      messages_notifications: true,
      allow_messages: true,
      discoverable: true,
    };

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) {
        console.error('Error creating default settings:', error);
        toast({
          title: "Error creating settings",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Default settings created:', data);
        setSettings(data);
        toast({
          title: "Settings initialized",
          description: "Your notification preferences have been set to default values.",
        });
      }
    } catch (error) {
      console.error('Unexpected error creating settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update any field and sync to supabase
  const updateSetting = async (key: keyof UserSettings, value: boolean | string) => {
    if (!user || !settings) {
      toast({
        title: "Error",
        description: "User not authenticated or settings not loaded",
        variant: "destructive",
      });
      return;
    }

    console.log(`Updating setting ${key} to ${value} for user:`, user.id);

    // Optimistic update
    const previousSettings = settings;
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating setting:', error);
        // Revert optimistic update
        setSettings(previousSettings);
        toast({
          title: "Failed to update setting",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log(`Setting ${key} updated successfully`);
      toast({
        title: "Setting updated",
        description: "Your notification preference was updated successfully.",
      });
    } catch (error) {
      console.error('Unexpected error updating setting:', error);
      // Revert optimistic update
      setSettings(previousSettings);
      toast({
        title: "Failed to update setting",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings,
  };
};
