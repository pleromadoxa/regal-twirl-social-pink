
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image, Video, X } from 'lucide-react';
import { useStories } from '@/hooks/useStories';

interface StoryUploadProps {
  onClose: () => void;
}

export const StoryUpload = ({ onClose }: StoryUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createStory } = useStories();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await createStory(file, caption);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto text-purple-500 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Upload image or video
              </p>
              <p className="text-sm text-slate-500">
                Max 50MB • JPG, PNG, MP4, MOV
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                {file.type.startsWith('image/') ? (
                  <img 
                    src={preview!} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video 
                    src={preview!} 
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFile}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Caption */}
          <Textarea
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="resize-none"
            rows={3}
          />

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {uploading ? 'Uploading...' : 'Share Story'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
