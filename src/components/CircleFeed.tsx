import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { useCirclePosts } from '@/hooks/useCirclePosts';
import { formatDistanceToNow } from 'date-fns';

interface CircleFeedProps {
  circleId: string;
  circleName: string;
}

const CircleFeed = ({ circleId, circleName }: CircleFeedProps) => {
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { posts, loading, createPost, likePost } = useCirclePosts(circleId);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    setIsPosting(true);
    await createPost(newPost);
    setNewPost('');
    setIsPosting(false);
  };

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Share with {circleName}</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.trim() || isPosting}
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to share something with this circle!
            </p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback>
                    {post.profiles?.display_name?.[0] || post.profiles?.username?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {post.profiles?.display_name || post.profiles?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap">{post.content}</p>
              
              {/* Actions */}
              <div className="flex items-center space-x-4 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likePost(post.id)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {post.likes_count}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.comments_count}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default CircleFeed;
