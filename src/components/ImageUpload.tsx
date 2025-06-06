
import { useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (url: string) => void;
  bucketName?: string;
  folder: 'avatars' | 'banners';
  className?: string;
  isAvatar?: boolean;
}

const ImageUpload = ({ 
  currentImageUrl, 
  onImageUpload, 
  bucketName = 'profile-images', 
  folder, 
  className = "",
  isAvatar = false 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to upload images.",
          variant: "destructive"
        });
        return;
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (50MB limit)
      if (file.size > 52428800) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 50MB.",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${folder}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
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
        .from(bucketName)
        .getPublicUrl(filePath);

      onImageUpload(data.publicUrl);
      
      toast({
        title: "Image uploaded successfully",
        description: `Your ${isAvatar ? 'avatar' : 'banner'} has been updated.`
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const removeImage = async () => {
    try {
      // If there's a current image and it's from our storage, delete it
      if (currentImageUrl && currentImageUrl.includes('supabase')) {
        const urlParts = currentImageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${user?.id}/${folder}/${fileName}`;
        
        await supabase.storage
          .from(bucketName)
          .remove([filePath]);
      }

      onImageUpload('');
      toast({
        title: `${isAvatar ? 'Avatar' : 'Banner'} removed`,
        description: "Your image has been removed."
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error removing image",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {currentImageUrl ? (
        <div className="relative group">
          <img
            src={currentImageUrl}
            alt={isAvatar ? "Avatar" : "Banner"}
            className={`object-cover transition-all duration-300 ${
              isAvatar 
                ? "w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl" 
                : "w-full h-64 rounded-xl shadow-lg"
            }`}
          />
          <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center ${
            isAvatar ? 'rounded-full' : 'rounded-xl'
          }`}>
            <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-300">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`file-input-${folder}`)?.click()}
                disabled={uploading}
                className="text-white border-white hover:bg-white hover:text-black transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeImage}
                disabled={uploading}
                className="text-white border-white hover:bg-white hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 cursor-pointer flex items-center justify-center group ${
            isAvatar 
              ? "w-32 h-32 rounded-full" 
              : "w-full h-64 rounded-xl"
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onClick={() => !uploading && document.getElementById(`file-input-${folder}`)?.click()}
        >
          <div className="text-center p-4">
            {uploading ? (
              <Loader2 className="w-8 h-8 mx-auto text-purple-400 mb-2 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 mx-auto text-slate-400 group-hover:text-purple-500 transition-colors mb-2" />
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {uploading ? 'Uploading...' : `Upload ${isAvatar ? 'Avatar' : 'Banner'}`}
            </p>
            {!uploading && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                PNG, JPG, WebP up to 50MB
              </p>
            )}
          </div>
        </div>
      )}
      
      <Input
        id={`file-input-${folder}`}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
