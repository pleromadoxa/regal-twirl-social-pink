
import { useState, useRef } from 'react';
import { Upload, X, Video, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createReel } from '@/services/reelsService';

interface ReelUploadProps {
  onUploadComplete: () => void;
  onCancel: () => void;
}

const ReelUpload = ({ onUploadComplete, onCancel }: ReelUploadProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: "File too large",
          description: "Video must be smaller than 100MB",
          variant: "destructive"
        });
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      toast({
        title: "Video required",
        description: "Please select a video to upload",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title for your reel",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      const reel = await createReel(
        title.trim(),
        description.trim(),
        videoFile,
        thumbnailFile || undefined
      );

      if (reel) {
        toast({
          title: "Success",
          description: "Your reel has been uploaded successfully!"
        });
        onUploadComplete();
      } else {
        throw new Error('Failed to create reel');
      }
    } catch (error) {
      console.error('Error uploading reel:', error);
      toast({
        title: "Upload failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const clearVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview('');
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview('');
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Upload New Reel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Upload */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Video *</label>
          {!videoFile ? (
            <div 
              className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => videoInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-purple-400 mb-4" />
              <p className="text-purple-600 font-medium mb-2">Click to upload video</p>
              <p className="text-sm text-gray-500">MP4, WebM, MOV up to 100MB</p>
            </div>
          ) : (
            <div className="relative">
              <video
                src={videoPreview}
                className="w-full max-h-80 rounded-lg object-cover"
                controls
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearVideo}
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Custom Thumbnail (Optional)</label>
          {!thumbnailFile ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => thumbnailInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">Add custom thumbnail</p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full max-h-48 rounded-lg object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearThumbnail}
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailSelect}
            className="hidden"
          />
        </div>

        {/* Title and Description */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your reel a catchy title..."
              maxLength={100}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about your reel..."
              maxLength={500}
              className="mt-1 resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!videoFile || !title.trim() || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Reel'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReelUpload;
