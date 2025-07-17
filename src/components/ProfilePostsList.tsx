import { useProfilePosts } from '@/hooks/useProfilePosts';
import PostCard from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfilePostsListProps {
  userId?: string;
}

const ProfilePostsList = ({ userId }: ProfilePostsListProps) => {
  const { posts, loading } = useProfilePosts(userId);

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
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (error) {
        console.error('Failed to copy link');
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
        <p>No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isLiked={post.user_liked}
          isRetweeted={post.user_retweeted}
          retweetedBy={[]}
          onLike={() => {}}
          onRetweet={() => {}}
          onPin={() => {}}
          onDelete={() => {}}
          onShare={handleShare}
          onTrackView={() => {}}
        />
      ))}
    </div>
  );
};

export default ProfilePostsList;