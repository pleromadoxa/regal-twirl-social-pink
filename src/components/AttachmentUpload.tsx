
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Image, Video, FileText, MapPin, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttachmentUploadProps {
  onAttachmentsChange: (attachments: File[]) => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  attachments: File[];
}

const AttachmentUpload = ({ onAttachmentsChange, onLocationSelect, attachments }: AttachmentUploadProps) => {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null, type: 'image' | 'video' | 'document') => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (type === 'image') return file.type.startsWith('image/');
      if (type === 'video') return file.type.startsWith('video/');
      if (type === 'document') return file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text');
      return true;
    });

    if (validFiles.length !== fileArray.length) {
      toast({
        title: "Invalid files",
        description: `Some files were filtered out. Only ${type} files are allowed.`,
        variant: "destructive"
      });
    }

    onAttachmentsChange([...attachments, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(newAttachments);
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationSelect({
            lat: latitude,
            lng: longitude,
            address: locationAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
          setShowLocationPicker(false);
          setLocationAddress('');
          toast({
            title: "Location shared",
            description: "Your location has been added to the message"
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location error",
            description: "Could not get your current location",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-3">
      {/* Attachment Buttons */}
      <div className="flex gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files, 'image')}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          className="text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Image className="w-4 h-4" />
        </Button>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files, 'video')}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          className="text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Video className="w-4 h-4" />
        </Button>

        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files, 'document')}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => documentInputRef.current?.click()}
          className="text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          className="text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <MapPin className="w-4 h-4" />
        </Button>
      </div>

      {/* Location Picker */}
      {showLocationPicker && (
        <Card>
          <CardContent className="p-3">
            <div className="space-y-2">
              <Input
                placeholder="Enter location description (optional)"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleLocationShare} size="sm">
                  Share Current Location
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLocationPicker(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {getFileIcon(file)}
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <Badge variant="secondary" className="text-xs">
                {(file.size / 1024 / 1024).toFixed(1)}MB
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentUpload;
