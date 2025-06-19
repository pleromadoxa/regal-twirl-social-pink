
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Minimize2, Maximize2, Send, X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const RegalAIBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when component mounts or user changes
  useEffect(() => {
    if (user) {
      const welcomeMessage: Message = {
        id: '1',
        content: `Hi there! I'm Regal AI Support, your intelligent assistant for Regal Network. I can help you with account management, content creation, platform features, troubleshooting, business tools, verification processes, premium features, and much more. What can I assist you with today?`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get user profile data for personalization
      let userProfile = null;
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, username, premium_tier, is_verified, verification_level')
          .eq('id', user.id)
          .single();
        userProfile = data;
      }

      const userName = userProfile?.display_name || userProfile?.username || 'there';
      const enhancedPrompt = `You are Regal AI Support, an advanced and intelligent customer support assistant for Regal Network - a premium Christian social media platform. You are knowledgeable, helpful, and professional. Always address the user as ${userName}.

USER CONTEXT:
- User Name: ${userName}
- Premium Tier: ${userProfile?.premium_tier || 'free'}
- Verification Status: ${userProfile?.is_verified ? `Verified (${userProfile.verification_level})` : 'Not verified'}

PLATFORM KNOWLEDGE:
- Regal Network is a Christian social media platform with features like posts, stories, reels, messaging, business pages, verification system, premium subscriptions, AI tools, music sharing, and professional networking
- Users can get verified with different levels: Verified (blue checkmark), Professional (purple), Business (green), VIP (gold crown)
- Premium tiers include Free, Pro ($9.99/month), and Business ($19.99/month) with different features
- Platform includes AI content generation, image creation, and assistant features
- Business tools include analytics, ads manager, e-commerce integration
- Music section for Christian artists and content
- Professional directory for networking
- Real-time messaging with voice/video calls
- Stories that expire after 24 hours
- Reels for short-form video content
- Group messaging and conversations
- Support for image, video, and audio posts
- Hashtag following and trending topics
- Pin posts feature for important content
- Follow system for connecting with other users

PREMIUM FEATURES TO SUGGEST:
- Pro Plan ($9.99/month): Unlimited AI generations, advanced analytics, priority support, custom verification badge, ad-free experience
- Business Plan ($19.99/month): All Pro features plus business page creation, e-commerce tools, advanced ad targeting, invoicing system, booking management
- Premium users get enhanced AI tools, better reach, and exclusive features

BUSINESS ACCOUNT BENEFITS:
- Create professional business pages
- Sell products and services directly
- Accept bookings and appointments  
- Generate and send invoices
- Advanced analytics and insights
- Targeted advertising campaigns
- Customer messaging system
- E-commerce integration
- Multiple currency support

SOCIAL MEDIA FEATURES:
- Posts with text, images, videos, and audio
- Stories (24-hour expiring content)
- Reels (short-form videos)
- Real-time messaging
- Voice and video calls
- Group conversations
- Follow/unfollow users
- Like, comment, and share posts
- Hashtag system
- Trending topics
- Pin posts
- User verification system
- Professional networking
- Music sharing and discovery
- Gallery for organizing media
- Live streaming capabilities
- Event creation and management
- Polls and interactive content

SUPPORT CAPABILITIES:
- Account settings and profile management
- Verification processes and requirements
- Premium subscription features and billing
- Content creation and posting guidelines
- Business page setup and management
- Troubleshooting technical issues
- AI tools usage and features
- Platform navigation and features
- Privacy and security settings
- Community guidelines and policies
- Professional networking features
- Music upload and sharing
- Messaging and communication features
- E-commerce and business tools

ESCALATION PROTOCOL:
- If you cannot resolve an issue or need human intervention, provide the support email: support@myregal.online
- For complex technical issues, billing problems, or account security concerns, direct users to contact support@myregal.online
- Always be helpful and try to solve issues first before escalating

TONE & STYLE:
- Be friendly, professional, and empathetic
- Provide clear, step-by-step instructions
- Use bullet points for complex information
- Be concise but thorough
- Show genuine care for user experience
- Maintain Christian values of kindness and service
- Always address the user by their name when possible

Current user question: ${inputMessage}

Provide a helpful, detailed response. If you cannot fully assist with their request, acknowledge this and provide the support email for further assistance.`;

      const { data, error } = await supabase.functions.invoke('ai-assistant-chat', {
        body: {
          message: enhancedPrompt,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          }))
        }
      });

      if (error) throw error;

      let botResponse = data.response || `I apologize ${userName}, but I'm having trouble responding right now. Please try again or contact our support team directly at support@myregal.online.`;

      // Enhance response with support email if needed
      if (inputMessage.toLowerCase().includes('support') || 
          inputMessage.toLowerCase().includes('contact') ||
          inputMessage.toLowerCase().includes('help') ||
          inputMessage.toLowerCase().includes('email') ||
          inputMessage.toLowerCase().includes('human') ||
          inputMessage.toLowerCase().includes('agent')) {
        botResponse += "\n\n📧 For additional support or to speak with a human agent, you can reach our team at: support@myregal.online";
      }

      // Suggest premium features for relevant queries
      if ((inputMessage.toLowerCase().includes('premium') || 
           inputMessage.toLowerCase().includes('upgrade') ||
           inputMessage.toLowerCase().includes('pro') ||
           inputMessage.toLowerCase().includes('business')) && 
           !botResponse.includes('premium') && !botResponse.includes('upgrade')) {
        botResponse += "\n\n✨ Consider upgrading to our Pro ($9.99/month) or Business ($19.99/month) plans for enhanced features, unlimited AI generations, and priority support!";
      }

      // Suggest business account for business-related queries
      if ((inputMessage.toLowerCase().includes('sell') || 
           inputMessage.toLowerCase().includes('business') ||
           inputMessage.toLowerCase().includes('store') ||
           inputMessage.toLowerCase().includes('product')) && 
           !botResponse.includes('business page') && userProfile?.premium_tier === 'free') {
        botResponse += "\n\n🏢 Want to sell products or services? Create a business page with our Business Plan ($19.99/month) to access e-commerce tools, invoicing, booking management, and more!";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Save generation to database
      if (user) {
        await supabase.from('ai_generations').insert({
          user_id: user.id,
          generation_type: 'assistant',
          prompt: inputMessage,
          result: botResponse,
          model_used: 'gpt-4o-mini'
        });
      }
    } catch (error) {
      console.error('Error sending message to AI bot:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm sorry, I'm experiencing technical difficulties. Please try again later or contact our support team directly at support@myregal.online for immediate assistance.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-96'} shadow-xl border-purple-200 dark:border-purple-800`}>
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">Regal AI Support</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 hover:bg-white/20 text-white"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 hover:bg-white/20 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={message.isUser ? 'bg-blue-500 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'}>
                        {message.isUser ? 'U' : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] p-2 rounded-lg text-sm whitespace-pre-wrap ${
                        message.isUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Regal Network..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default RegalAIBot;
