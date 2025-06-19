
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all settings that are public or if the user is an admin
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('is_public', true);

      if (error) {
        throw new Error(error.message);
      }

      const settingsMap: Record<string, any> = {};
      
      if (data) {
        data.forEach((setting: SystemSetting) => {
          let value = setting.setting_value;
          
          // Convert value based on type
          if (setting.setting_type === 'number') {
            value = Number(value);
          } else if (setting.setting_type === 'boolean') {
            if (typeof value === 'string') {
              value = value.toLowerCase() === 'true';
            }
          } else if (setting.setting_type === 'object' || setting.setting_type === 'array') {
            if (typeof value === 'string') {
              try {
                value = JSON.parse(value);
              } catch (e) {
                console.error(`Error parsing JSON for setting ${setting.setting_key}:`, e);
              }
            }
          }
          
          settingsMap[setting.setting_key] = value;
        });
      }
      
      setSettings(settingsMap);
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getSetting = (key: string, defaultValue?: any) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  return { settings, getSetting, loading, error, refetch: fetchSettings };
};
