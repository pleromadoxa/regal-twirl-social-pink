
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, TrendingUp, DollarSign, Eye, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface BusinessBoostManagerProps {
  businessPage: any;
}

const BusinessBoostManager = ({ businessPage }: BusinessBoostManagerProps) => {
  const [sponsoredPosts, setSponsoredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSponsoredPosts();
  }, [businessPage?.id]);

  const fetchSponsoredPosts = async () => {
    if (!businessPage?.id) return;

    try {
      const { data, error } = await supabase
        .from('sponsored_posts')
        .select(`
          *,
          posts (
            id,
            content,
            created_at,
            image_urls
          )
        `)
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsoredPosts(data || []);
    } catch (error) {
      console.error('Error fetching sponsored posts:', error);
      toast({
        title: "Error",
        description: "Failed to load boosted posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const pauseBoost = async (sponsoredPostId: string) => {
    try {
      const { error } = await supabase
        .from('sponsored_posts')
        .update({ status: 'paused' })
        .eq('id', sponsoredPostId);

      if (error) throw error;

      toast({
        title: "Boost Paused",
        description: "Your post boost has been paused."
      });

      fetchSponsoredPosts();
    } catch (error) {
      console.error('Error pausing boost:', error);
      toast({
        title: "Error",
        description: "Failed to pause boost",
        variant: "destructive"
      });
    }
  };

  const resumeBoost = async (sponsoredPostId: string) => {
    try {
      const { error } = await supabase
        .from('sponsored_posts')
        .update({ status: 'active' })
        .eq('id', sponsoredPostId);

      if (error) throw error;

      toast({
        title: "Boost Resumed",
        description: "Your post boost has been resumed."
      });

      fetchSponsoredPosts();
    } catch (error) {
      console.error('Error resuming boost:', error);
      toast({
        title: "Error",
        description: "Failed to resume boost",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Boosted Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Boosted Posts ({sponsoredPosts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sponsoredPosts.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Boosted Posts</h3>
            <p className="text-gray-500">Start boosting your posts to reach more people!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sponsoredPosts.map((sponsoredPost) => (
              <div key={sponsoredPost.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getStatusColor(sponsoredPost.status)} text-white`}>
                        {sponsoredPost.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(sponsoredPost.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {sponsoredPost.posts?.content || 'Post content unavailable'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold">{sponsoredPost.impressions || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">Impressions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">{sponsoredPost.clicks || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">Clicks</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">${sponsoredPost.spent_amount || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">Spent</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">{sponsoredPost.duration_days}d</span>
                    </div>
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {sponsoredPost.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pauseBoost(sponsoredPost.id)}
                    >
                      Pause
                    </Button>
                  ) : sponsoredPost.status === 'paused' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resumeBoost(sponsoredPost.id)}
                    >
                      Resume
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessBoostManager;
