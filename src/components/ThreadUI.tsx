
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, Share2, MoreHorizontal, Reply, Sparkles, Users, TrendingUp } from 'lucide-react';

interface ThreadMessage {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: Date;
  likes: number;
  replies: number;
  isLiked: boolean;
  level: number;
}

interface ThreadUIProps {
  messages?: ThreadMessage[];
  onReply?: (messageId: string) => void;
  onLike?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
}

const ThreadUI = ({ messages = [], onReply, onLike, onShare }: ThreadUIProps) => {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(true);

  // Ensure the component stays visible
  useEffect(() => {
    setIsVisible(true);
  }, []);

  console.log('ThreadUI rendered with messages:', messages);

  const toggleThread = (messageId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedThreads(newExpanded);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const renderMessage = (message: ThreadMessage, isReply = false) => (
    <div 
      key={message.id} 
      className={`relative group transition-all duration-300 hover:transform hover:scale-[1.01] ${isReply ? 'ml-8 mt-4' : 'mb-6'}`}
    >
      {/* Connection line for replies */}
      {isReply && (
        <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400/60 via-pink-400/40 to-transparent" />
      )}
      
      <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 to-purple-50/30 dark:from-slate-800/95 dark:to-purple-900/20 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Top accent border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start space-x-4">
            {/* Enhanced Avatar with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse" />
              <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-700 shadow-lg relative z-10">
                <AvatarImage src={message.author.avatar} alt={message.author.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                  {message.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {message.author.verified && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Author info with enhanced styling */}
              <div className="flex items-center space-x-3 mb-3">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {message.author.name}
                </span>
                {message.author.verified && (
                  <Badge className="h-5 px-2 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-sm">
                    Verified
                  </Badge>
                )}
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  @{message.author.username}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                  {formatTimeAgo(message.timestamp)}
                </span>
              </div>
              
              {/* Message content with enhanced styling */}
              <div className="mb-4 p-4 bg-gradient-to-br from-slate-50/80 to-purple-50/50 dark:from-slate-700/50 dark:to-purple-900/20 rounded-xl border border-slate-200/50 dark:border-slate-600/30">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              
              {/* Enhanced action buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-full hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200 group/btn"
                  onClick={() => onReply?.(message.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-xs font-medium">{message.replies || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-3 rounded-full transition-all duration-200 group/btn ${
                    message.isLiked 
                      ? 'text-red-500 bg-red-500/10' 
                      : 'hover:bg-red-500/10 hover:text-red-500'
                  }`}
                  onClick={() => onLike?.(message.id)}
                >
                  <Heart className={`w-4 h-4 mr-1.5 group-hover/btn:scale-110 transition-transform ${
                    message.isLiked ? 'fill-current' : ''
                  }`} />
                  <span className="text-xs font-medium">{message.likes || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-full hover:bg-green-500/10 hover:text-green-600 transition-all duration-200 group/btn"
                  onClick={() => onShare?.(message.id)}
                >
                  <Share2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group/btn"
                >
                  <MoreHorizontal className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                </Button>
                
                {message.replies > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-full bg-purple-500/5 text-purple-600 hover:bg-purple-500/10 transition-all duration-200 group/btn ml-4"
                    onClick={() => toggleThread(message.id)}
                  >
                    <Reply className="w-4 h-4 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs font-medium">
                      {expandedThreads.has(message.id) ? 'Hide' : 'Show'} replies
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="min-h-[400px] p-6 bg-gradient-to-br from-purple-50/30 via-white to-pink-50/20 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-purple-900/20">
      {/* Enhanced Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 backdrop-blur-sm">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Community Discussions
          </h2>
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </div>
      
      {!messages || messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-purple-500/60" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Join the Conversation</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              Share your thoughts, connect with others, and be part of meaningful discussions in our community!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {renderMessage(message)}
              
              {/* Show replies if thread is expanded */}
              {expandedThreads.has(message.id) && (
                <div className="relative ml-8 space-y-4 mt-4">
                  {messages
                    .filter(m => m.level > message.level)
                    .slice(0, 5)
                    .map(reply => renderMessage(reply, true))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadUI;
