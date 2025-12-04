import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null;
  images: string[];
  location: string | null;
  status: 'active' | 'sold' | 'pending' | 'inactive';
  views_count: number;
  created_at: string;
  seller?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useMarketplace = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [myListings, setMyListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchListings = async (category?: string, searchTerm?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch seller profiles
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map(l => l.seller_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', sellerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const listingsWithSellers = data.map(listing => ({
          ...listing,
          seller: profileMap.get(listing.seller_id)
        }));

        setListings(listingsWithSellers as MarketplaceListing[]);
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyListings((data as MarketplaceListing[]) || []);
    } catch (error) {
      console.error('Error fetching my listings:', error);
    }
  };

  const createListing = async (listing: Partial<MarketplaceListing>) => {
    if (!user) return null;

    try {
      const insertData = {
        seller_id: user.id,
        title: listing.title || '',
        price: listing.price || 0,
        currency: listing.currency || 'USD',
        description: listing.description,
        category: listing.category,
        condition: listing.condition,
        images: listing.images || [],
        location: listing.location,
        status: 'active' as const
      };

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Listing created",
        description: "Your item is now available in the marketplace"
      });

      await fetchMyListings();
      return data;
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateListing = async (listingId: string, updates: Partial<MarketplaceListing>) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update(updates)
        .eq('id', listingId)
        .eq('seller_id', user?.id);

      if (error) throw error;

      toast({ title: "Listing updated" });
      await fetchMyListings();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive"
      });
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user?.id);

      if (error) throw error;

      toast({ title: "Listing deleted" });
      await fetchMyListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive"
      });
    }
  };

  const markAsSold = async (listingId: string) => {
    await updateListing(listingId, { status: 'sold' });
  };

  useEffect(() => {
    fetchListings();
    fetchMyListings();
  }, [user]);

  return {
    listings,
    myListings,
    loading,
    fetchListings,
    fetchMyListings,
    createListing,
    updateListing,
    deleteListing,
    markAsSold
  };
};
