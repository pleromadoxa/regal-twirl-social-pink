
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
  business_hours?: string;
  social_media?: string;
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
      console.log('Fetching business pages for user:', user.id);
      
      // Fetch user's own pages
      const { data: userPages, error: userError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) {
        console.error('Error fetching user business pages:', userError);
        toast({
          title: "Error",
          description: "Failed to load your business pages",
          variant: "destructive"
        });
        setMyPages([]);
      } else {
        console.log('User pages fetched:', userPages?.length || 0);
        const formattedUserPages = (userPages || []).map(page => ({
          ...page,
          is_active: page.is_active ?? true,
          featured_products: Array.isArray(page.featured_products) ? page.featured_products : [],
          followers_count: page.followers_count || 0
        }));
        setMyPages(formattedUserPages);
      }

      // Fetch all pages for directory  
      const { data: allPages, error: allError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('is_active', true)
        .order('followers_count', { ascending: false })
        .limit(50);

      if (allError) {
        console.error('Error fetching all business pages:', allError);
        setPages([]);
      } else {
        console.log('All pages fetched:', allPages?.length || 0);
        const formattedAllPages = (allPages || []).map(page => ({
          ...page,
          is_active: page.is_active ?? true,
          featured_products: Array.isArray(page.featured_products) ? page.featured_products : [],
          followers_count: page.followers_count || 0
        }));
        setPages(formattedAllPages);
      }
    } catch (error) {
      console.error('Unexpected error in fetchPages:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading business pages",
        variant: "destructive"
      });
      setMyPages([]);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (pageData: Partial<BusinessPage>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a business page",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('Creating business page with data:', pageData);
      
      // Prepare the insert data
      const insertData = {
        page_name: pageData.page_name?.trim(),
        description: pageData.description?.trim() || '',
        page_type: pageData.page_type || 'business',
        owner_id: user.id,
        email: pageData.email?.trim() || '',
        phone: pageData.phone?.trim() || '',
        website: pageData.website?.trim() || '',
        address: pageData.address?.trim() || '',
        avatar_url: pageData.avatar_url || '',
        banner_url: pageData.banner_url || '',
        business_type: pageData.business_type || 'other',
        default_currency: pageData.default_currency || 'USD',
        shop_active: pageData.shop_active || false,
        is_active: true,
        followers_count: 0,
        business_hours: pageData.business_hours || '{}',
        social_media: pageData.social_media || '{}'
      };

      // Validate required fields
      if (!insertData.page_name) {
        toast({
          title: "Error",
          description: "Business name is required",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase
        .from('business_pages')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating business page:', error);
        toast({
          title: "Error",
          description: `Failed to create business page: ${error.message}`,
          variant: "destructive"
        });
        return null;
      }

      console.log('Business page created successfully:', data);
      toast({
        title: "Success",
        description: "Business page created successfully!",
      });

      // Refresh the pages list
      await fetchPages();
      return data;
    } catch (error) {
      console.error('Unexpected error creating business page:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the business page",
        variant: "destructive"
      });
      return null;
    }
  };

  const updatePage = async (pageId: string, updates: Partial<BusinessPage>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update a business page",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('Updating business page:', pageId, updates);
      
      // Prepare update data with proper type casting
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('business_pages')
        .update(updateData)
        .eq('id', pageId)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating business page:', error);
        toast({
          title: "Error",
          description: `Failed to update business page: ${error.message}`,
          variant: "destructive"
        });
        return null;
      }

      console.log('Business page updated successfully:', data);
      toast({
        title: "Success",
        description: "Business page updated successfully!",
      });

      // Refresh the pages list
      await fetchPages();
      return data;
    } catch (error) {
      console.error('Unexpected error updating business page:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the business page",
        variant: "destructive"
      });
      return null;
    }
  };

  const searchPages = async (query: string) => {
    try {
      console.log('Searching business pages with query:', query);
      
      const { data, error } = await supabase
        .from('business_pages')
        .select('*')
        .or(`page_name.ilike.%${query}%,description.ilike.%${query}%,business_type.ilike.%${query}%`)
        .eq('is_active', true)
        .order('followers_count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching business pages:', error);
        return [];
      }

      console.log('Search results:', data?.length || 0);
      return (data || []).map(page => ({
        ...page,
        is_active: page.is_active ?? true,
        featured_products: Array.isArray(page.featured_products) ? page.featured_products : [],
        followers_count: page.followers_count || 0
      }));
    } catch (error) {
      console.error('Unexpected error searching business pages:', error);
      return [];
    }
  };

  const deletePage = async (pageId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a business page",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('Deleting business page:', pageId);
      
      const { error } = await supabase
        .from('business_pages')
        .delete()
        .eq('id', pageId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error deleting business page:', error);
        toast({
          title: "Error",
          description: `Failed to delete business page: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      console.log('Business page deleted successfully');
      toast({
        title: "Success",
        description: "Business page deleted successfully!",
      });

      // Refresh the pages list
      await fetchPages();
      return true;
    } catch (error) {
      console.error('Unexpected error deleting business page:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the business page",
        variant: "destructive"
      });
      return false;
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
    updatePage,
    searchPages,
    deletePage
  };
};
