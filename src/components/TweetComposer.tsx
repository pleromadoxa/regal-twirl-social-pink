
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Image, 
  Video, 
  MapPin, 
  Hash, 
  AtSign, 
  Smile, 
  Calendar, 
  Mic,
  Music,
  Upload,
  Play,
  Pause,
  AudioWaveform,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import AccountSwitcher from "@/components/AccountSwitcher";

const TweetComposer = () => {
  const [tweetText, setTweetText] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<'personal' | string>('personal');
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [threadTweets, setThreadTweets] = useState([""]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
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
  
  const { toast } = useToast();
  const { createPost } = usePosts();
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const maxLength = 280;

  const handleTweetSubmit = async () => {
    if (isThreadMode) {
      const validTweets = threadTweets.filter(tweet => tweet.trim().length > 0);
      if (validTweets.length > 0) {
        const combinedContent = validTweets.join("\n\n");
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setSelectedAudio(audioFile);
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Click the mic button again to stop recording"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Audio recording saved"
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAudio(file);
      const url = URL.createObjectURL(file);
      setAudioURL(url);
      toast({
        title: "Audio uploaded",
        description: "Audio file added to your post"
      });
    }
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validImages = files.filter(file => file.type.startsWith('image/'));
      if (validImages.length !== files.length) {
        toast({
          title: "Invalid files",
          description: "Only image files are allowed",
          variant: "destructive"
        });
      }
      setSelectedImages(prev => [...prev, ...validImages].slice(0, 4));
      toast({
        title: "Images added",
        description: `${validImages.length} image(s) added to your post`
      });
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
      setSelectedVideos(prev => [...prev, ...validVideos].slice(0, 1));
      toast({
        title: "Video added",
        description: "Video added to your post"
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
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

  const getCharacterCountColor = (text: string) => {
    const length = text.length;
    if (length > maxLength) return 'text-red-500';
    if (length > maxLength * 0.8) return 'text-amber-500';
    return 'text-purple-500';
  };

  const getProgressColor = (text: string) => {
    const length = text.length;
    if (length > maxLength) return 'text-red-500';
    if (length > maxLength * 0.8) return 'text-amber-500';
    return 'text-purple-500';
  };

  const renderAudioVisualizer = () => {
    const bars = 20;
    const progress = audioDuration > 0 ? audioCurrentTime / audioDuration : 0;
    
    return (
      <div className="flex items-end gap-1 h-12 justify-center">
        {[...Array(bars)].map((_, i) => {
          const isActive = i / bars <= progress;
          const height = Math.random() * 60 + 20;
          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-t from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-t from-purple-200 to-pink-200'
              } ${isPlaying ? 'animate-pulse' : ''}`}
              style={{
                height: `${height}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderTweetInput = (text: string, onChange: (text: string) => void, index?: number) => (
    <div className="relative">
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={index === 0 || !isThreadMode ? "What's happening?" : "Continue your thread..."}
        className="w-full text-xl placeholder:text-purple-500 dark:placeholder:text-purple-400 border-0 resize-none outline-none bg-transparent min-h-[80px] transition-all duration-300 focus:bg-purple-50/50 dark:focus:bg-purple-800/50 rounded-lg p-2 hover:shadow-lg"
        maxLength={maxLength + 50}
      />
      
      {isThreadMode && index !== undefined && index > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeThreadTweet(index)}
          className="absolute top-2 right-2 text-purple-400 hover:text-red-500 transition-all duration-300 hover:scale-125 hover:rotate-180"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

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
            <div className="space-y-4">
              {threadTweets.map((tweet, index) => (
                <div key={index} className="relative">
                  {index > 0 && (
                    <div className="absolute -left-8 top-0 w-0.5 h-full bg-gradient-to-b from-purple-400 to-pink-400 dark:from-purple-500 dark:to-pink-500 animate-pulse"></div>
                  )}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-purple-700 p-4 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    {renderTweetInput(tweet, (text) => updateThreadTweet(index, text), index)}
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-purple-400 dark:text-purple-500 bg-purple-100 dark:bg-purple-700 px-2 py-1 rounded-full animate-pulse">Post {index + 1}</span>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs font-medium ${getCharacterCountColor(tweet)}`}>
                          {tweet.length}/{maxLength}
                        </span>
                        <div className="w-6 h-6">
                          <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-purple-200 dark:text-purple-600"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${Math.min((tweet.length / maxLength) * 50.3, 50.3)} 50.3`}
                              className={getProgressColor(tweet)}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={addThreadTweet}
                className="border-purple-300 dark:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 rounded-full hover:scale-110"
              >
                + Add to thread
              </Button>
            </div>
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
          
          {/* Media previews */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Selected ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg transition-all duration-300 group-hover:scale-105"
                  />
                  <Button
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
            <div className="space-y-2">
              {selectedVideos.map((video, index) => (
                <div key={index} className="relative group">
                  <video
                    src={URL.createObjectURL(video)}
                    className="w-full h-48 object-cover rounded-lg transition-all duration-300 group-hover:scale-105"
                    controls
                  />
                  <Button
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
          
          {/* Enhanced Audio preview with beautiful visualizer */}
          {selectedAudio && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Audio Recording
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedAudio.name} • {(selectedAudio.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeAudio}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAudioPlayback}
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-0 flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-600 p-4">
                  {renderAudioVisualizer()}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <AudioWaveform className="w-4 h-4" />
                  <span>{Math.floor(audioCurrentTime)}s / {Math.floor(audioDuration)}s</span>
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
          )}
          
          {/* Location input */}
          {showLocationInput && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <MapPin className="w-4 h-4 text-purple-600" />
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
          
          {/* Hashtag input */}
          {showHashtagInput && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Hash className="w-4 h-4 text-purple-600" />
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
          
          {/* Mention input */}
          {showMentionInput && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <AtSign className="w-4 h-4 text-purple-600" />
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
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => imageInputRef.current?.click()}
                className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
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
                variant="ghost" 
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
              >
                <Video className="w-5 h-5" />
              </Button>

              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => audioInputRef.current?.click()}
                className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
              >
                <Upload className="w-5 h-5" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleRecording}
                className={`p-2 transition-all duration-300 hover:scale-125 rounded-full ${
                  isRecording 
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' 
                    : 'text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <Mic className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={getCurrentLocation}
                className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
              >
                <MapPin className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowHashtagInput(true)}
                className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
              >
                <Hash className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowMentionInput(true)}
                className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
              >
                <AtSign className="w-5 h-5" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
              >
                <Smile className="w-5 h-5" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
              >
                <Calendar className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsThreadMode(!isThreadMode)}
                className={`border-blue-300 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 rounded-full hover:scale-110 ${isThreadMode ? 'bg-blue-50 dark:bg-blue-900/20 scale-105' : ''}`}
              >
                {isThreadMode ? 'Single Post' : 'Thread'}
              </Button>
              
              {!isThreadMode && (
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${getCharacterCountColor(tweetText)}`}>
                    {tweetText.length}/{maxLength}
                  </span>
                  <div className="w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-purple-200 dark:text-purple-600"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${Math.min((tweetText.length / maxLength) * 62.8, 62.8)} 62.8`}
                        className={getProgressColor(tweetText)}
                      />
                    </svg>
                  </div>
                </div>
              )}
              
              <Button
                disabled={isThreadMode ? threadTweets.every(tweet => !tweet.trim()) : (!tweetText.trim() || tweetText.length > maxLength)}
                onClick={handleTweetSubmit}
                className="bg-gradient-to-r from-purple-600 via-blue-500 to-pink-600 hover:from-purple-700 hover:via-blue-600 hover:to-pink-700 text-white rounded-full px-8 py-2 disabled:opacity-50 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl font-medium"
              >
                {isThreadMode ? 'Post Thread' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetComposer;
