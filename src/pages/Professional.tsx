
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessPages } from "@/hooks/useBusinessPages";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Search,
  Plus,
  Building2,
  BarChart3,
  Settings,
  Crown,
  MapPin,
  Globe,
  Star,
  Filter,
  Eye,
  MessageSquare,
  Heart,
  Share2
} from "lucide-react";
import BusinessPageDialog from "@/components/BusinessPageDialog";

const Professional = () => {
  const { user } = useAuth();
  const { myPages, pages, loading, searchPages } = useBusinessPages();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const results = await searchPages(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building2 className="w-5 h-5 text-purple-600" />;
      case 'organization':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'professional':
        return <Briefcase className="w-5 h-5 text-green-600" />;
      default:
        return <Briefcase className="w-5 h-5 text-gray-600" />;
    }
  };

  const professionalTools = [
    {
      title: "Analytics & Insights",
      description: "Track your professional growth and engagement",
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => navigate('/analytics')
    },
    {
      title: "Business Messaging",
      description: "Manage customer communications",
      icon: <MessageSquare className="w-6 h-6" />,
      action: () => navigate('/business-messages')
    },
    {
      title: "Page Management",
      description: "Edit and customize your business pages",
      icon: <Settings className="w-6 h-6" />,
      action: () => navigate('/business-management')
    },
    {
      title: "Professional Network",
      description: "Connect with other professionals",
      icon: <Users className="w-6 h-6" />,
      action: () => navigate('/professional-network')
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[400px] max-w-full overflow-hidden">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-4xl mx-auto min-w-0">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Professional Hub
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Manage your business presence and grow your professional network
                </p>
              </div>
              <BusinessPageDialog
                trigger={
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Business Page
                  </Button>
                }
              />
            </div>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-800/50 rounded-xl p-1">
                <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                <TabsTrigger value="directory" className="rounded-lg">Directory</TabsTrigger>
                <TabsTrigger value="tools" className="rounded-lg">Tools</TabsTrigger>
                <TabsTrigger value="insights" className="rounded-lg">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* My Business Pages */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      My Business Pages ({myPages.length})
                    </h2>
                    <Link to="/business-management">
                      <Button variant="outline" size="sm">
                        Manage All
                      </Button>
                    </Link>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : myPages.length === 0 ? (
                    <Card className="text-center py-12 bg-white/80 dark:bg-slate-800/80">
                      <CardContent>
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          No Business Pages Yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-500 mb-6">
                          Create your first business page to start building your professional presence
                        </p>
                        <BusinessPageDialog
                          trigger={
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Your First Page
                            </Button>
                          }
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myPages.slice(0, 6).map((page) => (
                        <Card key={page.id} className="group hover:shadow-xl transition-all duration-300 border-purple-200/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-12 h-12 border-2 border-purple-200">
                                <AvatarImage src={page.avatar_url || page.page_avatar_url} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  {page.page_name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-lg truncate">{page.page_name}</CardTitle>
                                  {page.is_verified && (
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {getBusinessIcon(page.page_type)}
                                  <span className="capitalize">{page.business_type || page.page_type}</span>
                                </div>
                              </div>
                            </div>
                            {page.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                {page.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {page.followers_count || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  Active
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => navigate(`/professional/${page.id}`)}
                              >
                                <Globe className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                onClick={() => navigate(`/business/${page.id}`)}
                              >
                                <BarChart3 className="w-3 h-3 mr-1" />
                                Dashboard
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all cursor-pointer group">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                          <Briefcase className="w-5 h-5" />
                          Create Business Page
                        </CardTitle>
                        <CardDescription>
                          Set up your professional presence
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <BusinessPageDialog
                          trigger={
                            <Button className="w-full">Get Started</Button>
                          }
                        />
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate('/professional-accounts')}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                          <Users className="w-5 h-5" />
                          Browse Professionals
                        </CardTitle>
                        <CardDescription>
                          Discover professional accounts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">Explore</Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate('/analytics')}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                          <TrendingUp className="w-5 h-5" />
                          Analytics
                        </CardTitle>
                        <CardDescription>
                          Track your professional growth
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">View Stats</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="directory" className="space-y-6 mt-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search professional pages..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="pl-10 bg-white/80 dark:bg-slate-800/80"
                  />
                </div>

                {/* Directory */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Professional Directory
                  </h2>
                  
                  {searching ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(searchQuery ? searchResults : pages).slice(0, 12).map((page) => (
                        <Card key={page.id} className="group hover:shadow-xl transition-all duration-300 border-purple-200/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-12 h-12 border-2 border-purple-200">
                                <AvatarImage src={page.avatar_url || page.page_avatar_url} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  {page.page_name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-lg truncate">{page.page_name}</CardTitle>
                                  {page.is_verified && (
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {getBusinessIcon(page.page_type)}
                                  <span className="capitalize">{page.business_type || page.page_type}</span>
                                </div>
                              </div>
                            </div>
                            {page.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                {page.description}
                              </p>
                            )}
                            {page.address && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{page.address}</span>
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {page.followers_count || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  Active
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => navigate(`/professional/${page.id}`)}
                              >
                                <Globe className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {/* Follow functionality */}}
                              >
                                <Heart className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {/* Share functionality */}}
                              >
                                <Share2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tools" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Professional Tools
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {professionalTools.map((tool, index) => (
                      <Card key={index} className="bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all cursor-pointer group" onClick={tool.action}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3 group-hover:text-purple-600 transition-colors">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                              {tool.icon}
                            </div>
                            {tool.title}
                          </CardTitle>
                          <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Access Tool</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Professional Insights
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-white/80 dark:bg-slate-800/80">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          Total Pages
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{myPages.length}</div>
                        <p className="text-xs text-muted-foreground">Business pages</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Total Followers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {myPages.reduce((sum, page) => sum + (page.followers_count || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Across all pages</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          Growth Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">+12%</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Professional;
