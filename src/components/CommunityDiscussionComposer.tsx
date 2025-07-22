import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send, X } from "lucide-react";
import { useCommunityDiscussions } from "@/hooks/useCommunityDiscussions";
import { useAuth } from "@/contexts/AuthContext";

const CommunityDiscussionComposer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDiscussion } = useCommunityDiscussions();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    try {
      setIsSubmitting(true);
      await createDiscussion(content);
      setContent("");
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create discussion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="mb-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start Discussion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-purple-200 dark:border-purple-800">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-slate-200 flex items-center justify-between">
            Start a Community Discussion
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Share your thoughts with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] resize-none border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 bg-white/80 dark:bg-slate-800/80"
            autoFocus
          />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Press Ctrl+Enter to post
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Discussion
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityDiscussionComposer;