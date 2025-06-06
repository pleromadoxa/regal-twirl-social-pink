
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Pin, Trash2, Flag, Bookmark, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  user_id: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    premium_tier: string | null;
  };
}

interface PostsListProps {
  posts: Post[];
  onLike: (postId: string) => void;
  onRetweet: (postId: string) => void;
  onPin?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const PostsList = ({ posts, onLike, onRetweet, onPin, onDelete }: PostsListProps) => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [retweetedPosts, setRetweetedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
    onLike(postId);
  };

  const handleRetweet = (postId: string) => {
    const newRetweetedPosts = new Set(retweetedPosts);
    if (retweetedPosts.has(postId)) {
      newRetweetedPosts.delete(postId);
    } else {
      newRetweetedPosts.add(postId);
    }
    setRetweetedPosts(newRetweetedPosts);
    onRetweet(postId);
  };

  const getEngagementLevel = (likes: number, retweets: number, replies: number) => {
    const total = likes + retweets + replies;
    if (total >= 50) return 'viral';
    if (total >= 20) return 'trending';
    if (total >= 5) return 'active';
    return 'normal';
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-12 h-12 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No posts yet</h3>
        <p className="text-slate-500 dark:text-slate-400">Be the first to share something amazing!</p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {posts.map((post, index) => {
        const isLiked = likedPosts.has(post.id);
        const isRetweeted = retweetedPosts.has(post.id);
        const engagementLevel = getEngagementLevel(post.likes_count, post.retweets_count, post.replies_count);
        
        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative"
          >
            <Card className={`border-0 border-b border-purple-200 dark:border-purple-800 rounded-none hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all duration-300 group ${
              engagementLevel === 'viral' ? 'bg-gradient-to-r from-amber-50/30 to-orange-50/30 dark:from-amber-900/10 dark:to-orange-900/10' :
              engagementLevel === 'trending' ? 'bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10' : ''
            }`}>
              
              {/* Engagement indicator */}
              {engagementLevel !== 'normal' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <Badge className={`${
                    engagementLevel === 'viral' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                    engagementLevel === 'trending' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                    'bg-gradient-to-r from-green-500 to-emerald-500'
                  } text-white border-0 shadow-lg`}>
                    {engagementLevel === 'viral' ? <Zap className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                    {engagementLevel.charAt(0).toUpperCase() + engagementLevel.slice(1)}
                  </Badge>
                </motion.div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar className="w-12 h-12 ring-2 ring-purple-200 dark:ring-purple-700 transition-all duration-300 group-hover:ring-purple-400">
                        <AvatarImage 
                          src={post.profiles?.avatar_url || "/placeholder.svg"} 
                          alt={post.profiles?.display_name || post.profiles?.username || 'User'} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold">
                          {(post.profiles?.display_name || post.profiles?.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                          {post.profiles?.display_name || post.profiles?.username || 'Anonymous User'}
                        </h3>
                        {post.profiles?.is_verified && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5">
                              ✓
                            </Badge>
                          </motion.div>
                        )}
                        {post.profiles?.premium_tier && post.profiles.premium_tier !== 'free' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                          >
                            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-1.5 py-0.5">
                              ♛
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                      {post.profiles?.username && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">@{post.profiles.username}</p>
                      )}
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {format(new Date(post.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                        <Bookmark className="w-4 h-4 mr-2" />
                        Save Post
                      </DropdownMenuItem>
                      {onPin && (
                        <DropdownMenuItem onClick={() => onPin(post.id)} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                          <Pin className="w-4 h-4 mr-2" />
                          Pin Post
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(post.id)} 
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content */}
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-slate-900 dark:text-slate-100 text-lg leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </motion.div>

                {/* Engagement Actions */}
                <motion.div 
                  className="flex items-center justify-between pt-4 border-t border-purple-100 dark:border-purple-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-6">
                    {/* Like Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 ${
                        isLiked 
                          ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      <Heart className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{post.likes_count}</span>
                    </motion.button>

                    {/* Reply Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-full text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.replies_count}</span>
                    </motion.button>

                    {/* Retweet Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRetweet(post.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 ${
                        isRetweeted 
                          ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'text-slate-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      <Repeat2 className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.retweets_count}</span>
                    </motion.button>

                    {/* Share Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-full text-slate-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
                    >
                      <Share className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Engagement summary for high-engagement posts */}
                  {(post.likes_count + post.retweets_count + post.replies_count) > 10 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs text-slate-500 dark:text-slate-400"
                    >
                      {post.likes_count + post.retweets_count + post.replies_count} interactions
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};

export default PostsList;
