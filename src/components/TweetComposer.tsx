
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { X, Image as ImageIcon, Video, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import AccountSwitcher from "@/components/AccountSwitcher";
import AudioVisualizer from "./AudioVisualizer";
import ThreadComposer from "./ThreadComposer";
import TweetActions from "./TweetActions";
import CharacterCounter from "./CharacterCounter";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const TweetComposer = () => {
  const [tweetText, setTweetText] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<'personal' | string>('personal');
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [threadTweets, setThreadTweets] = useState([""]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showHashtagInput, setShowHashtagInput] = useState(false);
  const [showMentionInput, setShowMentionInput] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const [mentionInput, setMentionInput] = useState("");
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { createPost } = usePosts();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const maxLength = 280;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      switch (type) {
        case 'image':
          setSelectedImages(prev => [...prev, ...files]);
          break;
        case 'video':
          setSelectedVideos(prev => [...prev, ...files]);
          break;
        case 'document':
          setSelectedDocuments(prev => [...prev, ...files]);
          break;
      }
      toast({
        title: "Files added",
        description: `${files.length} ${type}(s) added to your post`
      });
    }
    if (e.target) e.target.value = '';
  };

  const removeFile = (index: number, type: 'image' | 'video' | 'document') => {
    switch (type) {
      case 'image':
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        break;
      case 'video':
        setSelectedVideos(prev => prev.filter((_, i) => i !== index));
        break;
      case 'document':
        setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
        break;
    }
  };

  const handleTweetSubmit = async () => {
    if (isThreadMode) {
      const validTweets = threadTweets.filter(tweet => tweet.trim().length > 0);
      if (validTweets.length > 0) {
        const combinedContent = validTweets.map((tweet, index) => 
          `🧵 ${index + 1}/${validTweets.length} ${tweet}`
        ).join("\n\n");
        await createPost(combinedContent);
        setThreadTweets([""]);
        setIsThreadMode(false);
        resetForm();
      }
    } else {
      if (tweetText.trim()) {
        let finalContent = tweetText;
        
        if (location.trim()) {
          finalContent += `\n📍 ${location}`;
        }
        
        await createPost(finalContent);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setTweetText("");
    setSelectedImages([]);
    setSelectedVideos([]);
    setSelectedDocuments([]);
    setSelectedAudio(null);
    setAudioURL("");
    setLocation("");
    setShowLocationInput(false);
    setShowHashtagInput(false);
    setShowMentionInput(false);
    setHashtagInput("");
    setMentionInput("");
    setAudioCurrentTime(0);
    setAudioDuration(0);
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

  const insertHashtag = () => {
    if (hashtagInput.trim()) {
      const hashtag = hashtagInput.startsWith('#') ? hashtagInput : `#${hashtagInput}`;
      if (isThreadMode) {
        const lastIndex = threadTweets.length - 1;
        updateThreadTweet(lastIndex, threadTweets[lastIndex] + ` ${hashtag}`);
      } else {
        setTweetText(prev => prev + ` ${hashtag}`);
      }
      setHashtagInput("");
      setShowHashtagInput(false);
      toast({
        title: "Hashtag added",
        description: `Added ${hashtag} to your post`
      });
    }
  };

  const insertMention = () => {
    if (mentionInput.trim()) {
      const mention = mentionInput.startsWith('@') ? mentionInput : `@${mentionInput}`;
      if (isThreadMode) {
        const lastIndex = threadTweets.length - 1;
        updateThreadTweet(lastIndex, threadTweets[lastIndex] + ` ${mention}`);
      } else {
        setTweetText(prev => prev + ` ${mention}`);
      }
      setMentionInput("");
      setShowMentionInput(false);
      toast({
        title: "Mention added",
        description: `Added ${mention} to your post`
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setShowLocationInput(true);
          toast({
            description: "Location added to your post!",
            duration: 2000,
          });
        },
        (error) => {
          toast({
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive",
            duration: 3000,
          });
          setShowLocationInput(true);
        }
      );
    } else {
      setShowLocationInput(true);
    }
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

          {/* Media Previews */}
          {(selectedImages.length > 0 || selectedVideos.length > 0 || selectedDocuments.length > 0) && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              {selectedImages.map((file, index) => (
                <div key={`img-${index}`} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index, 'image')}
                    className="absolute top-1 right-1 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {selectedVideos.map((file, index) => (
                <div key={`vid-${index}`} className="relative group">
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-24 object-cover rounded-lg"
                    controls={false}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index, 'video')}
                    className="absolute top-1 right-1 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {selectedDocuments.map((file, index) => (
                <div key={`doc-${index}`} className="relative group flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                  <Paperclip className="w-4 h-4 text-purple-500" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index, 'document')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

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
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                placeholder="What's happening?"
                className="w-full text-xl placeholder:text-purple-500 dark:placeholder:text-purple-400 border-0 resize-none outline-none bg-transparent dark:text-slate-100 min-h-[100px] transition-all duration-300 focus:bg-purple-50/50 dark:focus:bg-purple-800/50 rounded-xl p-3 hover:shadow-lg"
                maxLength={maxLength + 50}
              />
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'video')}
          />
          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'document')}
          />
          
          <TweetActions
            selectedImages={selectedImages}
            selectedVideos={selectedVideos}
            onImagesChange={(files) => {
              setSelectedImages(files);
              if (files.length === 0) return;
              imageInputRef.current?.click();
            }}
            onVideosChange={(files) => {
              setSelectedVideos(files);
              if (files.length === 0) return;
              videoInputRef.current?.click();
            }}
            onAudioRecorded={handleAudioRecorded}
            onAudioUploaded={handleAudioUploaded}
            onLocationClick={getCurrentLocation}
            onHashtagClick={() => setShowHashtagInput(true)}
            onMentionClick={() => setShowMentionInput(true)}
          />
          
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
          
          {/* Location Input */}
          {showLocationInput && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Input
                type="text"
                placeholder="Add location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationInput(false)}
                className="text-purple-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* Hashtag Input */}
          {showHashtagInput && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Input
                type="text"
                placeholder="Add hashtag..."
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && insertHashtag()}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={insertHashtag}
                className="text-purple-600"
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHashtagInput(false)}
                className="text-purple-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* Mention Input */}
          {showMentionInput && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Input
                type="text"
                placeholder="Mention someone..."
                value={mentionInput}
                onChange={(e) => setMentionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && insertMention()}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={insertMention}
                className="text-purple-600"
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMentionInput(false)}
                className="text-purple-600"
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
                disabled={isThreadMode ? threadTweets.every(tweet => !tweet.trim()) : (!tweetText.trim() || tweetText.length > maxLength)}
                onClick={handleTweetSubmit}
                text={isThreadMode ? 'Post Thread' : 'Post'}
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
