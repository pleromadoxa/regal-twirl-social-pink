import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Repeat2, Share, TrendingUp, Eye, Megaphone, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface BoostedPost {
  id: string;
  post_id: string;
  business_page_id: string;
  budget_amount: number;
  impressions: number;
  clicks: number;
  status: string;
  created_at: string;
  posts: {
    id: string;
    content: string;
    image_urls?: string[];
    video_url?: string;
    created_at: string;
    likes_count: number;
    retweets_count: number;
    replies_count: number;
    views_count: number;
    user_id: string;
    profiles: {
      id: string;
      username: string;
      display_name: string;
      avatar_url?: string;
      is_verified?: boolean;
    };
  };
  business_pages: {
    id: string;
    page_name: string;
    avatar_url?: string;
    is_verified?: boolean;
    page_type: string;
  };
}

const BoostedPostsSection = () => {
  const [boostedPosts, setBoostedPosts] = useState<BoostedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoostedPosts();
  }, []);

  const fetchBoostedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsored_posts')
        .select(`
          *,
          posts!sponsored_posts_post_id_fkey(
            id,
            content,
            image_urls,
            video_url,
            created_at,
            likes_count,
            retweets_count,
            replies_count,
            views_count,
            user_id,
            profiles!inner(
              id,
              username,
              display_name,
              avatar_url,
              is_verified
            )
          ),
          business_pages!inner(
            id,
            page_name,
            avatar_url,
            is_verified,
            page_type
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBoostedPosts(data as any || []);
    } catch (error) {
      console.error('Error fetching boosted posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (postId: string, type: 'like' | 'view' | 'click') => {
    // Track interactions for analytics
    try {
      if (type === 'view') {
        await supabase.from('post_views').insert({
          post_id: postId,
          viewer_id: null // Anonymous view
        });
      }
      // Update sponsored post metrics
      if (type === 'click') {
        const { data: currentData } = await supabase
          .from('sponsored_posts')
          .select('clicks')
          .eq('post_id', postId)
          .single();
        
        if (currentData) {
          await supabase
            .from('sponsored_posts')
            .update({ clicks: (currentData.clicks || 0) + 1 })
            .eq('post_id', postId);
        }
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            Sponsored Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-purple-200 dark:bg-purple-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (boostedPosts.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            Sponsored Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-4" />
            <p>No sponsored content available at the moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-purple-600" />
          Sponsored Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {boostedPosts.map((boostedPost) => (
            <div key={boostedPost.id} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
              {/* Sponsored Indicator */}
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  <Megaphone className="w-3 h-3 mr-1" />
                  Sponsored
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye className="w-3 h-3" />
                  {boostedPost.impressions.toLocaleString()} views
                </div>
              </div>

              {/* Business Page Header */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={boostedPost.business_pages.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                    {boostedPost.business_pages.page_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/professional/${boostedPost.business_pages.id}`}
                      className="font-semibold hover:text-purple-600 transition-colors"
                    >
                      {boostedPost.business_pages.page_name}
                    </Link>
                    {boostedPost.business_pages.is_verified && (
                      <Crown className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {boostedPost.business_pages.page_type}
                    </Badge>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(boostedPost.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              {/* Original Post Content */}
              <div className="mb-4">
                <p className="text-gray-900 dark:text-gray-100 mb-3">
                  {boostedPost.posts.content}
                </p>

                {/* Post Images */}
                {boostedPost.posts.image_urls && boostedPost.posts.image_urls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {boostedPost.posts.image_urls.slice(0, 4).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleInteraction(boostedPost.posts.id, 'click')}
                      />
                    ))}
                  </div>
                )}

                {/* Post Video */}
                {boostedPost.posts.video_url && (
                  <video
                    src={boostedPost.posts.video_url}
                    controls
                    className="w-full max-h-96 rounded-lg mb-3"
                    onClick={() => handleInteraction(boostedPost.posts.id, 'click')}
                  />
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                    onClick={() => handleInteraction(boostedPost.posts.id, 'like')}
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{boostedPost.posts.likes_count}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{boostedPost.posts.replies_count}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition-colors"
                  >
                    <Repeat2 className="w-4 h-4" />
                    <span className="text-sm">{boostedPost.posts.retweets_count}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-gray-600 hover:text-purple-500 transition-colors"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>{boostedPost.clicks} clicks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BoostedPostsSection;