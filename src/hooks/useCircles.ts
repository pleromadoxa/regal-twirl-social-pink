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
  can_add_members?: boolean;
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
      // Fetch circles where the user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const circleIds = memberData?.map(m => m.circle_id) || [];

      if (circleIds.length === 0) {
        setCircles([]);
        return;
      }

      // Fetch the actual circle data
      const { data, error } = await supabase
        .from('user_circles')
        .select('*')
        .in('id', circleIds)
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

  const updateMemberPermissions = async (memberId: string, canAddMembers: boolean) => {
    try {
      const { error } = await supabase
        .from('circle_members')
        .update({ can_add_members: canAddMembers })
        .eq('id', memberId);

      if (error) throw error;

      toast({ 
        title: "Permissions updated", 
        description: canAddMembers ? "Member can now add others" : "Member can no longer add others"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating member permissions:', error);
      toast({ 
        title: "Failed to update permissions", 
        description: error.message, 
        variant: "destructive" 
      });
      return false;
    }
  };

  const checkCanAddMembers = async (circleId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select('role, can_add_members')
        .eq('circle_id', circleId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      return data.role === 'admin' || data.can_add_members === true;
    } catch (error) {
      console.error('Error checking add member permission:', error);
      return false;
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
    updateMemberPermissions,
    checkCanAddMembers,
    refetch: fetchCircles
  };
};