
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarNav from '@/components/SidebarNav';
import AIContentGenerator from '@/components/AIContentGenerator';
import AIPostComposer from '@/components/AIPostComposer';
import AIPostEnhancer from '@/components/AIPostEnhancer';
import AIImageGenerator from '@/components/AIImageGenerator';
import AIAssistantChat from '@/components/AIAssistantChat';
import AIGenerationHistory from '@/components/AIGenerationHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Brain, 
  Image, 
  MessageSquare, 
  Zap, 
  Clock,
  Crown,
  Wand2
} from 'lucide-react';

const AIStudio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generator');

  const aiTools = [
    {
      id: 'generator',
      name: 'Content Generator',
      description: 'Generate captions, hashtags, and social media content',
      icon: Wand2,
      color: 'from-blue-500 to-purple-600',
      component: AIContentGenerator
    },
    {
      id: 'composer',
      name: 'Post Composer',
      description: 'AI-powered post creation with smart suggestions',
      icon: Brain,
      color: 'from-green-500 to-teal-600',
      component: AIPostComposer
    },
    {
      id: 'enhancer',
      name: 'Content Enhancer',
      description: 'Improve and optimize your existing content',
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      component: AIPostEnhancer
    },
    {
      id: 'images',
      name: 'Image Generator',
      description: 'Create stunning images with AI',
      icon: Image,
      color: 'from-pink-500 to-purple-600',
      component: AIImageGenerator
    },
    {
      id: 'assistant',
      name: 'AI Assistant',
      description: 'Chat with AI for personalized help',
      icon: MessageSquare,
      color: 'from-indigo-500 to-blue-600',
      component: AIAssistantChat
    }
  ];

  const currentTool = aiTools.find(tool => tool.id === activeTab);
  const CurrentComponent = currentTool?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 mr-96 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Studio
                </h1>
                <p className="text-muted-foreground">
                  Supercharge your content creation with AI-powered tools
                </p>
              </div>
            </div>

            {/* Premium Notice */}
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900 dark:text-purple-100">
                      AI Studio - Premium Features
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Create amazing content with our AI-powered tools. Upgrade for unlimited generations!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Tool Selection */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">AI Tools</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {aiTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Button
                          key={tool.id}
                          variant={activeTab === tool.id ? 'secondary' : 'ghost'}
                          className={`w-full justify-start h-auto p-3 ${
                            activeTab === tool.id 
                              ? 'bg-gradient-to-r ' + tool.color + ' text-white' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setActiveTab(tool.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium text-sm">{tool.name}</div>
                              <div className={`text-xs ${
                                activeTab === tool.id 
                                  ? 'text-white/80' 
                                  : 'text-muted-foreground'
                              }`}>
                                {tool.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Generation History */}
              <div className="mt-6">
                <AIGenerationHistory />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Card className="min-h-96">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {currentTool && (
                      <>
                        <div className={`p-2 bg-gradient-to-r ${currentTool.color} rounded-lg`}>
                          <currentTool.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle>{currentTool.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {currentTool.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {CurrentComponent && <CurrentComponent />}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudio;
