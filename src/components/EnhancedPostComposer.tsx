import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BusinessPageMentions from './BusinessPageMentions';
import AccountSwitcher from '@/components/AccountSwitcher';
import AudioVisualizer from './AudioVisualizer';
import ThreadComposer from './ThreadComposer';
import TweetActions from './TweetActions';
import CharacterCounter from './CharacterCounter';
import UserMentions from './UserMentions';
import LocationPicker from './LocationPicker';
import CalendarPicker from './CalendarPicker';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import AIPostEnhancer from './AIPostEnhancer';
import { usePolls } from '@/hooks/usePolls';
import { Input } from '@/components/ui/input';
import { BarChart3, Plus, Minus } from 'lucide-react';

const EnhancedPostComposer = () => {
  const [tweetText, setTweetText] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<'personal' | string>('personal');
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [threadTweets, setThreadTweets] = useState(['']);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Business page mentions state
  const [showBusinessMentions, setShowBusinessMentions] = useState(false);
  const [businessMentionSearchTerm, setBusinessMentionSearchTerm] = useState('');
  
  // Poll state
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollEndsAt, setPollEndsAt] = useState('');
  
  const { toast } = useToast();
  const { createPost } = usePosts();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createPoll } = usePolls();
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
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const uploadVideos = async (videos: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const video of videos) {
      const fileExt = video.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}-video-${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('post-videos')
        .upload(fileName, video, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading video:', error);
        throw new Error(`Failed to upload video: ${error.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('post-videos')
        .getPublicUrl(data.path);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const uploadAudio = async (audio: File): Promise<string> => {
    const fileExt = audio.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}-audio-${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('post-audio')
      .upload(fileName, audio);
    
    if (error) {
      console.error('Error uploading audio:', error);
      throw new Error(`Failed to upload audio: ${error.message}`);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('post-audio')
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      let mediaUrls: string[] = [];
      let audioUrl = "";
      
      // Upload images
      if (selectedImages.length > 0) {
        const imageUrls = await uploadImages(selectedImages);
        mediaUrls = [...mediaUrls, ...imageUrls];
      }

      // Upload videos
      if (selectedVideos.length > 0) {
        const videoUrls = await uploadVideos(selectedVideos);
        mediaUrls = [...mediaUrls, ...videoUrls];
      }

      // Upload audio
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
          
          await createPost(combinedContent, mediaUrls, selectedAccount, audioUrl);
          setThreadTweets([""]);
          setIsThreadMode(false);
          resetForm();
        }
      } else {
        if (tweetText.trim() || mediaUrls.length > 0 || audioUrl) {
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
          
          await createPost(finalContent, mediaUrls, selectedAccount, audioUrl);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: error instanceof Error ? error.message : "Failed to upload media or create post",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTweetText('');
    setSelectedImages([]);
    setSelectedVideos([]);
    setSelectedAudio(null);
    setAudioURL('');
    setLocation('');
    setScheduledDate(null);
    setShowLocationPicker(false);
    setShowMentions(false);
    setMentionQuery('');
    setShowBusinessMentions(false);
    setBusinessMentionSearchTerm('');
    setAudioCurrentTime(0);
    setAudioDuration(0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const position = e.target.selectionStart;
    
    setTweetText(text);
    setCursorPosition(position);
    
    const textBeforeCursor = text.slice(0, position);
    
    // Check for user mentions (@)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      setShowBusinessMentions(false);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
    
    // Check for business page mentions (#)
    const businessMentionMatch = textBeforeCursor.match(/#(\w*)$/);
    if (businessMentionMatch) {
      setBusinessMentionSearchTerm(businessMentionMatch[1]);
      setShowBusinessMentions(true);
      setShowMentions(false);
    } else {
      setShowBusinessMentions(false);
      setBusinessMentionSearchTerm('');
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
      setMentionQuery('');
      
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = beforeMention.length + username.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  };

  const handleBusinessMention = (mention: string) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = tweetText.substring(0, cursorPosition);
    const textAfterCursor = tweetText.substring(cursorPosition);
    
    // Replace the partial hashtag with the full mention
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    if (hashtagMatch) {
      const newTextBefore = textBeforeCursor.replace(/#(\w*)$/, mention);
      const newContent = newTextBefore + textAfterCursor;
      const newCursorPos = newTextBefore.length;
      
      setTweetText(newContent);
      setShowBusinessMentions(false);
      setBusinessMentionSearchTerm('');
      
      // Focus and set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
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
    setAudioURL('');
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
  };

  const addThreadTweet = () => {
    setThreadTweets([...threadTweets, '']);
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

  const handleAITextGenerated = (generatedText: string) => {
    if (isThreadMode) {
      const currentIndex = threadTweets.length - 1;
      updateThreadTweet(currentIndex, generatedText);
    } else {
      setTweetText(generatedText);
    }
  };

  // Handle clicking outside to close mentions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowMentions(false);
        setShowBusinessMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  // Get the correct avatar URL - prioritize profile avatar, then user metadata
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const displayName = profile?.display_name || profile?.username || user.email;
  const fallbackLetter = displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="p-6 space-y-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
      <div className="flex space-x-4">
        <div className="w-12">
          <Avatar className="ring-2 ring-purple-300 dark:ring-purple-500 transition-all duration-500 hover:ring-pink-400 dark:hover:ring-pink-400 shadow-lg hover:scale-110 hover:shadow-2xl">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 text-white font-semibold">
              {fallbackLetter}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 space-y-4">
          <AccountSwitcher 
            selectedAccount={selectedAccount}
            onAccountChange={setSelectedAccount}
          />

          <AIPostEnhancer
            onTextGenerated={handleAITextGenerated}
            currentText={isThreadMode ? threadTweets[threadTweets.length - 1] : tweetText}
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
                onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                placeholder="What's happening? Use @ for mentions, # for business pages..."
                className="w-full text-xl placeholder:text-purple-500 dark:placeholder:text-purple-400 border-0 resize-none outline-none bg-transparent dark:text-slate-100 min-h-[100px] transition-all duration-300 focus:bg-purple-50/50 dark:focus:bg-purple-800/50 rounded-xl p-3 hover:shadow-lg overflow-hidden"
                maxLength={maxLength + 50}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              
              <UserMentions
                query={mentionQuery}
                onSelect={handleMentionSelect}
                isVisible={showMentions}
              />
              
              {showBusinessMentions && (
                <BusinessPageMentions
                  onMention={handleBusinessMention}
                  searchTerm={businessMentionSearchTerm}
                />
              )}
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

          {/* Video Preview */}
          {selectedVideos.length > 0 && (
            <div className="grid grid-cols-1 gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              {selectedVideos.map((video, index) => (
                <div key={index} className="relative">
                  <video
                    src={URL.createObjectURL(video)}
                    className="w-full h-40 object-cover rounded-lg"
                    controls
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVideos(selectedVideos.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-black/50 text-white hover:bg-black/70 rounded-full p-1 h-6 w-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Audio Preview */}
          {selectedAudio && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
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
              <audio
                ref={audioRef}
                src={audioURL}
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
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Location Display */}
          {location && (
            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
              <span>📍 {location}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('')}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Scheduled Date Display */}
          {scheduledDate && (
            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
              <span>📅 Scheduled for {scheduledDate.toLocaleDateString()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScheduledDate(null)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-4">
              <CharacterCounter 
                text={isThreadMode ? 
                  threadTweets.join('') : 
                  tweetText
                } 
                maxLength={maxLength} 
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsThreadMode(!isThreadMode)}
                className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                {isThreadMode ? '🧵 Thread Mode' : 'Add Thread'}
              </Button>
            </div>
            
            <div className="mr-4">
              <InteractiveHoverButton
                text={isUploading ? 'Posting...' : (isThreadMode ? 'Post Thread' : 'Post')}
                onClick={handleSubmit}
                disabled={isUploading || (
                  !tweetText.trim() && 
                  selectedImages.length === 0 && 
                  selectedVideos.length === 0 && 
                  !selectedAudio &&
                  (!isThreadMode || threadTweets.every(tweet => !tweet.trim()))
                )}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-2 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPostComposer;