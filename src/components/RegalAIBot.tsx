
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm Regal AI Support. How can I help you today? I can assist with account settings, features, troubleshooting, and general questions about Regal Network.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const { data, error } = await supabase.functions.invoke('ai-assistant-chat', {
        body: {
          message: `You are Regal AI Support, a helpful customer support assistant for Regal Network - a Christian social media platform. Help users with: account settings, features, troubleshooting, navigation, professional accounts, business tools, AI features, and general platform questions. Be friendly, professional, and concise. Current user question: ${inputMessage}`,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          }))
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I apologize, but I'm having trouble responding right now. Please try again or contact our support team directly.",
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
          result: data.response,
          model_used: 'gpt-4o-mini'
        });
      }
    } catch (error) {
      console.error('Error sending message to AI bot:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm experiencing technical difficulties. Please try again later or contact our support team directly.",
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
                      className={`max-w-[70%] p-2 rounded-lg text-sm ${
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
                  placeholder="Ask me anything..."
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
