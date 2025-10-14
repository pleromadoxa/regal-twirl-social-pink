
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Crown, 
  Sparkles, 
  MessageSquare, 
  Send, 
  User, 
  Bot,
  Wand2,
  Zap,
  Brain,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIService {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  premium: boolean;
}

const RegalAIEngine = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedService, setSelectedService] = useState<string>('general');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const aiServices: AIService[] = [
    {
      id: 'general',
      name: 'General Assistant',
      description: 'Your intelligent companion for everyday tasks',
      icon: Brain,
      color: 'text-purple-600',
      premium: false
    },
    {
      id: 'creative',
      name: 'Creative Writer',
      description: 'Craft compelling stories, poems, and creative content',
      icon: Wand2,
      color: 'text-pink-600',
      premium: false
    },
    {
      id: 'business',
      name: 'Business Advisor',
      description: 'Strategic insights and business intelligence',
      icon: Crown,
      color: 'text-amber-600',
      premium: true
    },
    {
      id: 'technical',
      name: 'Tech Expert',
      description: 'Advanced technical support and coding assistance',
      icon: Zap,
      color: 'text-blue-600',
      premium: true
    },
    {
      id: 'innovation',
      name: 'Innovation Lab',
      description: 'Breakthrough ideas and future-thinking solutions',
      icon: Lightbulb,
      color: 'text-green-600',
      premium: true
    }
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use Regal AI Engine",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const selectedServiceData = aiServices.find(s => s.id === selectedService);
      const systemPrompt = `You are ${selectedServiceData?.name}, ${selectedServiceData?.description}. Respond in a helpful, professional, and engaging manner that matches your role.`;

      const { data, error } = await supabase.functions.invoke('ai-assistant-chat', {
        body: {
          message: input,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Track AI generation
      await supabase.from('ai_generations').insert({
        user_id: user.id,
        generation_type: selectedService,
        prompt: input,
        result: data.response
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const selectedServiceData = aiServices.find(s => s.id === selectedService);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Crown className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            Regal AI Engine
          </h1>
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience the pinnacle of artificial intelligence with our premium AI services. 
          Unlock extraordinary capabilities with our regal suite of AI assistants.
        </p>
      </div>

      {/* AI Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiServices.map((service) => {
          const IconComponent = service.icon;
          const isSelected = selectedService === service.id;
          
          return (
            <Card 
              key={service.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-purple-500 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-6 h-6 ${service.color}`} />
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </div>
                  {service.premium && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedServiceData && (
                <>
                  <selectedServiceData.icon className={`w-6 h-6 ${selectedServiceData.color}`} />
                  <CardTitle>{selectedServiceData.name}</CardTitle>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear Chat
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Welcome to Regal AI Engine</p>
              <p className="text-sm">Start a conversation with your selected AI assistant</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gradient-to-br from-amber-500 to-purple-600 text-white'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Chat with ${selectedServiceData?.name}...`}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || loading}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RegalAIEngine;
