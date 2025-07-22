import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal, Verified, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCommunityDiscussions, CommunityDiscussion } from "@/hooks/useCommunityDiscussions";
import CommunityDiscussionComposer from "@/components/CommunityDiscussionComposer";
import { useAuth } from "@/contexts/AuthContext";

interface ThreadUIProps {
  onReply?: (messageId: string) => void;
  onLike?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
}

const ThreadUI = ({ onReply, onLike, onShare }: ThreadUIProps) => {
  console.log('ThreadUI: Component rendering - START');
  
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const { discussions, loading, toggleLike } = useCommunityDiscussions();
  const { user } = useAuth();

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleLike = async (discussionId: string) => {
    await toggleLike(discussionId);
  };

  const handleReply = (discussionId: string) => {
    onReply?.(discussionId);
  };

  const handleShare = (discussionId: string) => {
    onShare?.(discussionId);
  };

  const renderDiscussion = (discussion: CommunityDiscussion) => {
    const displayName = discussion.profiles?.display_name || discussion.profiles?.username || 'Unknown User';
    const username = discussion.profiles?.username || 'unknown';
    const avatarUrl = discussion.profiles?.avatar_url;
    const isVerified = discussion.profiles?.is_verified || false;

    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 ring-2 ring-purple-200 dark:ring-purple-800">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {displayName}
              </h4>
              {isVerified && (
                <Verified className="w-4 h-4 text-blue-500 fill-current" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>@{username}</span>
              <span>•</span>
              <span>{formatTimeAgo(discussion.created_at)}</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {discussion.content}
          </p>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReply(discussion.id)}
            className="text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">{discussion.replies_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLike(discussion.id)}
            className={`text-slate-500 hover:text-pink-600 dark:text-slate-400 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/30 ${
              discussion.is_liked ? 'text-pink-600 dark:text-pink-400' : ''
            }`}
          >
            <Heart className={`w-4 h-4 mr-1 ${discussion.is_liked ? 'fill-current' : ''}`} />
            <span className="text-sm">{discussion.likes_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare(discussion.id)}
            className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  console.log('ThreadUI: About to render component - END');
  console.log('ThreadUI: Current expandedThreads:', expandedThreads);
  
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-purple-200 dark:border-purple-800"
         style={{ minHeight: '400px' }}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center space-x-3">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Community Discussions
          </h2>
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Discussion Composer */}
        {user && <CommunityDiscussionComposer />}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading discussions...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V6a2 2 0 012-2h2m2 4h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
              No discussions yet
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              Be the first to start a community discussion!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div key={discussion.id}>
                {renderDiscussion(discussion)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadUI;