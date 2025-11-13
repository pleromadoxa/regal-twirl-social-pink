
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessPage {
  id: string;
  page_name: string;
  description: string;
  page_type: string;
  owner_id: string;
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
  business_type?: 'e-commerce' | 'it-services' | 'import-export' | 'p2p-trading' | 'consulting' | 'manufacturing' | 'retail' | 'restaurant' | 'real-estate' | 'healthcare' | 'education' | 'finance' | 'other';
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
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const fetchPages = useCallback(async () => {
    if (!user) {
      setMyPages([]);
      setPages([]);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches and limit frequency
    const now = Date.now();
    if (fetchingRef.current || (now - lastFetchTimeRef.current < 30000)) {
      return;
    }

    fetchingRef.current = true;
    lastFetchTimeRef.current = now;

    try {
      console.log('Fetching business pages for user:', user.id);
      
      // Fetch user's own pages
      const { data: userPages, error: userError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('owner_id', user.id);

      if (userError) {
        console.error('Error fetching user business pages:', userError);
        setMyPages([]);
      } else {
        console.log('User pages fetched:', userPages?.length || 0);
        const formattedUserPages = (userPages || []).map(page => ({
          ...page,
          featured_products: Array.isArray(page.featured_products) ? page.featured_products : []
        }));
        setMyPages(formattedUserPages);
      }

      // Fetch all pages for directory  
      const { data: allPages, error: allError } = await supabase
        .from('business_pages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (allError) {
        console.error('Error fetching all business pages:', allError);
        setPages([]);
      } else {
        console.log('All pages fetched:', allPages?.length || 0);
        const formattedAllPages = (allPages || []).map(page => ({
          ...page,
          featured_products: Array.isArray(page.featured_products) ? page.featured_products : []
        }));
        setPages(formattedAllPages);
      }
    } catch (error) {
      console.error('Error:', error);
      setMyPages([]);
      setPages([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]);

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
      console.log('Creating business page:', pageData);
      
      // Prepare the insert data with proper typing
      const insertData: any = {
        page_name: pageData.page_name,
        description: pageData.description,
        page_type: pageData.page_type || 'business',
        owner_id: user.id,
        email: pageData.email,
        phone: pageData.phone,
        website: pageData.website,
        address: pageData.address,
        followers_count: 0
      };

      // Only add business_type if it's provided and valid
      if (pageData.business_type && typeof pageData.business_type === 'string') {
        // Validate business_type against allowed values
        const validBusinessTypes = [
          'e-commerce', 'it-services', 'import-export', 'p2p-trading', 
          'consulting', 'manufacturing', 'retail', 'restaurant', 
          'real-estate', 'healthcare', 'education', 'finance', 'other'
        ];
        
        if (validBusinessTypes.includes(pageData.business_type)) {
          insertData.business_type = pageData.business_type;
        } else {
          insertData.business_type = 'other';
        }
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
          description: "Failed to create business page",
          variant: "destructive"
        });
        return null;
      }

      console.log('Business page created successfully:', data);
      
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
      console.log('Searching pages with query:', query);
      
      const { data, error } = await supabase
        .from('business_pages')
        .select('*')
        .or(`page_name.ilike.%${query}%,description.ilike.%${query}%,page_type.ilike.%${query}%,business_type.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching business pages:', error);
        return [];
      }

      console.log('Search results:', data?.length || 0);
      
      return (data || []).map(page => ({
        ...page,
        featured_products: Array.isArray(page.featured_products) ? page.featured_products : []
      }));
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  const updatePage = async (pageId: string, updateData: Partial<BusinessPage>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update a business page",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('Updating business page:', pageId, updateData);
      
      // Prepare update data with proper typing
      const cleanUpdateData: any = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      // Validate business_type if provided
      if (updateData.business_type) {
        const validBusinessTypes = [
          'e-commerce', 'it-services', 'import-export', 'p2p-trading', 
          'consulting', 'manufacturing', 'retail', 'restaurant', 
          'real-estate', 'healthcare', 'education', 'finance', 'other'
        ];
        
        if (validBusinessTypes.includes(updateData.business_type)) {
          cleanUpdateData.business_type = updateData.business_type;
        } else {
          cleanUpdateData.business_type = 'other';
        }
      }

      const { error } = await supabase
        .from('business_pages')
        .update(cleanUpdateData)
        .eq('id', pageId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error updating business page:', error);
        toast({
          title: "Error",
          description: "Failed to update business page",
          variant: "destructive"
        });
        return false;
      }

      console.log('Business page updated successfully');
      
      toast({
        title: "Success",
        description: "Business page updated successfully",
      });

      fetchPages();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchPages();
  }, [fetchPages]);

  return {
    myPages,
    pages,
    loading,
    refetch,
    createPage,
    searchPages,
    updatePage
  };
};
