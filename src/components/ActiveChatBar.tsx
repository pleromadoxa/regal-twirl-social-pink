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
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStreakEmoji } from '@/services/streakService';
import PresenceIndicator from './PresenceIndicator';
import { useUserPresence } from '@/hooks/useUserPresence';

const ActiveChatBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getUserStatus, formatLastSeen } = useUserPresence();
  const { 
    conversations, 
    startDirectConversation, 
    sendMessage, 
    setSelectedConversation,
    messages 
  } = useEnhancedMessages();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([
    { emoji: "💬", name: "Messages", online: false },
    { emoji: "👤", name: "Recent", online: true, backgroundColor: "bg-blue-300", gradientColors: "#93c5fd, #dbeafe" },
    { emoji: "🔔", name: "Active", online: true, backgroundColor: "bg-green-300", gradientColors: "#86efac, #dcfce7" },
    { emoji: "⭐", name: "Favorites", online: false, backgroundColor: "bg-yellow-300", gradientColors: "#fde047, #fefce8" },
    { emoji: "📋", name: "Menu", online: false },
  ]);

  // Update characters based on recent conversations
  useEffect(() => {
    if (conversations.length > 0) {
      const recentConversations = conversations.slice(0, 3);
      const updatedCharacters = [
        { emoji: "💬", name: "Messages", online: false },
        ...recentConversations.map((conv, index) => {
          const { isOnline } = getUserStatus(conv.other_user?.id || '');
          return {
            id: conv.id,
            emoji: conv.other_user?.avatar_url ? "👤" : ["👤", "🌟", "💼"][index] || "👤",
            name: `${conv.other_user?.display_name || conv.other_user?.username || "User"}${conv.streak_count > 0 ? ` ${getStreakEmoji(conv.streak_count)}${conv.streak_count}` : ''}`,
            online: isOnline,
            backgroundColor: ["bg-blue-300", "bg-purple-300", "bg-pink-300"][index] || "bg-gray-300",
            gradientColors: ["#93c5fd, #dbeafe", "#c084fc, #f3e8ff", "#f9a8d4, #fce7f3"][index] || "#d1d5db, #f3f4f6",
            avatar: conv.other_user?.avatar_url,
            username: conv.other_user?.username,
            displayName: conv.other_user?.display_name,
            streakCount: conv.streak_count,
            userId: conv.other_user?.id
          };
        }),
        { emoji: "📋", name: "Menu", online: false },
      ];
      setCharacters(updatedCharacters);
    }
  }, [conversations, getUserStatus]);

  const handleMessageSend = async (message: string, character: Character, characterIndex: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    try {
      // If it's a conversation character (has ID), send message directly
      if (character.id) {
        const conversation = conversations.find(conv => conv.id === character.id);
        if (conversation?.other_user?.id) {
          await sendMessage(message);
          setSelectedConversation(character.id as string);
          toast({
            title: "Message sent",
            description: `Message sent to ${character.name}`,
          });
        }
      } else {
        // Handle special actions based on character name
        switch (character.name) {
          case "Messages":
            navigate('/messages');
            break;
          case "Recent":
            if (conversations.length > 0) {
              setSelectedConversation(conversations[0].id);
              navigate('/messages');
            }
            break;
          case "Active":
            // Find most recent active conversation
            const activeConv = conversations.find(conv => conv.last_message_at);
            if (activeConv) {
              setSelectedConversation(activeConv.id);
              navigate('/messages');
            }
            break;
          case "Menu":
            // Show menu options for messages page
            toast({
              title: "Messages Menu",
              description: "New group, Settings, Help & Support available",
            });
            break;
          default:
            toast({
              title: "Feature coming soon",
              description: `${character.name} functionality will be available soon.`,
            });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleCharacterSelect = (character: Character, characterIndex: number) => {
    console.log('Character selected:', character.name);
    
    // If it's a conversation, select it
    if (character.id) {
      setSelectedConversation(character.id as string);
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
      <div className="fixed bottom-6 right-6 z-30">
        {/* Toggle Button */}
        <AnimatePresence>
          {isCollapsed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
              {/* Close Button */}
              <div className="absolute -top-2 -right-2 z-40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsCollapsed(true)}
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

              {/* Enhanced MessageDock with Presence */}
              <div className="relative">
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
