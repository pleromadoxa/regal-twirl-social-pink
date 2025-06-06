
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GalleryItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  span_config: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaItemType {
  id: number;
  type: string;
  title: string;
  desc: string;
  url: string;
  span: string;
}

export const useGallery = (userId?: string) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('user_id', targetUserId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching gallery items:', error);
        return;
      }

      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error in fetchGalleryItems:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadGalleryItem = async (file: File, title: string, description: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload gallery items",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      // Determine file type
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      
      // Generate random span configuration
      const spanConfigs = [
        'md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2',
        'md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2',
        'md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-3',
      ];
      const randomSpan = spanConfigs[Math.floor(Math.random() * spanConfigs.length)];

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('gallery_items')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            file_url: data.publicUrl,
            file_type: fileType,
            file_size: file.size,
            span_config: randomSpan,
            display_order: galleryItems.length
          }
        ]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      toast({
        title: "Upload successful",
        description: "Your gallery item has been uploaded successfully."
      });

      // Refresh gallery items
      fetchGalleryItems();
    } catch (error) {
      console.error('Error uploading gallery item:', error);
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const deleteGalleryItem = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting gallery item:', error);
        throw error;
      }

      toast({
        title: "Item deleted",
        description: "Gallery item has been deleted successfully."
      });

      // Refresh gallery items
      fetchGalleryItems();
    } catch (error) {
      console.error('Error in deleteGalleryItem:', error);
      toast({
        title: "Delete failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const transformToMediaItems = (items: GalleryItem[]): MediaItemType[] => {
    return items.map((item, index) => ({
      id: index + 1,
      type: item.file_type,
      title: item.title,
      desc: item.description || '',
      url: item.file_url,
      span: item.span_config
    }));
  };

  useEffect(() => {
    fetchGalleryItems();
  }, [user, userId]);

  return {
    galleryItems,
    loading,
    uploadGalleryItem,
    deleteGalleryItem,
    transformToMediaItems,
    refetch: fetchGalleryItems
  };
};
