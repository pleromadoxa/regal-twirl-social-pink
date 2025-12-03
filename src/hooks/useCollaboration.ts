import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Collaborator {
  id: string;
  user_id: string;
  role: 'creator' | 'collaborator' | 'contributor';
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  responded_at?: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface CollaborationInvite {
  id: string;
  post_id: string;
  inviter_id: string;
  invitee_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  expires_at: string;
  created_at: string;
  inviter_profile: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface CollaborativeDraft {
  id: string;
  title: string;
  content: string;
  creator_id: string;
  collaborators: string[];
  draft_data: any;
  status: 'draft' | 'review' | 'ready' | 'published';
  published_post_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCollaboration = () => {
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<CollaborationInvite[]>([]);
  const [drafts, setDrafts] = useState<CollaborativeDraft[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch received collaboration invites
  const fetchInvites = async () => {
    if (!user) return;

    try {
      // First fetch the invites
      const { data: invitesData, error: invitesError } = await supabase
        .from('collaboration_invites')
        .select('*')
        .eq('invitee_id', user.id)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;
      
      if (!invitesData || invitesData.length === 0) {
        setInvites([]);
        return;
      }

      // Then fetch profiles for all inviters
      const inviterIds = invitesData.map(invite => invite.inviter_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', inviterIds);

      if (profilesError) throw profilesError;

      // Map profiles to invites
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      setInvites(invitesData.map((item: any) => ({
        ...item,
        status: item.status as 'pending' | 'accepted' | 'declined' | 'cancelled',
        inviter_profile: profilesMap.get(item.inviter_id) || {
          username: '',
          display_name: '',
          avatar_url: ''
        }
      })));
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  // Fetch collaborative drafts
  const fetchDrafts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('collaborative_drafts')
        .select('*')
        .or(`creator_id.eq.${user.id},collaborators.cs.["${user.id}"]`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts((data || []).map((item: any) => ({
        ...item,
        collaborators: Array.isArray(item.collaborators) ? item.collaborators : [],
        status: item.status as 'draft' | 'review' | 'ready' | 'published'
      })));
    } catch (error) {
      console.error('Error fetching drafts:', error);
    }
  };

  // Invite user to collaborate on a post
  const inviteCollaborator = async (postId: string, userId: string, message?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send invitations",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      
      // Check if invite already exists
      const { data: existingInvite } = await supabase
        .from('collaboration_invites')
        .select('id')
        .eq('post_id', postId)
        .eq('inviter_id', user.id)
        .eq('invitee_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvite) {
        toast({
          title: "Invitation already sent",
          description: "This user already has a pending invitation for this post",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('collaboration_invites')
        .insert({
          post_id: postId,
          inviter_id: user.id,
          invitee_id: userId,
          message: message || null
        });

      if (error) {
        console.error('Database error inviting collaborator:', error);
        throw error;
      }

      toast({
        title: "Invitation sent",
        description: "The user has been invited to collaborate on this post"
      });
      return true;
    } catch (error: any) {
      console.error('Error inviting collaborator:', error);
      toast({
        title: "Failed to send invitation",
        description: error?.message || "Please try again later",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Respond to collaboration invite
  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('collaboration_invites')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .eq('invitee_id', user.id);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? "Invite accepted" : "Invite declined",
        description: status === 'accepted' 
          ? "You are now a collaborator on this post"
          : "You have declined the collaboration invite"
      });

      await fetchInvites(); // Refresh invites list
      return true;
    } catch (error) {
      console.error('Error responding to invite:', error);
      toast({
        title: "Error",
        description: "Failed to respond to invite. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get collaborators for a post
  const getPostCollaborators = async (postId: string): Promise<Collaborator[]> => {
    try {
      const { data, error } = await supabase
        .from('post_collaborators')
        .select(`
          *,
          profiles!user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .eq('status', 'accepted');

      if (error) throw error;
      return (data || []).map((item: any) => ({
        ...item,
        role: item.role as 'creator' | 'collaborator' | 'contributor',
        status: item.status as 'pending' | 'accepted' | 'declined',
        profiles: item.profiles || {
          username: '',
          display_name: '',
          avatar_url: ''
        }
      }));
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      return [];
    }
  };

  // Create collaborative draft
  const createDraft = async (title: string, content: string = '') => {
    if (!user) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collaborative_drafts')
        .insert({
          title,
          content,
          creator_id: user.id,
          collaborators: []
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Draft created",
        description: "Your collaborative draft has been created"
      });

      await fetchDrafts(); // Refresh drafts list
      return data;
    } catch (error) {
      console.error('Error creating draft:', error);
      toast({
        title: "Error",
        description: "Failed to create draft. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update draft
  const updateDraft = async (draftId: string, updates: Partial<CollaborativeDraft>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('collaborative_drafts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId);

      if (error) throw error;
      await fetchDrafts(); // Refresh drafts list
      return true;
    } catch (error) {
      console.error('Error updating draft:', error);
      return false;
    }
  };

  // Add collaborator to draft
  const addDraftCollaborator = async (draftId: string, userId: string) => {
    if (!user) return false;

    try {
      // Get current draft
      const { data: draft, error: fetchError } = await supabase
        .from('collaborative_drafts')
        .select('collaborators')
        .eq('id', draftId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!draft) throw new Error('Draft not found');

      const currentCollaborators = Array.isArray(draft.collaborators) ? draft.collaborators : [];
      if (currentCollaborators.includes(userId)) return true; // Already added

      const updatedCollaborators = [...currentCollaborators, userId];

      const { error } = await supabase
        .from('collaborative_drafts')
        .update({
          collaborators: updatedCollaborators,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId);

      if (error) throw error;
      await fetchDrafts(); // Refresh drafts list
      return true;
    } catch (error) {
      console.error('Error adding draft collaborator:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvites();
      fetchDrafts();
    }
  }, [user]);

  return {
    invites,
    drafts,
    loading,
    inviteCollaborator,
    respondToInvite,
    getPostCollaborators,
    createDraft,
    updateDraft,
    addDraftCollaborator,
    refetchInvites: fetchInvites,
    refetchDrafts: fetchDrafts
  };
};