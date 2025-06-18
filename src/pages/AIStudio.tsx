
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AIAssistantChat from '@/components/AIAssistantChat';
import AIContentGenerator from '@/components/AIContentGenerator';
import AIImageGenerator from '@/components/AIImageGenerator';
import { 
  Bot, 
  FileText, 
  Image, 
  MessageSquare, 
  Sparkles,
  Crown,
  Zap,
  TrendingUp
} from 'lucide-react';

const AIStudio = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-6xl mx-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Regal AI Studio
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your complete AI-powered content creation suite
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">AI Chats</p>
                        <p className="text-2xl font-bold">124</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100">Content Generated</p>
                        <p className="text-2xl font-bold">89</p>
                      </div>
                      <FileText className="w-8 h-8 text-pink-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Images Created</p>
                        <p className="text-2xl font-bold">45</p>
                      </div>
                      <Image className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Premium Features</p>
                        <p className="text-2xl font-bold">
                          <Crown className="w-6 h-6 inline" />
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Tools Tabs */}
            <Tabs defaultValue="chat" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-slate-800/50">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content Generator
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Image Generator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="space-y-6">
                <AIAssistantChat />
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <AIContentGenerator />
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <AIImageGenerator />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default AIStudio;
