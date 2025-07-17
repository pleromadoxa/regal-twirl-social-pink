
import { usePosts } from '@/hooks/usePosts';
import { useToast } from '@/hooks/use-toast';
import PostCard from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';

const PostsList = () => {
  const { posts, loading, toggleLike, toggleRetweet, togglePin, deletePost, trackPostView } = usePosts();
  const { toast } = useToast();

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          text: post.content.substring(0, 100) + '...',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => toggleLike(post.id)}
          onRetweet={() => toggleRetweet(post.id)}
          onPin={() => togglePin(post.id)}
          onDelete={() => deletePost(post.id)}
          onShare={handleShare}
          onTrackView={() => trackPostView(post.id)}
        />
      ))}
    </div>
  );
};

export default PostsList;
