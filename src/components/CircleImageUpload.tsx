import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CircleImageUploadProps {
  circleId: string;
  currentImageUrl?: string;
  circleName: string;
  onImageUpdated: (url: string) => void;
}

const CircleImageUpload = ({ circleId, currentImageUrl, circleName, onImageUpdated }: CircleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${circleId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('circle-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('circle-images')
        .getPublicUrl(fileName);

      // Update circle with new avatar URL
      const { error: updateError } = await supabase
        .from('user_circles')
        .update({ avatar_url: publicUrl })
        .eq('id', circleId);

      if (updateError) throw updateError;

      onImageUpdated(publicUrl);

      toast({
        title: 'Success',
        description: 'Circle image updated successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload circle image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 ring-4 ring-primary/20">
          <AvatarImage src={currentImageUrl} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/10">
            {circleName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Uploading...' : 'Upload Image'}
      </Button>
    </div>
  );
};

export default CircleImageUpload;