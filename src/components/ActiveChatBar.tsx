
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageDock, Character } from '@/components/ui/message-dock';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStreakEmoji } from '@/services/streakService';
import PresenceIndicator from './PresenceIndicator';
import { useUserPresence } from '@/contexts/UserPresenceContext';
import { formatDistanceToNow } from 'date-fns';

interface ConversationCharacter extends Character {
  userId?: string;
  username?: string;
  displayName?: string;
  streakCount?: number;
  avatar?: string;
}

interface ActiveChatBarProps {
  messagesData: ReturnType<typeof useEnhancedMessages>;
}

export const ActiveChatBar = ({ messagesData }: ActiveChatBarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getUserStatus, formatLastSeen } = useUserPresence();
  
  // messagesData is required - no fallback to prevent multiple subscriptions
  if (!messagesData) {
    console.error('ActiveChatBar: messagesData prop is required');
    return null;
  }
  
  const { 
    conversations, 
    startDirectConversation, 
    sendMessage, 
    setSelectedConversation,
    selectedConversation,
    messages 
  } = messagesData;
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCharacterId, setExpandedCharacterId] = useState<string | null>(null);
  const [characters, setCharacters] = useState<ConversationCharacter[]>([
    { emoji: "💬", name: "Messages", online: false },
    { emoji: "👤", name: "Recent", online: true, backgroundColor: "bg-blue-300", gradientColors: "#93c5fd, #dbeafe" },
    { emoji: "🔔", name: "Active", online: true, backgroundColor: "bg-green-300", gradientColors: "#86efac, #dcfce7" },
    { emoji: "⭐", name: "Favorites", online: false, backgroundColor: "bg-yellow-300", gradientColors: "#fde047, #fefce8" },
    { emoji: "📋", name: "Menu", online: false },
  ]);

  // Calculate total unread messages
  const unreadCount = messages.filter(msg => 
    !msg.read_at && msg.recipient_id === user?.id
  ).length;

  // Update characters based on recent conversations
  useEffect(() => {
    if (conversations.length > 0 && user) {
      const recentConversations = conversations.slice(0, 3);
      const updatedCharacters: ConversationCharacter[] = [
        { emoji: "💬", name: "Messages", online: false },
        ...recentConversations.map((conv, index) => {
          // Determine the other user from conversation participants
          const otherUser = conv.participant_1 === user.id 
            ? conv.participant_2_profile 
            : conv.participant_1_profile;
          
          const { isOnline } = getUserStatus(otherUser?.id || '');
          
          return {
            id: conv.id,
            emoji: otherUser?.avatar_url ? "👤" : ["👤", "🌟", "💼"][index] || "👤",
            name: `${otherUser?.display_name || otherUser?.username || "User"}${conv.streak_count && conv.streak_count > 0 ? ` ${getStreakEmoji(conv.streak_count)}${conv.streak_count}` : ''}`,
            online: isOnline,
            backgroundColor: ["bg-blue-300", "bg-purple-300", "bg-pink-300"][index] || "bg-gray-300",
            gradientColors: ["#93c5fd, #dbeafe", "#c084fc, #f3e8ff", "#f9a8d4, #fce7f3"][index] || "#d1d5db, #f3f4f6",
            avatar: otherUser?.avatar_url,
            username: otherUser?.username,
            displayName: otherUser?.display_name,
            streakCount: conv.streak_count,
            userId: otherUser?.id
          };
        }),
        { emoji: "📋", name: "Menu", online: false },
      ];
      setCharacters(updatedCharacters);
    }
  }, [conversations, getUserStatus, user]);

  const handleMessageSend = async (message: string, character: ConversationCharacter, characterIndex: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    try {
      // If it's a conversation character (has ID and userId), send message directly
      if (character.id && character.userId) {
        console.log('Sending message to user:', character.userId, 'in conversation:', character.id);
        
        // Select the conversation first
        setSelectedConversation(character.id as string);
        
        // Wait for state update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Send the message
        await sendMessage(message);
        
        toast({
          title: "Message sent! ✓",
          description: `Sent to ${character.displayName || character.username || character.name}`,
        });
        
        return;
      }
      
      // Handle special actions based on character name
      switch (character.name) {
        case "Messages":
          navigate('/messages');
          toast({
            title: "Opening Messages",
            description: "Redirecting to messages page...",
          });
          break;
        case "Recent":
          if (conversations.length > 0) {
            setSelectedConversation(conversations[0].id);
            navigate('/messages');
          } else {
            toast({
              title: "No recent conversations",
              description: "Start a new conversation to get started",
            });
          }
          break;
        case "Active":
          // Find most recent active conversation
          const activeConv = conversations.find(conv => conv.last_message_at);
          if (activeConv) {
            setSelectedConversation(activeConv.id);
            navigate('/messages');
          } else {
            toast({
              title: "No active conversations",
              description: "Start chatting to see active conversations",
            });
          }
          break;
        case "Menu":
          // Show menu options for messages page
          toast({
            title: "Messages Menu",
            description: "Opening menu options...",
          });
          navigate('/messages');
          break;
        default:
          toast({
            title: "Feature coming soon",
            description: `${character.name} functionality will be available soon.`,
          });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleCharacterSelect = (character: ConversationCharacter, characterIndex: number) => {
    console.log('Character selected:', character.name);
    
    // If it's a conversation, select it and expand
    if (character.id) {
      setSelectedConversation(character.id as string);
      setExpandedCharacterId(character.id as string);
    } else {
      setExpandedCharacterId(null);
    }
  };

  const handleDockToggle = (isExpanded: boolean) => {
    console.log('Chat bar expanded:', isExpanded);
  };

  // Don't show on auth or landing pages
  const currentPath = window.location.pathname;
  if (currentPath === '/auth' || currentPath === '/') {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={`fixed z-50 transition-all duration-300 ${
        isCollapsed 
          ? 'bottom-6 right-6' 
          : 'bottom-6 left-1/2 transform -translate-x-1/2'
      }`}>
        {/* Toggle Button */}
        <AnimatePresence>
          {isCollapsed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsCollapsed(false)}
                    className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Open Chat</p>
                </TooltipContent>
              </Tooltip>
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-red-500 text-white rounded-full animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Dock */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative z-30"
            >
              {/* Action Buttons */}
              <div className="absolute -top-2 -right-2 z-40 flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsCollapsed(true)}
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-8 h-8 bg-white/90 hover:bg-white shadow-md"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Minimize Chat</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        setIsCollapsed(true);
                        setExpandedCharacterId(null);
                      }}
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-8 h-8 bg-white/90 hover:bg-white shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Close Chat</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Enhanced MessageDock with Presence and Messages */}
              <div className="relative">
                {/* Recent Messages Display */}
                {expandedCharacterId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 right-0 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border overflow-hidden"
                    style={{ maxWidth: '400px' }}
                  >
                    <div className="p-3 border-b border-border flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Recent Messages</h4>
                      <Badge variant="secondary" className="text-xs">
                        {messages.length}
                      </Badge>
                    </div>
                    <ScrollArea className="h-48">
                      <div className="p-2 space-y-2">
                        {messages.length > 0 ? (
                          messages.slice(-5).reverse().map((msg) => (
                            <div 
                              key={msg.id} 
                              className={`p-2 rounded-lg text-sm ${
                                msg.sender_id === user?.id 
                                  ? 'bg-primary/10 ml-8' 
                                  : 'bg-muted mr-8'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={msg.sender_profile?.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {msg.sender_profile?.display_name?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground font-medium">
                                    {msg.sender_id === user?.id ? 'You' : msg.sender_profile?.display_name}
                                  </p>
                                  <p className="text-xs break-words">{msg.content}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            No messages yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
                
                <MessageDock
                  characters={characters.map(char => ({
                    ...char,
                    // Add hover card content for conversations
                    hoverContent: char.userId ? (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="cursor-pointer">
                            {char.avatar ? (
                              <img src={char.avatar} alt={char.displayName || char.name} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className={`w-8 h-8 rounded-full ${char.backgroundColor} flex items-center justify-center text-white font-semibold`}>
                                {char.emoji}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1">
                              <PresenceIndicator userId={char.userId} />
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Avatar>
                              <AvatarImage src={char.avatar} />
                              <AvatarFallback>{char.displayName?.[0] || char.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 flex-1">
                              <h4 className="text-sm font-semibold">{char.displayName || char.name}</h4>
                              <p className="text-sm text-slate-500">@{char.username}</p>
                              <div className="flex items-center pt-2">
                                <PresenceIndicator userId={char.userId} showText />
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ) : undefined
                  }))}
                  onMessageSend={handleMessageSend}
                  onCharacterSelect={handleCharacterSelect}
                  onDockToggle={handleDockToggle}
                  expandedWidth={400}
                  position="bottom"
                  placeholder={(name) => `Send a message to ${name}...`}
                  theme="light"
                  enableAnimations={true}
                  closeOnSend={false}
                  autoFocus={true}
                  className="static transform-none translate-x-0 z-30"
                  showTooltips={true}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default ActiveChatBar;
