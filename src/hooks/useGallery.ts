
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GalleryItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  span_config: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useGallery = (userId?: string) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      // If userId is provided, filter by that user, otherwise get current user's items
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching gallery items:', error);
        toast({
          title: "Error loading gallery",
          description: "Failed to load gallery items",
          variant: "destructive"
        });
        return;
      }

      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error in fetchGalleryItems:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadGalleryItem = async (
    file: File,
    title: string,
    description?: string,
    spanConfig?: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload gallery items",
          variant: "destructive"
        });
        return false;
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive"
        });
        return false;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(uploadData.path);

      // Save to database
      const { error: dbError } = await supabase
        .from('gallery_items')
        .insert({
          user_id: user.id,
          title,
          description,
          file_url: publicUrl,
          file_type: file.type.startsWith('image/') ? 'image' : 'video',
          file_size: file.size,
          span_config: spanConfig || 'md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast({
          title: "Save failed",
          description: dbError.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Upload successful",
        description: "Gallery item uploaded successfully"
      });

      // Refresh gallery items
      fetchGalleryItems();
      return true;
    } catch (error) {
      console.error('Error uploading gallery item:', error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteGalleryItem = async (itemId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get the item to delete the file from storage
      const { data: item } = await supabase
        .from('gallery_items')
        .select('file_url, user_id')
        .eq('id', itemId)
        .single();

      if (!item || item.user_id !== user.id) {
        toast({
          title: "Permission denied",
          description: "You can only delete your own gallery items",
          variant: "destructive"
        });
        return false;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (dbError) {
        console.error('Database delete error:', dbError);
        toast({
          title: "Delete failed",
          description: dbError.message,
          variant: "destructive"
        });
        return false;
      }

      // Delete file from storage
      const fileName = item.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('gallery')
          .remove([`${user.id}/${fileName}`]);
      }

      toast({
        title: "Item deleted",
        description: "Gallery item deleted successfully"
      });

      // Refresh gallery items
      fetchGalleryItems();
      return true;
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, [userId]);

  return {
    galleryItems,
    loading,
    uploadGalleryItem,
    deleteGalleryItem,
    refetch: fetchGalleryItems
  };
};
