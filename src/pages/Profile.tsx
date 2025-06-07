import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";
import { supabase } from "@/integrations/supabase/client";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import PostsList from "@/components/PostsList";
import TweetComposer from "@/components/TweetComposer";
import { Card, CardContent } from "@/components/ui/card";
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
  Settings,
  MessageCircle,
  Edit,
  Trash2,
  Share,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, isFollowing, toggleFollow } = useProfile(userId);
  const [businessPages, setBusinessPages] = useState<BusinessPage[]>([]);
  const isVerified = useVerifiedStatus(profile);
  const isOwnProfile = user?.id === userId;
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchBusinessPages();
    }
  }, [userId]);

  const fetchBusinessPages = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('business_pages')
        .select('*')
        .eq('owner_id', userId);

      if (error) throw error;
      setBusinessPages(data || []);
    } catch (error) {
      console.error('Error fetching business pages:', error);
    }
  };

  const handleDeleteBusinessPage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this professional account?')) return;

    try {
      const { error } = await supabase
        .from('business_pages')
        .delete()
        .eq('id', pageId)
        .eq('owner_id', user?.id);

      if (error) throw error;

      toast({
        title: "Professional account deleted",
        description: "The account has been removed successfully."
      });

      fetchBusinessPages();
    } catch (error) {
      console.error('Error deleting business page:', error);
      toast({
        title: "Error",
        description: "Failed to delete professional account",
        variant: "destructive"
      });
    }
  };

  const handleShareBusinessPage = (page: BusinessPage) => {
    const shareText = `Check out ${page.page_name} on our platform!`;
    const shareUrl = `${window.location.origin}/profile/${userId}`;
    
    if (navigator.share) {
      navigator.share({
        title: page.page_name,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Link copied",
        description: "Professional account link copied to clipboard"
      });
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

  const handleMessage = () => {
    if (userId) {
      navigate(`/messages?user=${userId}`);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">User not found</h1>
            <p className="text-slate-600 dark:text-slate-400">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {/* Profile Header */}
          <div className="relative">
            {/* Banner */}
            {profile.banner_url ? (
              <img 
                src={profile.banner_url} 
                alt="Profile banner"
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-r from-purple-600 to-pink-600"></div>
            )}
            
            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex justify-between items-start -mt-16 mb-4">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-lg">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-3xl font-bold">
                    {profile.display_name?.[0] || profile.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex gap-2 mt-16">
                  {isOwnProfile ? (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/settings')}
                      className="rounded-xl border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleMessage}
                        className="rounded-xl border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        onClick={toggleFollow}
                        className={`rounded-xl ${
                          isFollowing
                            ? 'bg-slate-500 hover:bg-slate-600'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        } text-white`}
                      >
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {profile.display_name || profile.username}
                    </h1>
                    {isVerified && (
                      <Badge variant="verified" className="flex items-center gap-1">
                        <Crown className="w-4 h-4" />
                        Verified
                      </Badge>
                    )}
                    {profile.premium_tier && profile.premium_tier !== 'free' && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    @{profile.username}
                  </p>
                </div>
                
                {profile.bio && (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{profile.following_count}</span>
                    <span className="text-slate-600 dark:text-slate-400">Following</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{profile.followers_count}</span>
                    <span className="text-slate-600 dark:text-slate-400">Followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{profile.posts_count}</span>
                    <span className="text-slate-600 dark:text-slate-400">Posts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Accounts */}
          {businessPages.length > 0 && (
            <div className="border-t border-purple-200 dark:border-purple-800 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                Professional Accounts
              </h2>
              <div className="grid gap-4">
                {businessPages.map((page) => (
                  <Card key={page.id} className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => navigate(`/professional-account/${page.id}`)}
                        >
                          {getBusinessIcon(page.page_type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100 hover:text-purple-600 transition-colors">
                                {page.page_name}
                              </h3>
                              {page.is_verified && (
                                <Badge variant="verified" className="flex items-center gap-1">
                                  <Crown className="w-3 h-3" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Badge variant="outline" className="text-xs">
                                {page.page_type.charAt(0).toUpperCase() + page.page_type.slice(1)}
                              </Badge>
                              <span>{page.followers_count} followers</span>
                            </div>
                          </div>
                        </div>
                        
                        {isOwnProfile && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/professional-accounts?edit=${page.id}`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShareBusinessPage(page)}>
                                <Share className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteBusinessPage(page.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      {page.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {page.description}
                        </p>
                      )}
                      
                      {/* Additional business page details */}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {page.website && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            <a 
                              href={page.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:underline"
                            >
                              {page.website}
                            </a>
                          </div>
                        )}
                        {page.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {page.address}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Post Composer - Only show on own profile */}
          {isOwnProfile && (
            <div className="border-t border-purple-200 dark:border-purple-800">
              <TweetComposer />
            </div>
          )}
          
          {/* Posts */}
          <div className="border-t border-purple-200 dark:border-purple-800">
            <PostsList userId={userId} />
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Profile;
