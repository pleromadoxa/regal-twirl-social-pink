import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import BusinessPageMentions from './BusinessPageMentions';

const EnhancedPostComposer = () => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showBusinessMentions, setShowBusinessMentions] = useState(false);
  const [mentionSearchTerm, setMentionSearchTerm] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createPost } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsPosting(true);
    await createPost(content);
    setContent('');
    setShowBusinessMentions(false);
    setIsPosting(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    
    setContent(newContent);
    setCursorPosition(newCursorPosition);

    // Check for hashtag mentions
    const textBeforeCursor = newContent.substring(0, newCursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      setMentionSearchTerm(hashtagMatch[1]);
      setShowBusinessMentions(true);
    } else {
      setShowBusinessMentions(false);
      setMentionSearchTerm('');
    }
  };

  const handleMention = (mention: string) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    
    // Replace the partial hashtag with the full mention
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    if (hashtagMatch) {
      const newTextBefore = textBeforeCursor.replace(/#(\w*)$/, mention);
      const newContent = newTextBefore + textAfterCursor;
      const newCursorPos = newTextBefore.length;
      
      setContent(newContent);
      setShowBusinessMentions(false);
      setMentionSearchTerm('');
      
      // Focus and set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  // Handle clicking outside to close mentions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
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
    <div className="border-b border-slate-200 dark:border-slate-700 p-6">
      <div className="flex space-x-4">
        <Avatar className="ring-2 ring-slate-200 dark:ring-slate-600">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-purple-500 text-white font-semibold">
            {fallbackLetter}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="What's happening? Use # to mention business pages..."
                value={content}
                onChange={handleTextChange}
                onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                className="min-h-[120px] border-0 resize-none text-xl placeholder:text-slate-400 focus-visible:ring-0 p-0"
                maxLength={280}
              />
              
              {showBusinessMentions && (
                <BusinessPageMentions
                  onMention={handleMention}
                  searchTerm={mentionSearchTerm}
                />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 space-y-1">
                <div>{content.length}/280</div>
                <div className="text-xs">
                  💡 Tip: Use # to mention and share business pages
                </div>
              </div>
              
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

export default EnhancedPostComposer;