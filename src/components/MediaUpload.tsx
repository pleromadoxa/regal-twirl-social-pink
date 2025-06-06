
import { useRef } from "react";
import { Image, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadProps {
  selectedImages: File[];
  selectedVideos: File[];
  onImagesChange: (images: File[]) => void;
  onVideosChange: (videos: File[]) => void;
}

const MediaUpload = ({ 
  selectedImages, 
  selectedVideos, 
  onImagesChange, 
  onVideosChange 
}: MediaUploadProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validImages = files.filter(file => file.type.startsWith('image/'));
      const maxImages = 4 - selectedImages.length;
      
      if (validImages.length !== files.length) {
        toast({
          title: "Invalid files",
          description: "Only image files are allowed",
          variant: "destructive"
        });
      }
      
      if (validImages.length > maxImages) {
        toast({
          title: "Too many images",
          description: `You can only attach up to 4 images. ${maxImages} slots available.`,
          variant: "destructive"
        });
        onImagesChange([...selectedImages, ...validImages.slice(0, maxImages)]);
      } else {
        onImagesChange([...selectedImages, ...validImages]);
        toast({
          title: "Images added",
          description: `${validImages.length} image(s) added to your post`
        });
      }
    }
    // Reset the input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validVideos = files.filter(file => file.type.startsWith('video/'));
      if (validVideos.length !== files.length) {
        toast({
          title: "Invalid files",
          description: "Only video files are allowed",
          variant: "destructive"
        });
      }
      
      if (selectedVideos.length > 0) {
        toast({
          title: "Video limit reached",
          description: "You can only attach one video per post",
          variant: "destructive"
        });
      } else if (validVideos.length > 0) {
        onVideosChange([validVideos[0]]);
        toast({
          title: "Video added",
          description: "Video added to your post"
        });
      }
    }
    // Reset the input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(selectedImages.filter((_, i) => i !== index));
    toast({
      title: "Image removed",
      description: "Image removed from your post"
    });
  };

  const removeVideo = (index: number) => {
    onVideosChange(selectedVideos.filter((_, i) => i !== index));
    toast({
      title: "Video removed",
      description: "Video removed from your post"
    });
  };

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />
      <Button 
        type="button"
        variant="ghost" 
        size="sm" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          imageInputRef.current?.click();
        }}
        className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
        disabled={selectedImages.length >= 4}
      >
        <Image className="w-5 h-5" />
      </Button>
      
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoSelect}
      />
      <Button 
        type="button"
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          videoInputRef.current?.click();
        }}
        className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
        disabled={selectedVideos.length >= 1}
      >
        <Video className="w-5 h-5" />
      </Button>

      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(image)}
                alt={`Selected ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg transition-all duration-300 group-hover:scale-105"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/50 text-white hover:bg-red-500/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {selectedVideos.length > 0 && (
        <div className="space-y-2 mt-4">
          {selectedVideos.map((video, index) => (
            <div key={index} className="relative group">
              <video
                src={URL.createObjectURL(video)}
                className="w-full h-48 object-cover rounded-lg transition-all duration-300 group-hover:scale-105"
                controls
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeVideo(index)}
                className="absolute top-1 right-1 bg-black/50 text-white hover:bg-red-500/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MediaUpload;
