import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sparkles, Wand2, Send, Crown, MapPin, Image, Video, Hash, AtSign, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { useAI } from "@/hooks/useAI";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const AIPostComposer = () => {
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [threadPosts, setThreadPosts] = useState(['']);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createPost } = usePosts();
  const { generateCaption, enhanceContent, loading: aiLoading } = useAI();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isThreadMode) {
      const validPosts = threadPosts.filter(post => post.trim());
      if (validPosts.length === 0) return;

      setIsPosting(true);
      // For threads, we'll combine all posts with thread indicators
      const threadContent = validPosts.map((post, index) => 
        `${index + 1}/${validPosts.length} ${post}`
      ).join('\n\n');

      await createPost(threadContent + (location ? `\n📍 ${location}` : ''));
      setThreadPosts(['']);
      setIsThreadMode(false);
    } else {
      if (!content.trim()) return;
      setIsPosting(true);
      await createPost(content + (location ? `\n📍 ${location}` : ''));
    }

    setContent('');
    setLocation('');
    setShowLocationInput(false);
    setIsPosting(false);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for AI generation",
        variant: "destructive"
      });
      return;
    }

    const generatedText = await generateCaption(aiPrompt);
    if (generatedText) {
      if (isThreadMode) {
        setThreadPosts(prev => {
          const newPosts = [...prev];
          newPosts[newPosts.length - 1] = generatedText;
          return newPosts;
        });
      } else {
        setContent(generatedText);
      }
      setAiPrompt('');
      setShowAI(false);
    }
  };

  const handleEnhance = async () => {
    const currentContent = isThreadMode ? threadPosts[threadPosts.length - 1] : content;
    if (!currentContent.trim()) {
      toast({
        title: "Content required",
        description: "Please write some content first to enhance",
        variant: "destructive"
      });
      return;
    }

    const enhanced = await enhanceContent(currentContent);
    if (enhanced) {
      if (isThreadMode) {
        setThreadPosts(prev => {
          const newPosts = [...prev];
          newPosts[newPosts.length - 1] = enhanced;
          return newPosts;
        });
      } else {
        setContent(enhanced);
      }
    }
  };

  const addThreadPost = () => {
    setThreadPosts(prev => [...prev, '']);
  };

  const updateThreadPost = (index: number, value: string) => {
    setThreadPosts(prev => {
      const newPosts = [...prev];
      newPosts[index] = value;
      return newPosts;
    });
  };

  const removeThreadPost = (index: number) => {
    if (threadPosts.length > 1) {
      setThreadPosts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setShowLocationInput(true);
        },
        () => {
          setShowLocationInput(true);
        }
      );
    } else {
      setShowLocationInput(true);
    }
  };

  if (!user) return null;

  return (
    <div className="border-b border-purple-200 dark:border-purple-800 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <div className="flex space-x-4">
        <Avatar className="ring-2 ring-purple-300 dark:ring-purple-500 transition-all duration-300 hover:ring-pink-400">
          <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
            {profile?.display_name?.[0]?.toUpperCase() || 
             profile?.username?.[0]?.toUpperCase() || 
             user.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Thread Mode Toggle */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsThreadMode(!isThreadMode)}
                className={`rounded-full transition-all duration-300 ${
                  isThreadMode 
                    ? 'bg-purple-100 dark:bg-purple-900 border-purple-500 text-purple-700 dark:text-purple-300' 
                    : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                📝 {isThreadMode ? 'Thread Mode' : 'Single Post'}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAI(!showAI)}
                  className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regal Assistant
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEnhance}
                  disabled={aiLoading}
                  className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Enhance
                </Button>
              </div>
            </div>

            {/* AI Assistant Panel */}
            {showAI && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                    Regal AI Assistant
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe what you want to post about..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1 border-purple-200 dark:border-purple-700 focus:border-purple-500"
                  />
                  <Button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {aiLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Thread Posts */}
            {isThreadMode ? (
              <div className="space-y-3">
                {threadPosts.map((post, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-2">
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                        {index + 1}
                      </span>
                      <Textarea
                        placeholder={`Thread post ${index + 1}...`}
                        value={post}
                        onChange={(e) => updateThreadPost(index, e.target.value)}
                        className="flex-1 min-h-[100px] border-purple-200 dark:border-purple-700 focus:border-purple-500 rounded-xl"
                        maxLength={280}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeThreadPost(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-8">
                      {post.length}/280 characters
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addThreadPost}
                  className="ml-8 border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to thread
                </Button>
              </div>
            ) : (
              <div>
                <Textarea
                  placeholder="What's happening?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] text-xl border-purple-200 dark:border-purple-700 focus:border-purple-500 rounded-xl resize-none"
                  maxLength={280}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {content.length}/280 characters
                </div>
              </div>
            )}

            {/* Location Input */}
            {showLocationInput && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <MapPin className="w-4 h-4 text-purple-600" />
                <Input
                  placeholder="Add location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLocationInput(false)}
                  className="text-purple-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-purple-200 dark:border-purple-700">
              <div className="flex items-center space-x-2">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2 rounded-full"
                >
                  <Image className="w-5 h-5" />
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2 rounded-full"
                >
                  <Video className="w-5 h-5" />
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={getCurrentLocation}
                  className="text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2 rounded-full"
                >
                  <MapPin className="w-5 h-5" />
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2 rounded-full"
                >
                  <Hash className="w-5 h-5" />
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2 rounded-full"
                >
                  <AtSign className="w-5 h-5" />
                </Button>
              </div>
              
              <InteractiveHoverButton
                type="submit"
                disabled={
                  isPosting || 
                  (isThreadMode ? threadPosts.every(post => !post.trim()) : !content.trim())
                }
                text={isPosting ? "Posting..." : isThreadMode ? "Post Thread" : "Post"}
                className="w-auto px-6"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIPostComposer;
