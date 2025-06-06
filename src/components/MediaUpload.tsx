
import { useRef } from "react";
import { Image, Video, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadProps {
  selectedImages: File[];
  selectedVideos: File[];
  selectedDocuments?: File[];
  onImagesChange: (images: File[]) => void;
  onVideosChange: (videos: File[]) => void;
  onDocumentsChange?: (documents: File[]) => void;
}

const MediaUpload = ({ 
  selectedImages, 
  selectedVideos, 
  selectedDocuments = [],
  onImagesChange, 
  onVideosChange,
  onDocumentsChange
}: MediaUploadProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
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
          description: `${validImages.length} image(s) added to your message`
        });
      }
    }
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
          description: "You can only attach one video per message",
          variant: "destructive"
        });
      } else if (validVideos.length > 0) {
        onVideosChange([validVideos[0]]);
        toast({
          title: "Video added",
          description: "Video added to your message"
        });
      }
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onDocumentsChange) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validDocuments = files.filter(file => 
        file.type === 'application/pdf' || 
        file.type.includes('document') ||
        file.type.includes('text') ||
        file.type.includes('spreadsheet')
      );
      
      if (validDocuments.length !== files.length) {
        toast({
          title: "Invalid files",
          description: "Only document files (PDF, DOC, TXT, etc.) are allowed",
          variant: "destructive"
        });
      }
      
      const maxDocuments = 3 - selectedDocuments.length;
      if (validDocuments.length > maxDocuments) {
        toast({
          title: "Too many documents",
          description: `You can only attach up to 3 documents. ${maxDocuments} slots available.`,
          variant: "destructive"
        });
        onDocumentsChange([...selectedDocuments, ...validDocuments.slice(0, maxDocuments)]);
      } else {
        onDocumentsChange([...selectedDocuments, ...validDocuments]);
        toast({
          title: "Documents added",
          description: `${validDocuments.length} document(s) added to your message`
        });
      }
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(selectedImages.filter((_, i) => i !== index));
    toast({
      title: "Image removed",
      description: "Image removed from your message"
    });
  };

  const removeVideo = (index: number) => {
    onVideosChange(selectedVideos.filter((_, i) => i !== index));
    toast({
      title: "Video removed",
      description: "Video removed from your message"
    });
  };

  const removeDocument = (index: number) => {
    if (!onDocumentsChange) return;
    onDocumentsChange(selectedDocuments.filter((_, i) => i !== index));
    toast({
      title: "Document removed",
      description: "Document removed from your message"
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

      {onDocumentsChange && (
        <>
          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx"
            multiple
            className="hidden"
            onChange={handleDocumentSelect}
          />
          <Button 
            type="button"
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              documentInputRef.current?.click();
            }}
            className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
            disabled={selectedDocuments.length >= 3}
          >
            <FileText className="w-5 h-5" />
          </Button>
        </>
      )}

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

      {selectedDocuments.length > 0 && (
        <div className="space-y-2 mt-4">
          {selectedDocuments.map((document, index) => (
            <div key={index} className="relative group flex items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <FileText className="w-6 h-6 text-purple-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {document.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(document.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDocument(index)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300"
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
