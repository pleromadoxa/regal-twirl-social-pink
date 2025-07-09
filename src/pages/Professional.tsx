
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import BusinessPageCreator from "@/components/business/BusinessPageCreator";
import BusinessManagementDashboard from "@/components/business/BusinessManagementDashboard";
import ProfessionalUsersWidget from "@/components/ProfessionalUsersWidget";
import { useBusinessPages } from "@/hooks/useBusinessPages";
import { 
  Building, Users, TrendingUp, Search, Plus, Crown, Sparkles,
  BarChart3, ShoppingBag, Calendar, MessageSquare, Settings,
  Globe, DollarSign, Star, Zap, Award, Target
} from "lucide-react";

const Professional = () => {
  const { user } = useAuth();
  const { myPages, pages, loading, searchPages } = useBusinessPages();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!user) {
    return null;
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchPages(term);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const featuredTools = [
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Track performance metrics and insights",
      color: "from-blue-500 to-blue-600",
      premium: false
    },
    {
      icon: ShoppingBag,
      title: "E-commerce Suite",
      description: "Sell products and manage inventory",
      color: "from-green-500 to-green-600",
      premium: true
    },
    {
      icon: Calendar,
      title: "Booking System",
      description: "Schedule appointments and services",
      color: "from-purple-500 to-purple-600",
      premium: true
    },
    {
      icon: MessageSquare,
      title: "Customer Support",
      description: "Manage customer communications",
      color: "from-orange-500 to-orange-600",
      premium: false
    },
    {
      icon: Target,
      title: "Marketing Tools",
      description: "Promote your business effectively",
      color: "from-pink-500 to-pink-600",
      premium: true
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Track revenue and expenses",
      color: "from-emerald-500 to-emerald-600",
      premium: true
    }
  ];

  const businessStats = {
    totalPages: myPages.length,
    totalFollowers: myPages.reduce((sum, page) => sum + (page.followers_count || 0), 0),
    totalRevenue: 2450,
    growthRate: 12.5
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8 p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-purple-200/50 dark:border-purple-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Professional Hub
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mt-1">
                    Manage your business empire with advanced tools
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium Features Available
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{businessStats.totalPages}</div>
                <div className="text-sm text-blue-600/80">Business Pages</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{businessStats.totalFollowers}</div>
                <div className="text-sm text-green-600/80">Total Followers</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">${businessStats.totalRevenue}</div>
                <div className="text-sm text-purple-600/80">Revenue</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">+{businessStats.growthRate}%</div>
                <div className="text-sm text-orange-600/80">Growth</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search businesses, professionals, and organizations..."
                className="pl-12 h-12 bg-white/60 dark:bg-slate-700/60 border-purple-200/50 rounded-xl text-lg"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 h-14 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-2">
              <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="create" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </TabsTrigger>
              <TabsTrigger value="directory" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Globe className="w-4 h-4 mr-2" />
                Directory
              </TabsTrigger>
              <TabsTrigger value="tools" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="insights" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Award className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <BusinessManagementDashboard />
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <BusinessPageCreator />
            </TabsContent>

            <TabsContent value="directory" className="space-y-6">
              <div className="grid gap-6">
                {searchTerm && searchResults.length > 0 && (
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Search Results for "{searchTerm}"</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {searchResults.map((result) => (
                          <div key={result.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold">
                                {result.page_name[0]}
                              </div>
                              <div>
                                <h3 className="font-semibold">{result.page_name}</h3>
                                <p className="text-sm text-gray-600">{result.business_type}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <ProfessionalUsersWidget />
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-purple-600" />
                    Business Tools & Features
                  </CardTitle>
                  <CardDescription>
                    Powerful tools to grow and manage your professional presence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredTools.map((tool, index) => {
                      const IconComponent = tool.icon;
                      return (
                        <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-purple-200/50">
                          <CardContent className="p-6">
                            <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{tool.title}</h3>
                              {tool.premium && (
                                <Badge variant="outline" className="text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                            <Button 
                              size="sm" 
                              className="w-full"
                              variant={tool.premium ? "default" : "outline"}
                            >
                              {tool.premium ? "Upgrade to Access" : "Launch Tool"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-6 h-6 text-purple-600" />
                      Business Insights & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Growth Opportunity</h3>
                        <p className="text-blue-800 dark:text-blue-200">Your business pages are performing well! Consider expanding your service offerings to capture more market share.</p>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Engagement Tip</h3>
                        <p className="text-green-800 dark:text-green-200">Posts with images get 65% more engagement. Add more visual content to boost your reach.</p>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Premium Feature</h3>
                        <p className="text-purple-800 dark:text-purple-200">Unlock advanced analytics and AI-powered insights with our Premium plan.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Professional;
