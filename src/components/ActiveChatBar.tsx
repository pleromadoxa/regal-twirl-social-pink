
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageDock, Character } from '@/components/ui/message-dock';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const ActiveChatBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    conversations, 
    startDirectConversation, 
    sendMessage, 
    setSelectedConversation,
    messages 
  } = useEnhancedMessages();
  
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
        ...recentConversations.map((conv, index) => ({
          id: conv.id,
          emoji: conv.other_user?.avatar_url ? "👤" : ["👤", "🌟", "💼"][index] || "👤",
          name: conv.other_user?.display_name || conv.other_user?.username || "User",
          online: true,
          backgroundColor: ["bg-blue-300", "bg-purple-300", "bg-pink-300"][index] || "bg-gray-300",
          gradientColors: ["#93c5fd, #dbeafe", "#c084fc, #f3e8ff", "#f9a8d4, #fce7f3"][index] || "#d1d5db, #f3f4f6",
          avatar: conv.other_user?.avatar_url,
          username: conv.other_user?.username,
          displayName: conv.other_user?.display_name
        })),
        { emoji: "📋", name: "Menu", online: false },
      ];
      setCharacters(updatedCharacters);
    }
  }, [conversations]);

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
  if (currentPath === '/auth' || currentPath === '/landing') {
    return null;
  }

  return (
    <TooltipProvider>
      <MessageDock 
        characters={characters}
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
        className="fixed bottom-6 right-6 left-auto -translate-x-0"
        showTooltips={true}
      />
    </TooltipProvider>
  );
};

export default ActiveChatBar;
