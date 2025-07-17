import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, Share2, MoreHorizontal, Reply } from 'lucide-react';

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
    return `ml-${Math.min(level * 8, 32)}`;
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

  const renderMessage = (message: ThreadMessage) => (
    <div key={message.id} className={`${getIndentLevel(message.level)} mb-4`}>
      <Card className="border-l-4 border-l-primary/20 hover:border-l-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={message.author.avatar} alt={message.author.name} />
              <AvatarFallback>{message.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold text-sm">{message.author.name}</span>
                {message.author.verified && (
                  <Badge variant="secondary" className="h-4 px-1 text-xs">
                    ✓
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  @{message.author.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(message.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-foreground mb-3 leading-relaxed">
                {message.content}
              </p>
              
              <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 hover:text-blue-600"
                  onClick={() => onReply?.(message.id)}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {message.replies > 0 && <span>{message.replies}</span>}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 hover:text-red-600 ${
                    message.isLiked ? 'text-red-600' : ''
                  }`}
                  onClick={() => onLike?.(message.id)}
                >
                  <Heart className={`w-3 h-3 mr-1 ${message.isLiked ? 'fill-current' : ''}`} />
                  {message.likes > 0 && <span>{message.likes}</span>}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 hover:text-green-600"
                  onClick={() => onShare?.(message.id)}
                >
                  <Share2 className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
                
                {message.replies > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-primary hover:text-primary/80"
                    onClick={() => toggleThread(message.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    {expandedThreads.has(message.id) ? 'Hide' : 'Show'} thread
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-1 bg-background p-4 rounded-lg border">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2 text-foreground">Thread Discussion</h2>
        <div className="w-full h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
      </div>
      
      {messages.map((message) => (
        <div key={message.id}>
          {renderMessage(message)}
          
          {/* Show replies if thread is expanded */}
          {expandedThreads.has(message.id) && (
            <div className="ml-8 border-l-2 border-muted pl-4">
              {messages
                .filter(m => m.level > message.level)
                .slice(0, 3) // Show limited replies
                .map(reply => renderMessage(reply))}
            </div>
          )}
        </div>
      ))}
      
      {messages.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages in this thread yet.</p>
            <p className="text-sm mt-2">Be the first to start the conversation!</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ThreadUI;