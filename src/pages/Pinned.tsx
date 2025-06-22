
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Pin, BookmarkIcon } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { usePinnedPosts } from '@/hooks/usePinnedPosts';
import { usePosts } from '@/hooks/usePosts';
import { useToast } from '@/hooks/use-toast';

const Pinned = () => {
  const { pinnedPosts, loading } = usePinnedPosts();
  const { toggleLike, toggleRetweet, togglePin, deletePost, trackPostView } = usePosts();
  const { toast } = useToast();

  const handleShare = async (postId: string) => {
    const post = pinnedPosts.find(p => p.id === postId);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Pin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pinned Posts</h1>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                          <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pinnedPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookmarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No pinned posts yet
                  </h2>
                  <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                    When you pin posts, they'll appear here for easy access. Pin your favorite or important posts to keep them handy.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pinnedPosts.map((post) => {
                  // Transform the Post from usePinnedPosts to match the Post interface from usePosts
                  const transformedPost = {
                    ...post,
                    views_count: 0,
                    trending_score: 0,
                    user_liked: false,
                    user_retweeted: false,
                    user_pinned: true,
                    business_pages: null,
                    posted_as_page: null,
                    sponsored_post_id: null,
                    audio_url: null,
                    profiles: {
                      id: post.profiles?.id || post.user_id,
                      username: post.profiles?.username || 'unknown',
                      display_name: post.profiles?.display_name || 'Unknown User',
                      avatar_url: post.profiles?.avatar_url || '',
                      is_verified: post.profiles?.is_verified || false,
                      verification_level: post.profiles?.verification_level || 'none',
                      premium_tier: post.profiles?.premium_tier || 'free'
                    }
                  };

                  return (
                    <div key={post.id} className="relative">
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </div>
                      </div>
                      <PostCard
                        post={transformedPost}
                        onLike={toggleLike}
                        onRetweet={toggleRetweet}
                        onPin={togglePin}
                        onDelete={deletePost}
                        onShare={handleShare}
                        onTrackView={trackPostView}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Pinned;
