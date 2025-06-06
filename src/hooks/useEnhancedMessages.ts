import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface EnhancedConversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  last_message?: EnhancedMessage;
  streak_count?: number;
}

export const useEnhancedMessages = () => {
  const [conversations, setConversations] = useState<EnhancedConversation[]>([]);
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use refs to track channel subscription status
  const messagesChannelRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isSubscribedRef = useRef<boolean>(false);

  // Clear cache function
  const clearCache = () => {
    console.log('Clearing message cache...');
    setMessages([]);
    setConversations([]);
    setTypingUsers({});
  };

  const calculateStreak = (messages: EnhancedMessage[]) => {
    if (!messages || messages.length === 0) return 0;
    
    // Sort messages by date descending
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Check consecutive days with messages
    for (let i = 0; i < sortedMessages.length; i++) {
      const messageDate = new Date(sortedMessages[i].created_at);
      messageDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  };

  const fetchConversations = async (forceRefresh = false) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Clear cache if force refresh
      if (forceRefresh) {
        clearCache();
      }

      console.log('Fetching conversations for user:', user.id);

      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      console.log('Raw conversations data:', conversationsData);

      // Get enriched conversations with participant info, last message, and streaks
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Get all messages for streak calculation
          const { data: allMessages } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${conv.participant_1},recipient_id.eq.${conv.participant_2}),and(sender_id.eq.${conv.participant_2},recipient_id.eq.${conv.participant_1})`)
            .order('created_at', { ascending: false });

          // Get last message with sender profile
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${conv.participant_1},recipient_id.eq.${conv.participant_2}),and(sender_id.eq.${conv.participant_2},recipient_id.eq.${conv.participant_1})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          let lastMessageWithProfile = undefined;
          if (lastMessageData) {
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', lastMessageData.sender_id)
              .single();

            lastMessageWithProfile = {
              ...lastMessageData,
              sender_profile: senderProfile
            };
          }

          const streakCount = calculateStreak(allMessages || []);

          return {
            ...conv,
            other_user: profileData,
            last_message: lastMessageWithProfile,
            streak_count: streakCount
          };
        })
      );

      console.log('Enriched conversations:', enrichedConversations);
      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, forceRefresh = false) => {
    if (!user) return;

    try {
      console.log('Fetching messages for conversation:', conversationId);

      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return;
      }

      console.log('Found conversation:', conversation);

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${conversation.participant_1},recipient_id.eq.${conversation.participant_2}),and(sender_id.eq.${conversation.participant_2},recipient_id.eq.${conversation.participant_1})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      console.log('Raw messages data for conversation:', messagesData?.length || 0, 'messages');

      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('id', msg.sender_id)
            .single();

          return {
            ...msg,
            sender_profile: senderProfile
          };
        })
      );

      console.log('Messages with profiles loaded:', messagesWithProfiles.length);
      
      // Update messages state by replacing messages for this conversation
      setMessages(prevMessages => {
        // Remove old messages for this conversation
        const otherMessages = prevMessages.filter(msg => {
          const belongsToThisConv = (
            (msg.sender_id === conversation.participant_1 && msg.recipient_id === conversation.participant_2) ||
            (msg.sender_id === conversation.participant_2 && msg.recipient_id === conversation.participant_1)
          );
          return !belongsToThisConv;
        });
        
        // Add new messages
        return [...otherMessages, ...messagesWithProfiles];
      });
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string, attachments?: { images: File[], videos: File[], documents: File[] }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim() && (!attachments || (attachments.images.length === 0 && attachments.videos.length === 0 && attachments.documents.length === 0))) {
      toast({
        title: "Message cannot be empty",
        description: "Please enter a message or attach files before sending",
        variant: "destructive"
      });
      return;
    }

    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return;
      }

      const recipientId = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      console.log('Sending message:', { content, conversationId, recipientId });

      const { data: messageData, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Message sent successfully:', messageData);

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Get sender profile for the message
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const formattedMessage = {
        ...messageData,
        sender_profile: senderProfile
      };
      
      // Add message to local state immediately
      setMessages(prev => [...prev, formattedMessage]);

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });

      // Refresh conversations to update last message
      await fetchConversations();
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
    if (!user || !typingChannelRef.current) return;

    if (isTyping) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing indicator
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: user.id,
          conversation_id: conversationId,
          is_typing: true
        }
      });

      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        if (typingChannelRef.current) {
          typingChannelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: {
              user_id: user.id,
              conversation_id: conversationId,
              is_typing: false
            }
          });
        }
      }, 3000);
    } else {
      if (typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: user.id,
            conversation_id: conversationId,
            is_typing: false
          }
        });
      }
    }
  };

  const createGroupConversation = async (groupName: string, participantIds: string[]) => {
    if (!user) return;

    try {
      if (participantIds.length === 0) {
        toast({
          title: "Error creating group",
          description: "Please add at least one participant",
          variant: "destructive"
        });
        return;
      }

      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: participantIds[0]
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating group conversation:', error);
        toast({
          title: "Error creating group",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Conversation created",
        description: `Conversation started successfully.`
      });

      fetchConversations(true); // Force refresh
      return newConv.id;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating conversation",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const startDirectConversation = async (recipientId: string) => {
    if (!user) return;

    try {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`)
        .maybeSingle();

      if (existingConv) {
        setSelectedConversation(existingConv.id);
        return existingConv.id;
      }

      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: recipientId
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return;
      }

      fetchConversations(true); // Force refresh
      setSelectedConversation(newConv.id);
      return newConv.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const cleanupChannels = () => {
    console.log('Cleaning up channels...');
    
    if (messagesChannelRef.current) {
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
    }

    if (typingChannelRef.current) {
      supabase.removeChannel(typingChannelRef.current);
      typingChannelRef.current = null;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = undefined;
    }

    isSubscribedRef.current = false;
  };

  // Enhanced realtime subscriptions with better error handling and debugging
  useEffect(() => {
    if (!user) {
      cleanupChannels();
      return;
    }

    // Prevent multiple subscriptions
    if (isSubscribedRef.current) {
      return;
    }

    console.log('Setting up enhanced realtime subscriptions for user:', user.id);
    cleanupChannels();

    try {
      // Messages channel with proper filtering and enhanced debugging
      const messagesChannelName = `messages-${user.id}-${Date.now()}`;
      const messagesChannel = supabase.channel(messagesChannelName);
      
      messagesChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('New message received for current user:', payload);
            
            if (payload.new) {
              const newMessage = payload.new as any;
              
              // Get sender profile for toast
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('display_name, username, avatar_url')
                .eq('id', newMessage.sender_id)
                .single();
              
              const senderName = senderProfile?.display_name || senderProfile?.username || 'Someone';
              
              // Show toast notification
              toast({
                title: "New message",
                description: `${senderName}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`
              });

              // Add message with profile to local state
              const messageWithProfile = {
                ...newMessage,
                sender_profile: senderProfile
              };

              setMessages(prev => [...prev, messageWithProfile]);

              // Refresh conversations to update last message
              await fetchConversations();
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('Message sent by current user confirmed:', payload);
            // Refresh to update conversation list
            await fetchConversations();
          }
        );

      // Enhanced typing indicators channel
      const typingChannelName = `typing-indicators-${user.id}-${Date.now()}`;
      const typingChannel = supabase.channel(typingChannelName);
      
      typingChannel
        .on('broadcast', { event: 'typing' }, (payload) => {
          const { user_id, conversation_id, is_typing } = payload.payload;
          
          if (user_id !== user.id && conversation_id === selectedConversation) {
            setTypingUsers(prev => ({
              ...prev,
              [user_id]: is_typing
            }));

            // Auto-clear typing indicator after 5 seconds
            if (is_typing) {
              setTimeout(() => {
                setTypingUsers(prev => ({
                  ...prev,
                  [user_id]: false
                }));
              }, 5000);
            }
          }
        })
        .on('broadcast', { event: 'incoming-call' }, (payload) => {
          console.log('Incoming call notification received:', payload);
        })
        .on('broadcast', { event: 'group-call-invitation' }, (payload) => {
          console.log('Group call invitation received:', payload);
        });

      // Subscribe to channels with enhanced error handling
      messagesChannel.subscribe((status) => {
        console.log('Messages channel status:', status, 'Channel:', messagesChannelName);
        if (status === 'SUBSCRIBED') {
          messagesChannelRef.current = messagesChannel;
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Messages channel error, retrying...');
          setTimeout(() => messagesChannel.subscribe(), 2000);
        }
      });

      typingChannel.subscribe((status) => {
        console.log('Typing channel status:', status, 'Channel:', typingChannelName);
        if (status === 'SUBSCRIBED') {
          typingChannelRef.current = typingChannel;
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Typing channel error, retrying...');
          setTimeout(() => typingChannel.subscribe(), 2000);
        }
      });

      isSubscribedRef.current = true;

    } catch (error) {
      console.error('Error setting up channels:', error);
      cleanupChannels();
    }

    return () => {
      console.log('Cleaning up on unmount');
      cleanupChannels();
    };
  }, [user?.id, selectedConversation, toast]);

  // Handle selectedConversation changes separately with better loading
  useEffect(() => {
    if (selectedConversation && user) {
      console.log('Selected conversation changed, fetching messages for:', selectedConversation);
      fetchMessages(selectedConversation, true);
    }
  }, [selectedConversation, user]);

  // Initial fetch with better error handling
  useEffect(() => {
    if (user) {
      console.log('Initial fetch for user:', user.id);
      fetchConversations(true);
    }
  }, [user]);

  return {
    conversations,
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    sendTypingIndicator,
    typingUsers,
    refetch: () => fetchConversations(true),
    clearCache
  };
};
