
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';

const PostComposer = () => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { user } = useAuth();
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

  return (
    <div className="border-b border-purple-200 dark:border-purple-700 p-6">
      <div className="flex space-x-4">
        <Avatar className="ring-2 ring-purple-300 dark:ring-purple-500">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 text-white font-semibold">
            {user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] border-0 resize-none text-xl placeholder:text-purple-400 dark:placeholder:text-purple-500 focus-visible:ring-0 p-0"
              maxLength={280}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-500 dark:text-purple-400">
                {content.length}/280
              </span>
              
              <Button 
                type="submit"
                disabled={!content.trim() || content.length > 280 || isPosting}
                className="bg-gradient-to-r from-purple-600 via-blue-500 to-pink-600 hover:from-purple-700 hover:via-blue-600 hover:to-pink-700 text-white rounded-full px-8 py-2 font-semibold transition-all duration-300 hover:scale-105"
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
