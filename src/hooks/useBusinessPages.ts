
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BusinessPage {
  id: string;
  owner_id: string;
  page_name: string;
  page_type: 'business' | 'professional' | 'organization';
  business_type?: string;
  default_currency?: string;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  is_verified: boolean;
  followers_count: number;
  created_at: string;
  updated_at: string;
  user_following?: boolean;
}

type BusinessType = 'e-commerce' | 'it-services' | 'import-export' | 'p2p-trading' | 'consulting' | 'manufacturing' | 'retail' | 'restaurant' | 'real-estate' | 'healthcare' | 'education' | 'finance' | 'other';

export const useBusinessPages = () => {
  const [pages, setPages] = useState<BusinessPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [myPages, setMyPages] = useState<BusinessPage[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data: pagesData, error } = await supabase
        .from('business_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching business pages:', error);
        return;
      }

      if (user) {
        // Check which pages the user follows
        const pageIds = pagesData?.map(page => page.id) || [];
        const { data: followsData } = await supabase
          .from('business_page_follows')
          .select('page_id')
          .eq('user_id', user.id)
          .in('page_id', pageIds);

        const followedPageIds = new Set(followsData?.map(f => f.page_id) || []);

        const enrichedPages = pagesData?.map(page => ({
          ...page,
          page_type: page.page_type as 'business' | 'professional' | 'organization',
          user_following: followedPageIds.has(page.id),
          followers_count: page.followers_count || 0,
          is_verified: page.is_verified || false
        })) || [];

        setPages(enrichedPages);
        
        // Set user's own pages
        const userPages = enrichedPages.filter(page => page.owner_id === user.id);
        setMyPages(userPages);
      } else {
        const mappedPages = pagesData?.map(page => ({
          ...page,
          page_type: page.page_type as 'business' | 'professional' | 'organization',
          followers_count: page.followers_count || 0,
          is_verified: page.is_verified || false
        })) || [];
        
        setPages(mappedPages);
      }
    } catch (error) {
      console.error('Error in fetchPages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (pageData: {
    page_name: string;
    page_type: 'business' | 'professional' | 'organization';
    business_type?: string;
    default_currency?: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a page",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('business_pages')
        .insert({
          owner_id: user.id,
          page_name: pageData.page_name,
          page_type: pageData.page_type,
          business_type: pageData.business_type as BusinessType,
          default_currency: pageData.default_currency,
          description: pageData.description,
          website: pageData.website,
          email: pageData.email,
          phone: pageData.phone,
          address: pageData.address,
        });

      if (error) {
        console.error('Error creating page:', error);
        toast({
          title: "Error creating page",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Page created!",
        description: "Your business page has been created successfully."
      });

      fetchPages();
    } catch (error) {
      console.error('Error in createPage:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const toggleFollow = async (pageId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow pages",
        variant: "destructive"
      });
      return;
    }

    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    try {
      if (page.user_following) {
        await supabase
          .from('business_page_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('page_id', pageId);
      } else {
        await supabase
          .from('business_page_follows')
          .insert([{ user_id: user.id, page_id: pageId }]);
      }

      setPages(pages.map(p => 
        p.id === pageId 
          ? { 
              ...p, 
              user_following: !p.user_following,
              followers_count: p.user_following ? p.followers_count - 1 : p.followers_count + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const searchPages = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('business_pages')
        .select('*')
        .or(`page_name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('followers_count', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error searching pages:', error);
        return [];
      }

      return data?.map(page => ({
        ...page,
        page_type: page.page_type as 'business' | 'professional' | 'organization',
        followers_count: page.followers_count || 0,
        is_verified: page.is_verified || false
      })) || [];
    } catch (error) {
      console.error('Error in searchPages:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPages();
  }, [user]);

  return {
    pages,
    myPages,
    loading,
    createPage,
    toggleFollow,
    searchPages,
    refetch: fetchPages
  };
};
