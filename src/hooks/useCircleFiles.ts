import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CircleFile {
  id: string;
  circle_id: string;
  uploader_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

export const useCircleFiles = (circleId: string | null) => {
  const [files, setFiles] = useState<CircleFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFiles = async () => {
    if (!circleId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('circle_files')
        .select('*')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [circleId]);

  const uploadFile = async (file: File) => {
    if (!circleId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${circleId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('circle-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('circle-files')
        .getPublicUrl(filePath);

      // Save file metadata
      const { data, error } = await supabase
        .from('circle_files')
        .insert([{
          circle_id: circleId,
          uploader_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size
        }])
        .select()
        .single();

      if (error) throw error;

      toast({ title: "File uploaded successfully" });
      await fetchFiles();
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to upload file",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteFile = async (fileId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const filePath = fileUrl.split('/').slice(-2).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('circle-files')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from('circle_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast({ title: "File deleted successfully" });
      await fetchFiles();
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to delete file",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    files,
    loading,
    uploadFile,
    deleteFile,
    refetch: fetchFiles
  };
};
