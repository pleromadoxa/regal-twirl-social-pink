
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const LogoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadLogo = async (file: File, filename: string) => {
    try {
      setUploading(true);

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `${filename} uploaded successfully!`
      });

      return data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${filename}`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, logoType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const filename = logoType === 'light' ? 'regal-network-light.png' : 'regal-network-dark.png';
    await uploadLogo(file, filename);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Logo Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Light Logo (for dark backgrounds)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'light')}
            disabled={uploading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Dark Logo (for light backgrounds)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'dark')}
            disabled={uploading}
          />
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <p className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Upload your logos to replace the broken image links
          </p>
          <p>• Light logo should be white/light colored for dark backgrounds</p>
          <p>• Dark logo should be dark colored for light backgrounds</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
