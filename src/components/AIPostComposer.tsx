
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Wand2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useAI } from '@/hooks/useAI';

const AIPostComposer = () => {
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { generateCaption, enhanceContent, loading: aiLoading } = useAI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsPosting(true);
    await createPost(content);
    setContent('');
    setAiPrompt('');
    setShowAIHelper(false);
    setIsPosting(false);
  };

  const handleGenerateCaption = async () => {
    if (!aiPrompt.trim()) return;
    
    const generated = await generateCaption(aiPrompt);
    if (generated) {
      setContent(generated);
      setAiPrompt('');
    }
  };

  const handleEnhanceContent = async () => {
    if (!content.trim()) return;
    
    const enhanced = await enhanceContent(content);
    if (enhanced) {
      setContent(enhanced);
    }
  };

  if (!user) return null;

  return (
    <div className="border-b border-purple-200 dark:border-purple-800 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <div className="flex space-x-4">
        <Avatar className="ring-2 ring-purple-200 dark:ring-purple-600">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
            {user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          {/* AI Helper Toggle */}
          <div className="mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAIHelper(!showAIHelper)}
              className="mb-3 border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20"
            >
              <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
              AI Assistant
            </Button>
          </div>

          {/* AI Helper Panel */}
          {showAIHelper && (
            <div className="mb-4 p-4 border border-purple-200 dark:border-purple-700 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 block">
                    Generate Caption with AI
                  </label>
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Describe what you want to post about..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="flex-1 min-h-[60px] border-purple-200 dark:border-purple-700"
                    />
                    <Button
                      type="button"
                      onClick={handleGenerateCaption}
                      disabled={!aiPrompt.trim() || aiLoading}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {content && (
                  <Button
                    type="button"
                    onClick={handleEnhanceContent}
                    disabled={aiLoading}
                    variant="outline"
                    size="sm"
                    className="border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Enhance with AI
                  </Button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] border-0 resize-none text-xl placeholder:text-slate-400 focus-visible:ring-0 p-0 bg-transparent"
              maxLength={280}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-500">
                  {content.length}/280
                </span>
              </div>
              
              <Button 
                type="submit"
                disabled={!content.trim() || content.length > 280 || isPosting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-2 font-semibold"
              >
                {isPosting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIPostComposer;
