
import { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (url: string) => void;
  bucketName: string;
  folder: string;
  className?: string;
  isAvatar?: boolean;
}

const ImageUpload = ({ 
  currentImageUrl, 
  onImageUpload, 
  bucketName, 
  folder, 
  className = "",
  isAvatar = false 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

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
    }
  };

  const removeImage = () => {
    onImageUpload('');
    toast({
      title: `${isAvatar ? 'Avatar' : 'Banner'} removed`,
      description: "Your image has been removed."
    });
  };

  return (
    <div className={`relative ${className}`}>
      {currentImageUrl ? (
        <div className="relative group">
          <img
            src={currentImageUrl}
            alt={isAvatar ? "Avatar" : "Banner"}
            className={`object-cover ${
              isAvatar 
                ? "w-32 h-32 rounded-full" 
                : "w-full h-48 rounded-lg"
            }`}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center rounded-lg">
            <div className="opacity-0 group-hover:opacity-100 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`file-input-${folder}`)?.click()}
                disabled={uploading}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <Camera className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeImage}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 transition-colors cursor-pointer flex items-center justify-center ${
            isAvatar 
              ? "w-32 h-32 rounded-full" 
              : "w-full h-48 rounded-lg"
          }`}
          onClick={() => document.getElementById(`file-input-${folder}`)?.click()}
        >
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {uploading ? 'Uploading...' : `Upload ${isAvatar ? 'Avatar' : 'Banner'}`}
            </p>
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
