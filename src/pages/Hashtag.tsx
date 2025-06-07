
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SidebarNav from "@/components/SidebarNav";
import PostsList from "@/components/PostsList";
import { Button } from "@/components/ui/button";
import { Hash, ArrowLeft, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HashtagPost {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  user_id: string;
  image_urls: string[];
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
    followers_count: number;
  };
}

const Hashtag = () => {
  const { hashtag } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<HashtagPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postCount, setPostCount] = useState(0);

  const searchHashtag = hashtag || searchParams.get('q') || '';
  const formattedHashtag = searchHashtag.startsWith('#') ? searchHashtag : `#${searchHashtag}`;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (searchHashtag) {
      fetchHashtagPosts();
    }
  }, [searchHashtag]);

  const fetchHashtagPosts = async () => {
    try {
      setLoadingPosts(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          likes_count,
          retweets_count,
          replies_count,
          user_id,
          image_urls,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            is_verified,
            followers_count
          )
        `)
        .ilike('content', `%${formattedHashtag}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setPosts(data || []);
      setPostCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching hashtag posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Hash className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formattedHashtag}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{postCount} posts</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.profiles?.display_name?.[0] || post.profiles?.username?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {post.profiles?.display_name || post.profiles?.username}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-sm">
                            @{post.profiles?.username}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-sm">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mb-3">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                          <span>{post.likes_count} likes</span>
                          <span>{post.retweets_count} retweets</span>
                          <span>{post.replies_count} replies</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Hash className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No posts found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                No posts found for {formattedHashtag}. Be the first to post!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Hashtag;
