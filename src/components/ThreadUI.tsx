
import { useState, useEffect, useCallback } from 'react';
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
  onReply?: (messageId: string) => void;
  onLike?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
}

const ThreadUI = ({ onReply, onLike, onShare }: ThreadUIProps) => {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize component only once to prevent re-renders
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Static thread data - never changes
  const staticThreadMessages: ThreadMessage[] = [
    {
      id: "1",
      author: {
        name: "Pastor Pleroma Emmanuel",
        username: "pleromadoxa",
        avatar: "/placeholder.svg",
        verified: true
      },
      content: "🙏 **Daily Reflection** 📖\n\nEven in our darkest moments, God's light shines through. Remember that every challenge is an opportunity for growth and every setback is a setup for a comeback! ✨\n\nWhat's one thing you're grateful for today? Share your blessings below! 💕\n\n#Faith #Gratitude #BlessedLife #DailyReflection",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 24,
      replies: 5,
      isLiked: false,
      level: 0
    },
    {
      id: "2",
      author: {
        name: "Sarah Grace",
        username: "sarahgrace",
        avatar: "/placeholder.svg",
        verified: false
      },
      content: "Thank you for this beautiful reminder! I'm grateful for my family's health and the opportunity to serve others in my community. God is good! 🙏✨",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      likes: 12,
      replies: 2,
      isLiked: true,
      level: 1
    },
    {
      id: "3",
      author: {
        name: "David Faithful",
        username: "davidfaithful",
        avatar: "/placeholder.svg",
        verified: false
      },
      content: "Amen! I'm grateful for second chances and the grace that covers us daily. His mercies are new every morning! 🌅",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      likes: 8,
      replies: 1,
      isLiked: false,
      level: 1
    }
  ];

  const toggleThread = useCallback((messageId: string) => {
    setExpandedThreads(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(messageId)) {
        newExpanded.delete(messageId);
      } else {
        newExpanded.add(messageId);
      }
      return newExpanded;
    });
  }, []);

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

  const handleLike = useCallback((messageId: string) => {
    // Only handle the visual feedback, don't actually update the data
    onLike?.(messageId);
  }, [onLike]);

  const renderMessage = (message: ThreadMessage, isReply = false) => (
    <div 
      key={message.id} 
      className={`relative group transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg ${isReply ? 'ml-8 mt-3' : 'mb-4'} p-4`}
    >
      {/* Connection line for replies */}
      {isReply && (
        <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400/60 via-pink-400/40 to-transparent" />
      )}
      
      <div className="flex items-start space-x-3">
        {/* Avatar with glow */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-700 shadow-md">
            <AvatarImage src={message.author.avatar} alt={message.author.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
              {message.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {message.author.verified && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {message.author.name}
            </span>
            {message.author.verified && (
              <Badge className="h-4 px-2 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                ✓
              </Badge>
            )}
            <span className="text-sm text-slate-600 dark:text-slate-400">
              @{message.author.username}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-500">
              {formatTimeAgo(message.timestamp)}
            </span>
          </div>
          
          {/* Message content */}
          <div className="mb-3">
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 rounded-full hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200"
              onClick={() => onReply?.(message.id)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-xs">{message.replies || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 rounded-full transition-all duration-200 ${
                message.isLiked 
                  ? 'text-red-500 bg-red-500/10' 
                  : 'hover:bg-red-500/10 hover:text-red-500'
              }`}
              onClick={() => handleLike(message.id)}
            >
              <Heart className={`w-4 h-4 mr-1 ${message.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{message.likes || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 rounded-full hover:bg-green-500/10 hover:text-green-600 transition-all duration-200"
              onClick={() => onShare?.(message.id)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            
            {message.replies > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 rounded-full bg-purple-500/5 text-purple-600 hover:bg-purple-500/10 transition-all duration-200 ml-2"
                onClick={() => toggleThread(message.id)}
              >
                <Reply className="w-4 h-4 mr-1" />
                <span className="text-xs">
                  {expandedThreads.has(message.id) ? 'Hide' : 'Show'} replies
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Don't render until initialized to prevent layout shifts
  if (!isInitialized) {
    return null;
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-purple-200 dark:border-purple-800">
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
        <div className="space-y-2">
          {staticThreadMessages.map((message) => (
            <div key={message.id}>
              {renderMessage(message)}
              
              {/* Show replies if thread is expanded */}
              {expandedThreads.has(message.id) && (
                <div className="ml-8 space-y-2 mt-2 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                  {staticThreadMessages
                    .filter(m => m.level > message.level)
                    .slice(0, 3)
                    .map(reply => renderMessage(reply, true))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreadUI;
