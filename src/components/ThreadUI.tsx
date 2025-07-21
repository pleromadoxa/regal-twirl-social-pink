import React, { useState } from 'react';
import { Heart, MessageCircle, Share, TrendingUp } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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
  console.log('ThreadUI: Component rendering');
  
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

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
      content: "Amen! 🙌 I'm grateful for His endless mercy and the beautiful sunrise this morning that reminded me of His faithfulness. Every day is a gift! #Blessed",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      likes: 8,
      replies: 1,
      isLiked: false,
      level: 1
    }
  ];

  const toggleThreadExpansion = (messageId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedThreads(newExpanded);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours}h`;
    }
  };

  const renderMessage = (message: ThreadMessage, isReply = false) => (
    <div className={`p-4 ${isReply ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'} rounded-lg border border-slate-200 dark:border-slate-700 ${isReply ? 'ml-4' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={message.author.avatar} />
          <AvatarFallback>{message.author.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {message.author.name}
            </span>
            {message.author.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              @{message.author.username}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">·</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              {formatTimeAgo(message.timestamp)}
            </span>
          </div>
          
          <div className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          <div className="flex items-center space-x-6 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-1"
              onClick={() => onReply?.(message.id)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">{message.replies}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 ${message.isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-slate-500 hover:text-red-500'
              } hover:bg-red-50 dark:hover:bg-red-900/20`}
              onClick={() => onLike?.(message.id)}
            >
              <Heart className={`w-4 h-4 mr-1 ${message.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{message.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1"
              onClick={() => onShare?.(message.id)}
            >
              <Share className="w-4 h-4" />
            </Button>

            {message.replies > 0 && !isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm p-1"
                onClick={() => toggleThreadExpansion(message.id)}
              >
                {expandedThreads.has(message.id) ? 'Hide replies' : 'Show replies'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  console.log('ThreadUI: About to render component');
  
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