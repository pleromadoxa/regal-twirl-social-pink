import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Megaphone, ExternalLink, Heart, MessageCircle, Share } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SponsoredPost {
  id: string;
  business_page_id: string;
  impressions: number;
  clicks: number;
  posts: {
    id: string;
    content: string;
    image_urls?: string[];
    likes_count: number;
    replies_count: number;
  };
  business_pages: {
    id: string;
    page_name: string;
    page_avatar_url?: string;
    is_verified: boolean;
  };
}

const SponsoredPostsWidget = () => {
  const [sponsoredPosts, setSponsoredPosts] = useState<SponsoredPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSponsoredPosts();
  }, []);

  const fetchSponsoredPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsored_posts')
        .select(`
          id,
          business_page_id,
          impressions,
          clicks,
          posts!sponsored_posts_post_id_fkey(
            id,
            content,
            image_urls,
            likes_count,
            replies_count
          ),
          business_pages!inner(
            id,
            page_name,
            page_avatar_url,
            is_verified
          )
        `)
        .eq('status', 'active')
        .order('impressions', { ascending: false })
        .limit(3);

      if (error) throw error;
      setSponsoredPosts(data || []);
    } catch (error) {
      console.error('Error fetching sponsored posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = async (postId: string, sponsoredPostId: string) => {
    try {
      // Record click for analytics
      const { data } = await supabase
        .from('sponsored_posts')
        .select('clicks')
        .eq('id', sponsoredPostId)
        .single();
      
      if (data) {
        await supabase
          .from('sponsored_posts')
          .update({ clicks: (data.clicks || 0) + 1 })
          .eq('id', sponsoredPostId);
      }
    } catch (error) {
      console.error('Error recording click:', error);
    }
    
    // Navigate to post (you might want to create a post detail page)
    console.log('Navigate to post:', postId);
  };

  const handleBusinessClick = (businessPageId: string) => {
    navigate(`/professional/${businessPageId}`);
  };

  if (loading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="w-5 h-5 text-blue-600" />
            Sponsored Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-purple-200 dark:bg-purple-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sponsoredPosts.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Megaphone className="w-5 h-5 text-blue-600" />
          Sponsored Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sponsoredPosts.map((sponsored) => (
            <div 
              key={sponsored.id}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={sponsored.business_pages.page_avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {sponsored.business_pages.page_name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 
                      className="font-semibold text-sm cursor-pointer hover:text-blue-600"
                      onClick={() => handleBusinessClick(sponsored.business_page_id)}
                    >
                      {sponsored.business_pages.page_name}
                    </h4>
                    {sponsored.business_pages.is_verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                      Sponsored
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                {sponsored.posts.content}
              </p>

              {sponsored.posts.image_urls && sponsored.posts.image_urls.length > 0 && (
                <div className="mb-3">
                  <img 
                    src={sponsored.posts.image_urls[0]} 
                    alt="" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {sponsored.posts.likes_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {sponsored.posts.replies_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <Share className="w-3 h-3" />
                    {sponsored.clicks}
                  </div>
                </div>
                <span>{sponsored.impressions.toLocaleString()} views</span>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={() => handlePostClick(sponsored.posts.id, sponsored.id)}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Learn More
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SponsoredPostsWidget;