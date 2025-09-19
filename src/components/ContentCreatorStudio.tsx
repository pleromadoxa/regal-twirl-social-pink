import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  Image, 
  Video, 
  FileText,
  Palette,
  Sparkles,
  Download,
  Share2,
  Calendar,
  Clock,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  BarChart3,
  Target,
  Zap,
  Camera,
  Music,
  Type,
  Layers
} from 'lucide-react';

const mockTemplates = [
  {
    id: 1,
    name: "Instagram Post Template",
    category: "social",
    type: "image",
    thumbnail: "/api/placeholder/300/300",
    dimensions: "1080x1080",
    premium: false
  },
  {
    id: 2,
    name: "Story Template",
    category: "social",
    type: "image",
    thumbnail: "/api/placeholder/300/500",
    dimensions: "1080x1920",
    premium: true
  },
  {
    id: 3,
    name: "Video Intro Template",
    category: "video",
    type: "video",
    thumbnail: "/api/placeholder/300/200",
    dimensions: "1920x1080",
    premium: true
  },
  {
    id: 4,
    name: "Blog Header",
    category: "blog",
    type: "image",
    thumbnail: "/api/placeholder/300/150",
    dimensions: "1200x600",
    premium: false
  }
];

const mockAITools = [
  {
    name: "Background Remover",
    description: "Remove backgrounds from images instantly",
    icon: <Layers className="w-6 h-6" />,
    premium: false
  },
  {
    name: "AI Image Generator",
    description: "Generate unique images from text prompts",
    icon: <Wand2 className="w-6 h-6" />,
    premium: true
  },
  {
    name: "Content Optimizer",
    description: "Optimize content for better engagement",
    icon: <TrendingUp className="w-6 h-6" />,
    premium: true
  },
  {
    name: "Color Palette Generator",
    description: "Generate harmonious color schemes",
    icon: <Palette className="w-6 h-6" />,
    premium: false
  }
];

const ContentCreatorStudio = () => {
  const [activeProject, setActiveProject] = useState('new');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Content Creator Studio
          </h1>
          <p className="text-muted-foreground mt-2">
            Create stunning content with AI-powered tools and templates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <Zap className="w-4 h-4 mr-1" />
            Premium Feature
          </Badge>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Download className="w-4 h-4 mr-2" />
            Export Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Projects</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">12</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">This month</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">AI Generations</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">89</p>
                <p className="text-xs text-green-600 dark:text-green-400">Remaining: 211</p>
              </div>
              <Wand2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Templates Used</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">23</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Favorites: 8</p>
              </div>
              <Image className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-200 dark:border-pink-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-600 dark:text-pink-400 text-sm font-medium">Engagement</p>
                <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">+34%</p>
                <p className="text-xs text-pink-600 dark:text-pink-400">vs last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Design Canvas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <div className="text-center">
                      <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Start Creating</h3>
                      <p className="text-muted-foreground mb-4">Choose a template or start from scratch</p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline">
                          <Image className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                          <Wand2 className="w-4 h-4 mr-2" />
                          AI Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tools Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Design Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-12">
                      <Type className="w-4 h-4 mr-2" />
                      Text
                    </Button>
                    <Button variant="outline" className="h-12">
                      <Image className="w-4 h-4 mr-2" />
                      Image
                    </Button>
                    <Button variant="outline" className="h-12">
                      <Palette className="w-4 h-4 mr-2" />
                      Colors
                    </Button>
                    <Button variant="outline" className="h-12">
                      <Layers className="w-4 h-4 mr-2" />
                      Layers
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe what you want to create..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={handleAIGenerate}
                    disabled={!aiPrompt.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Generating...
                      </div>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">Instagram Post {i}</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="blog">Blog Graphics</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Search templates..." className="max-w-xs" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative">
                  <div className="absolute top-2 right-2">
                    {template.premium ? (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                        <Zap className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-medium">{template.name}</p>
                    <p className="text-white/80 text-sm">{template.dimensions}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {template.type}
                    </Badge>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Creation Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockAITools.map((tool, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                          {tool.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{tool.name}</h3>
                            {tool.premium && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {tool.description}
                          </p>
                          <Button 
                            size="sm" 
                            className={tool.premium ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                            variant={tool.premium ? "default" : "outline"}
                          >
                            {tool.premium ? "Upgrade to Use" : "Try Now"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Performance Optimizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center p-6">
                  <Eye className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">View Prediction</h4>
                  <p className="text-sm text-muted-foreground">
                    Predict how many views your content will get
                  </p>
                </Card>
                
                <Card className="text-center p-6">
                  <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Engagement Boost</h4>
                  <p className="text-sm text-muted-foreground">
                    Optimize for maximum likes and comments
                  </p>
                </Card>
                
                <Card className="text-center p-6">
                  <Target className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Audience Match</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure content matches your audience preferences
                  </p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Content Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <Progress value={85} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">4.2K</div>
                  <div className="text-sm text-muted-foreground">Avg. Views</div>
                  <Progress value={68} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">6.8%</div>
                  <div className="text-sm text-muted-foreground">Engagement Rate</div>
                  <Progress value={68} className="mt-2" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Top Performing Content</h4>
                {[
                  { title: "Summer Collection Post", views: "12.4K", engagement: "8.2%", type: "Image" },
                  { title: "Behind the Scenes Video", views: "9.8K", engagement: "7.5%", type: "Video" },
                  { title: "Product Showcase", views: "7.2K", engagement: "6.9%", type: "Carousel" }
                ].map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{content.title}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {content.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {content.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {content.engagement}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentCreatorStudio;