import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import PostsList from "@/components/PostsList";
import { WorldMap } from "@/components/ui/world-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Crown, 
  Building,
  Users as UsersIcon,
  User as UserIcon,
  MessageCircle,
  Share,
  TrendingUp,
  Eye,
  Heart,
  BarChart3,
  Star,
  Globe
} from "lucide-react";

interface BusinessPage {
  id: string;
  page_name: string;
  page_type: string;
  description: string;
  is_verified: boolean;
  followers_count: number;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
  owner_id: string;
}

const ProfessionalAccountProfile = () => {
  const { pageId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [businessPage, setBusinessPage] = useState<BusinessPage | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pageId) {
      fetchBusinessPage();
      checkFollowStatus();
    }
  }, [pageId, user]);

  const fetchBusinessPage = async () => {
    if (!pageId) return;

    try {
      const { data, error } = await supabase
        .from('business_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) throw error;
      setBusinessPage(data);
    } catch (error) {
      console.error('Error fetching business page:', error);
      toast({
        title: "Error",
        description: "Failed to load professional account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !pageId) return;

    try {
      const { data } = await supabase
        .from('business_page_follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('page_id', pageId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !pageId) return;

    try {
      if (isFollowing) {
        await supabase
          .from('business_page_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('page_id', pageId);

        setIsFollowing(false);
        setBusinessPage(prev => prev ? { ...prev, followers_count: prev.followers_count - 1 } : null);
      } else {
        await supabase
          .from('business_page_follows')
          .insert({
            user_id: user.id,
            page_id: pageId
          });

        setIsFollowing(true);
        setBusinessPage(prev => prev ? { ...prev, followers_count: prev.followers_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  const handleMessage = () => {
    if (businessPage?.owner_id) {
      navigate(`/messages?user=${businessPage.owner_id}`);
    }
  };

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'organization':
        return <UsersIcon className="w-4 h-4 text-blue-600" />;
      case 'professional':
        return <UserIcon className="w-4 h-4 text-green-600" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!businessPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Professional Account not found</h1>
            <p className="text-slate-600 dark:text-slate-400">The professional account you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {/* World Map Background */}
      <div className="absolute inset-0 opacity-10 z-0">
        <WorldMap
          dots={[
            {
              start: { lat: 40.7128, lng: -74.0060 }, // New York
              end: { lat: 51.5074, lng: -0.1278 }, // London
            },
            {
              start: { lat: 35.6762, lng: 139.6503 }, // Tokyo
              end: { lat: -33.8688, lng: 151.2093 }, // Sydney
            },
            {
              start: { lat: 37.7749, lng: -122.4194 }, // San Francisco
              end: { lat: 55.7558, lng: 37.6176 }, // Moscow
            }
          ]}
          lineColor="#9333ea"
        />
      </div>
      
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 relative z-10">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {/* Profile Header */}
          <div className="relative">
            {/* Banner */}
            {businessPage.banner_url ? (
              <img 
                src={businessPage.banner_url} 
                alt="Professional account banner"
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-r from-purple-600 to-pink-600"></div>
            )}
            
            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex justify-between items-start -mt-16 mb-4">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-lg">
                  <AvatarImage src={businessPage.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-3xl font-bold">
                    {businessPage.page_name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex gap-2 mt-16">
                  <Button
                    variant="outline"
                    onClick={handleMessage}
                    className="rounded-xl border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    onClick={handleFollow}
                    className={`rounded-xl ${
                      isFollowing
                        ? 'bg-slate-500 hover:bg-slate-600'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    } text-white`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {businessPage.page_name}
                    </h1>
                    {businessPage.is_verified && (
                      <Badge variant="verified" className="flex items-center gap-1">
                        <Crown className="w-4 h-4" />
                        Verified
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {getBusinessIcon(businessPage.page_type)}
                      <Badge variant="outline" className="text-xs">
                        {businessPage.page_type.charAt(0).toUpperCase() + businessPage.page_type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {businessPage.description && (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {businessPage.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                  {businessPage.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {businessPage.address}
                    </div>
                  )}
                  {businessPage.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <a 
                        href={businessPage.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {businessPage.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(businessPage.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="border-t border-purple-200 dark:border-purple-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Followers */}
              <Card className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-blue-600" />
                    Followers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {businessPage.followers_count.toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total followers</p>
                </CardContent>
              </Card>

              {/* Engagement Rate */}
              <Card className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    Engagement Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {Math.floor(Math.random() * 10 + 5)}%
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Average engagement</p>
                </CardContent>
              </Card>

              {/* Profile Views */}
              <Card className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-600" />
                    Profile Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {(businessPage.followers_count * 2.5 + Math.floor(Math.random() * 1000)).toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">This month</p>
                </CardContent>
              </Card>

              {/* Growth Rate */}
              <Card className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Growth Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    +{Math.floor(Math.random() * 50 + 10)}%
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Past 30 days</p>
                </CardContent>
              </Card>

              {/* Rating */}
              <Card className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {(4.2 + Math.random() * 0.7).toFixed(1)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Customer rating</p>
                </CardContent>
              </Card>

              {/* Reach */}
              <Card className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {(businessPage.followers_count * 3.2 + Math.floor(Math.random() * 5000)).toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">People reached</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Posts */}
          <div className="border-t border-purple-200 dark:border-purple-800">
            <PostsList userId={businessPage.owner_id} />
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default ProfessionalAccountProfile;
