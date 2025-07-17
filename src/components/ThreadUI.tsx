import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, Share2, MoreHorizontal, Reply, Sparkles, Users } from 'lucide-react';

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
  level: number; // 0 = main thread, 1+ = reply levels
}

interface ThreadUIProps {
  messages: ThreadMessage[];
  onReply?: (messageId: string) => void;
  onLike?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
}

const ThreadUI = ({ messages, onReply, onLike, onShare }: ThreadUIProps) => {
  console.log('ThreadUI rendered with messages:', messages);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  const toggleThread = (messageId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedThreads(newExpanded);
  };

  const getIndentLevel = (level: number) => {
    return level * 4; // Use numeric value for padding
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
      className={`relative group transition-all duration-300 hover:scale-[1.02] ${isReply ? 'ml-6' : ''}`}
      style={{ paddingLeft: `${getIndentLevel(message.level)}rem` }}
    >
      {/* Connection line for replies */}
      {isReply && (
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
      )}
      
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 mb-4">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
        
        <CardContent className="p-6 relative">
          <div className="flex items-start space-x-4">
            {/* Enhanced Avatar */}
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-primary/20 shadow-lg">
                <AvatarImage src={message.author.avatar} alt={message.author.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                  {message.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {message.author.verified && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Author info with enhanced styling */}
              <div className="flex items-center space-x-3 mb-3">
                <span className="font-bold text-foreground text-base bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {message.author.name}
                </span>
                {message.author.verified && (
                  <Badge className="h-5 px-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                    Verified
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  @{message.author.username}
                </span>
                <span className="text-xs text-muted-foreground/70 px-2 py-1 bg-muted/50 rounded-full">
                  {formatTimeAgo(message.timestamp)}
                </span>
              </div>
              
              {/* Message content with enhanced typography */}
              <div className="mb-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">
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
                  className="h-8 px-3 rounded-full hover:bg-muted transition-all duration-200 group/btn"
                >
                  <MoreHorizontal className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                </Button>
                
                {message.replies > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-all duration-200 group/btn ml-4"
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

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-primary/60" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-foreground">Start the Conversation</h3>
          <p className="text-muted-foreground max-w-md">
            No messages in this thread yet. Be the first to share your thoughts and spark an engaging discussion!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-6 min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Enhanced Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center space-x-3 p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl border border-border/50 backdrop-blur-sm">
          <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Thread Discussion
          </h2>
          <div className="w-2 h-2 bg-gradient-to-r from-secondary to-primary rounded-full animate-pulse" />
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
      
      {/* Messages */}
      <div className="space-y-2">
        {messages.map((message) => (
          <div key={message.id}>
            {renderMessage(message)}
            
            {/* Show replies if thread is expanded */}
            {expandedThreads.has(message.id) && (
              <div className="relative ml-8 space-y-2 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-primary/40 before:to-transparent">
                {messages
                  .filter(m => m.level > message.level)
                  .slice(0, 5) // Show more replies
                  .map(reply => renderMessage(reply, true))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreadUI;