import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MoodBoard {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  is_collaborative: boolean;
  background_color: string;
  created_at: string;
  updated_at: string;
}

export const useMoodBoard = () => {
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBoards = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('mood_boards').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      setBoards(data || []);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (board: Omit<MoodBoard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('mood_boards').insert({ ...board, user_id: user.id }).select().single();
      if (error) throw error;
      toast({ title: "Board created!" });
      await fetchBoards();
      return data;
    } catch (error: any) {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const deleteBoard = async (boardId: string) => {
    try {
      const { error } = await supabase.from('mood_boards').delete().eq('id', boardId);
      if (error) throw error;
      toast({ title: "Deleted" });
      await fetchBoards();
    } catch (error: any) {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  useEffect(() => { fetchBoards(); }, [user]);

  return { boards, loading, createBoard, deleteBoard, refetch: fetchBoards };
};
