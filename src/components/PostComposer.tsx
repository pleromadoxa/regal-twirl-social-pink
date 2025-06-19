
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';

const PostComposer = () => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createPost } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsPosting(true);
    await createPost(content);
    setContent('');
    setIsPosting(false);
  };

  if (!user) return null;

  // Get the correct avatar URL - prioritize profile avatar, then user metadata
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const displayName = profile?.display_name || profile?.username || user.email;
  const fallbackLetter = displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 p-6">
      <div className="flex space-x-4">
        <Avatar className="ring-2 ring-slate-200 dark:ring-slate-600">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-purple-500 text-white font-semibold">
            {fallbackLetter}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] border-0 resize-none text-xl placeholder:text-slate-400 focus-visible:ring-0 p-0"
              maxLength={280}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {content.length}/280
              </span>
              
              <Button 
                type="submit"
                disabled={!content.trim() || content.length > 280 || isPosting}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-2 font-semibold"
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

export default PostComposer;
