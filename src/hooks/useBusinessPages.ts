
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessPage {
  id: string;
  page_name: string;
  description: string;
  page_type: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  banner_url?: string;
  page_avatar_url?: string;
  page_banner_url?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  is_verified?: boolean;
  business_type?: string;
  followers_count?: number;
  default_currency?: string;
  shop_settings?: any;
  shop_active?: boolean;
  featured_products?: any[];
  shop_status?: string;
}

export const useBusinessPages = () => {
  const { user } = useAuth();
  const [myPages, setMyPages] = useState<BusinessPage[]>([]);
  const [pages, setPages] = useState<BusinessPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPages = async () => {
    if (!user) {
      setMyPages([]);
      setPages([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch user's own pages
      const { data: userPages, error: userError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('owner_id', user.id);

      if (userError) {
        console.error('Error fetching user business pages:', userError);
        setMyPages([]);
      } else {
        setMyPages(userPages || []);
      }

      // Fetch all pages for directory
      const { data: allPages, error: allError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (allError) {
        console.error('Error fetching all business pages:', allError);
        setPages([]);
      } else {
        setPages(allPages || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMyPages([]);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (pageData: Record<string, any>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a business page",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('business_pages')
        .insert([{
          ...pageData,
          owner_id: user.id,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating business page:', error);
        toast({
          title: "Error",
          description: "Failed to create business page",
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Business page created successfully",
      });

      fetchPages();
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    }
  };

  const searchPages = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('business_pages')
        .select('*')
        .or(`page_name.ilike.%${query}%,description.ilike.%${query}%,page_type.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching business pages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPages();
  }, [user]);

  const refetch = () => {
    setLoading(true);
    fetchPages();
  };

  return {
    myPages,
    pages,
    loading,
    refetch,
    createPage,
    searchPages
  };
};
