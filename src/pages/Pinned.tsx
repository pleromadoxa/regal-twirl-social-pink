
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePinnedPosts } from '@/hooks/usePinnedPosts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bookmark, 
  Pin, 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import UserLink from '@/components/UserLink';

const Pinned = () => {
  const { user } = useAuth();
  const { pinnedPosts, loading, unpinPost } = usePinnedPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <Bookmark className="w-6 h-6" />
              Pinned Posts
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Your saved posts for later reading
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : pinnedPosts.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                  No pinned posts yet
                </h3>
                <p className="text-slate-500 dark:text-slate-500">
                  Pin posts you want to save for later by clicking the bookmark icon.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pinnedPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <UserLink
                          userId={post.user_id}
                          username={post.profiles?.username}
                          displayName={post.profiles?.display_name}
                          avatarUrl={post.profiles?.avatar_url}
                          showAvatar={true}
                          className="w-10 h-10"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <UserLink
                              userId={post.user_id}
                              username={post.profiles?.username}
                              displayName={post.profiles?.display_name}
                              className="font-medium hover:underline"
                            />
                            <span className="text-slate-500">·</span>
                            <span className="text-sm text-slate-500">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              <Pin className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          </div>
                          
                          <p className="text-slate-800 dark:text-slate-200 mb-3">
                            {post.content}
                          </p>
                          
                          {post.image_urls && post.image_urls.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-3 rounded-lg overflow-hidden">
                              {post.image_urls.slice(0, 4).map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt=""
                                  className="w-full h-32 object-cover"
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span className="text-sm">{post.likes_count || 0}</span>
                              </button>
                              
                              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">{post.replies_count || 0}</span>
                              </button>
                              
                              <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors">
                                <Repeat2 className="w-4 h-4" />
                                <span className="text-sm">{post.retweets_count || 0}</span>
                              </button>
                              
                              <button className="text-slate-500 hover:text-purple-500 transition-colors">
                                <Share className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unpinPost(post.id)}
                              className="text-slate-500 hover:text-red-500"
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                              Unpin
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Pinned;
