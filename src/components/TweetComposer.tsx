import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AccountSwitcher from "@/components/AccountSwitcher";
import AudioVisualizer from "./AudioVisualizer";
import ThreadComposer from "./ThreadComposer";
import TweetActions from "./TweetActions";
import CharacterCounter from "./CharacterCounter";
import UserMentions from "./UserMentions";
import LocationPicker from "./LocationPicker";
import CalendarPicker from "./CalendarPicker";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const TweetComposer = () => {
  const [tweetText, setTweetText] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<'personal' | string>('personal');
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [threadTweets, setThreadTweets] = useState([""]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [location, setLocation] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const { createPost } = usePosts();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 280;

  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(fileName, image);
      
      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const uploadAudio = async (audio: File): Promise<string> => {
    const fileExt = audio.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}-audio.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('post-audio')
      .upload(fileName, audio);
    
    if (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('post-audio')
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleTweetSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      let imageUrls: string[] = [];
      let audioUrl = "";
      
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(selectedImages);
      }

      if (selectedAudio) {
        audioUrl = await uploadAudio(selectedAudio);
      }
      
      if (isThreadMode) {
        const validTweets = threadTweets.filter(tweet => tweet.trim().length > 0);
        if (validTweets.length > 0) {
          let combinedContent = validTweets.join("\n\n");
          
          if (location.trim()) {
            combinedContent += `\n📍 ${location}`;
          }
          if (scheduledDate) {
            combinedContent += `\n📅 Scheduled for ${scheduledDate.toLocaleDateString()}`;
          }
          if (audioUrl) {
            combinedContent += `\n🎵 Audio message attached`;
          }
          
          await createPost(combinedContent, imageUrls, selectedAccount);
          setThreadTweets([""]);
          setIsThreadMode(false);
          resetForm();
        }
      } else {
        if (tweetText.trim() || imageUrls.length > 0 || audioUrl) {
          let finalContent = tweetText;
          
          if (location.trim()) {
            finalContent += `\n📍 ${location}`;
          }
          if (scheduledDate) {
            finalContent += `\n📅 Scheduled for ${scheduledDate.toLocaleDateString()}`;
          }
          if (audioUrl) {
            finalContent += `\n🎵 Audio message attached`;
          }
          
          await createPost(finalContent, imageUrls, selectedAccount);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Failed to upload media or create post",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTweetText("");
    setSelectedImages([]);
    setSelectedVideos([]);
    setSelectedAudio(null);
    setAudioURL("");
    setLocation("");
    setScheduledDate(null);
    setShowLocationPicker(false);
    setShowMentions(false);
    setMentionQuery("");
    setAudioCurrentTime(0);
    setAudioDuration(0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const position = e.target.selectionStart;
    
    setTweetText(text);
    setCursorPosition(position);
    
    const textBeforeCursor = text.slice(0, position);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  const handleMentionSelect = (username: string) => {
    if (!textareaRef.current) return;
    
    const textBeforeCursor = tweetText.slice(0, cursorPosition);
    const textAfterCursor = tweetText.slice(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
      const newText = `${beforeMention}@${username} ${textAfterCursor}`;
      setTweetText(newText);
      setShowMentions(false);
      setMentionQuery("");
      
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = beforeMention.length + username.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  };

  const handleBibleVerseSelect = (verse: string) => {
    if (isThreadMode) {
      const currentIndex = threadTweets.length - 1;
      updateThreadTweet(currentIndex, threadTweets[currentIndex] + (threadTweets[currentIndex] ? '\n\n' : '') + verse);
    } else {
      setTweetText(prev => prev + (prev ? '\n\n' : '') + verse);
    }
  };

  const handleAudioRecorded = (file: File, url: string) => {
    setSelectedAudio(file);
    setAudioURL(url);
  };

  const handleAudioUploaded = (file: File, url: string) => {
    setSelectedAudio(file);
    setAudioURL(url);
  };

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const removeAudio = () => {
    setSelectedAudio(null);
    setAudioURL("");
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
  };

  const addThreadTweet = () => {
    setThreadTweets([...threadTweets, ""]);
  };

  const updateThreadTweet = (index: number, text: string) => {
    const newThreadTweets = [...threadTweets];
    newThreadTweets[index] = text;
    setThreadTweets(newThreadTweets);
  };

  const removeThreadTweet = (index: number) => {
    if (threadTweets.length > 1) {
      setThreadTweets(threadTweets.filter((_, i) => i !== index));
    }
  };

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    toast({
      description: `Location "${selectedLocation}" added to your post!`,
      duration: 2000,
    });
  };

  const handleDateSelect = (date: Date) => {
    setScheduledDate(date);
    toast({
      description: `Post scheduled for ${date.toLocaleDateString()}`,
      duration: 2000,
    });
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
      <div className="flex space-x-4">
        <div className="w-12">
          <Avatar className="ring-2 ring-purple-300 dark:ring-purple-500 transition-all duration-500 hover:ring-pink-400 dark:hover:ring-pink-400 shadow-lg hover:scale-110 hover:shadow-2xl">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 text-white font-semibold animate-pulse">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 space-y-4">
          <AccountSwitcher 
            selectedAccount={selectedAccount}
            onAccountChange={setSelectedAccount}
          />

          {isThreadMode ? (
            <ThreadComposer
              threadTweets={threadTweets}
              maxLength={maxLength}
              onUpdateTweet={updateThreadTweet}
              onRemoveTweet={removeThreadTweet}
              onAddTweet={addThreadTweet}
            />
          ) : (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={tweetText}
                onChange={handleTextChange}
                placeholder="What's happening?"
                className="w-full text-xl placeholder:text-purple-500 dark:placeholder:text-purple-400 border-0 resize-none outline-none bg-transparent dark:text-slate-100 min-h-[100px] transition-all duration-300 focus:bg-purple-50/50 dark:focus:bg-purple-800/50 rounded-xl p-3 hover:shadow-lg"
                maxLength={maxLength + 50}
              />
              
              <UserMentions
                query={mentionQuery}
                onSelect={handleMentionSelect}
                isVisible={showMentions}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TweetActions
                selectedImages={selectedImages}
                selectedVideos={selectedVideos}
                onImagesChange={setSelectedImages}
                onVideosChange={setSelectedVideos}
                onAudioRecorded={handleAudioRecorded}
                onAudioUploaded={handleAudioUploaded}
                onLocationClick={() => setShowLocationPicker(true)}
                onHashtagClick={() => {
                  const hashtag = prompt("Enter hashtag:");
                  if (hashtag) {
                    const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
                    if (isThreadMode) {
                      const currentIndex = threadTweets.length - 1;
                      updateThreadTweet(currentIndex, threadTweets[currentIndex] + ` ${tag}`);
                    } else {
                      setTweetText(prev => prev + ` ${tag}`);
                    }
                  }
                }}
                onMentionClick={() => {
                  if (textareaRef.current) {
                    const position = textareaRef.current.selectionStart;
                    const newText = tweetText.slice(0, position) + '@' + tweetText.slice(position);
                    setTweetText(newText);
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(position + 1, position + 1);
                  }
                }}
                onBibleVerseSelect={handleBibleVerseSelect}
              />

              <CalendarPicker onDateSelect={handleDateSelect} />
            </div>
          </div>

          <div className="relative">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              isVisible={showLocationPicker}
              onClose={() => setShowLocationPicker(false)}
            />
          </div>

          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-black/50 text-white hover:bg-black/70 rounded-full p-1 h-6 w-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <AudioVisualizer
            selectedAudio={selectedAudio}
            audioURL={audioURL}
            isPlaying={isPlaying}
            audioCurrentTime={audioCurrentTime}
            audioDuration={audioDuration}
            onTogglePlayback={toggleAudioPlayback}
            onRemoveAudio={removeAudio}
            audioRef={audioRef}
          />
          
          {/* Location Display */}
          {location && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm text-purple-600 dark:text-purple-400">📍 {location}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("")}
                className="text-purple-600 p-1 h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Scheduled Date Display */}
          {scheduledDate && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm text-purple-600 dark:text-purple-400">
                📅 Scheduled for {scheduledDate.toLocaleDateString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScheduledDate(null)}
                className="text-purple-600 p-1 h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsThreadMode(!isThreadMode)}
                className={`border-blue-300 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 rounded-full hover:scale-110 ${isThreadMode ? 'bg-blue-50 dark:bg-blue-900/20 scale-105' : ''}`}
              >
                {isThreadMode ? 'Single Post' : 'Thread'}
              </Button>
              
              {!isThreadMode && (
                <CharacterCounter text={tweetText} maxLength={maxLength} />
              )}
              
              <InteractiveHoverButton
                type="button"
                disabled={isUploading || (isThreadMode ? threadTweets.every(tweet => !tweet.trim()) : (!tweetText.trim() && selectedImages.length === 0 && !selectedAudio) || tweetText.length > maxLength)}
                onClick={handleTweetSubmit}
                text={isUploading ? 'Posting...' : (isThreadMode ? 'Post Thread' : 'Post')}
                className="w-auto px-6"
              />
            </div>
          </div>
        </div>
      </div>

      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setAudioDuration(audioRef.current.duration);
            }
          }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setAudioCurrentTime(audioRef.current.currentTime);
            }
          }}
          className="hidden"
        />
      )}
    </div>
  );
};

export default TweetComposer;
