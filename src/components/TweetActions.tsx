
import { MapPin, Hash, AtSign, Smile, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaUpload from "./MediaUpload";
import AudioRecorder from "./AudioRecorder";

interface TweetActionsProps {
  selectedImages: File[];
  selectedVideos: File[];
  onImagesChange: (images: File[]) => void;
  onVideosChange: (videos: File[]) => void;
  onAudioRecorded: (file: File, url: string) => void;
  onAudioUploaded: (file: File, url: string) => void;
  onLocationClick: () => void;
  onHashtagClick: () => void;
  onMentionClick: () => void;
}

const TweetActions = ({
  selectedImages,
  selectedVideos,
  onImagesChange,
  onVideosChange,
  onAudioRecorded,
  onAudioUploaded,
  onLocationClick,
  onHashtagClick,
  onMentionClick
}: TweetActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <MediaUpload
        selectedImages={selectedImages}
        selectedVideos={selectedVideos}
        onImagesChange={onImagesChange}
        onVideosChange={onVideosChange}
      />

      <AudioRecorder
        onAudioRecorded={onAudioRecorded}
        onAudioUploaded={onAudioUploaded}
      />
      
      <Button 
        type="button"
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onLocationClick();
        }}
        className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
      >
        <MapPin className="w-5 h-5" />
      </Button>
      
      <Button 
        type="button"
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onHashtagClick();
        }}
        className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
      >
        <Hash className="w-5 h-5" />
      </Button>
      
      <Button 
        type="button"
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onMentionClick();
        }}
        className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
      >
        <AtSign className="w-5 h-5" />
      </Button>

      <Button 
        type="button"
        variant="ghost" 
        size="sm" 
        className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
      >
        <Smile className="w-5 h-5" />
      </Button>

      <Button 
        type="button"
        variant="ghost" 
        size="sm" 
        className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
      >
        <Calendar className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default TweetActions;
