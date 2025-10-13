import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Circle {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  member_count: number;
  is_private: boolean;
  category: string;
  settings?: any;
  cover_image_url?: string;
  avatar_url?: string;
  allow_posts?: boolean;
  allow_calls?: boolean;
  require_approval?: boolean;
  visibility?: string;
  created_at: string;
  updated_at: string;
}

export interface CircleMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  added_at: string;
  invited_by?: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useCircles = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCircles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_circles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCircles(data || []);
    } catch (error) {
      console.error('Error fetching circles:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCircles();
    }
  }, [user]);

  const createCircle = async (name: string, description?: string, color?: string, icon?: string) => {
    if (!user) {
      toast({ 
        title: "Authentication required", 
        description: "Please log in to create circles",
        variant: "destructive" 
      });
      return null;
    }

    try {
      setLoading(true);
      console.log('[useCircles] Creating circle with:', { 
        user_id: user.id, 
        name, 
        description, 
        color: color || '#6366f1', 
        icon: icon || 'users' 
      });

      const { data, error } = await supabase
        .from('user_circles')
        .insert({
          user_id: user.id,
          name,
          description,
          color: color || '#6366f1',
          icon: icon || 'users'
        })
        .select()
        .single();

      if (error) {
        console.error('[useCircles] Error creating circle:', error);
        throw error;
      }

      console.log('[useCircles] Circle created successfully:', data);
      toast({ title: "Circle created successfully" });
      await fetchCircles();
      return data;
    } catch (error: any) {
      console.error('[useCircles] Failed to create circle:', error);
      toast({ 
        title: "Failed to create circle", 
        description: error.message || "An unknown error occurred",
        variant: "destructive" 
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCircle = async (circleId: string, updates: Partial<Circle>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_circles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', circleId);

      if (error) throw error;

      toast({ title: "Circle updated successfully" });
      await fetchCircles();
      return true;
    } catch (error: any) {
      console.error('Error updating circle:', error);
      toast({ title: "Failed to update circle", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCircle = async (circleId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_circles')
        .delete()
        .eq('id', circleId);

      if (error) throw error;

      toast({ title: "Circle deleted successfully" });
      await fetchCircles();
      return true;
    } catch (error: any) {
      console.error('Error deleting circle:', error);
      toast({ title: "Failed to delete circle", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addMemberToCircle = async (circleId: string, userId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('circle_members')
        .insert({ circle_id: circleId, user_id: userId });

      if (error) throw error;

      toast({ title: "Member added to circle" });
      await fetchCircles();
      return true;
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast({ title: "Failed to add member", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeMemberFromCircle = async (memberId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({ title: "Member removed from circle" });
      await fetchCircles();
      return true;
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({ title: "Failed to remove member", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCircleMembers = async (circleId: string): Promise<CircleMember[]> => {
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          *,
          profiles!user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('circle_id', circleId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching circle members:', error);
      return [];
    }
  };

  return {
    circles,
    loading,
    createCircle,
    updateCircle,
    deleteCircle,
    addMemberToCircle,
    removeMemberFromCircle,
    getCircleMembers,
    refetch: fetchCircles
  };
};