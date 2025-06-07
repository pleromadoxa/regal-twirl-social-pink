
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useGallery } from "@/hooks/useGallery";
import SidebarNav from "@/components/SidebarNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Globe, 
  Calendar, 
  CheckCircle, 
  Settings,
  UserPlus,
  UserCheck,
  MessageCircle,
  Phone,
  Video
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PostsList from "@/components/PostsList";
import GalleryUpload from "@/components/GalleryUpload";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import InteractiveBentoGallery from "@/components/ui/interactive-bento-gallery";

const Profile = () => {
  const { userId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, isFollowing, toggleFollow } = useProfile(userId);
  const { galleryItems, loading: galleryLoading, transformToMediaItems } = useGallery(userId);
  const [activeTab, setActiveTab] = useState('gallery');

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleEditProfile = () => {
    navigate('/settings');
  };

  const handleMessageUser = () => {
    if (userId) {
      navigate(`/messages?user=${userId}`);
    }
  };

  const handleAudioCall = async () => {
    // Implement audio call logic
    console.log('Starting audio call with user:', userId);
  };

  const handleVideoCall = async () => {
    // Implement video call logic
    console.log('Starting video call with user:', userId);
  };

  if (loading || profileLoading) {
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
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">User not found</h2>
            <p className="text-slate-500 dark:text-slate-400">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = profile.username === 'pleromadoxa' || profile.is_verified || (profile.followers_count && profile.followers_count >= 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        {/* Profile Header */}
        <div className="relative">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 relative overflow-hidden">
            {profile.banner_url ? (
              <img 
                src={profile.banner_url} 
                alt="Profile banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/80 via-pink-500/80 to-blue-500/80" />
            )}
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 relative z-10">
              <div className="flex items-end space-x-4">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-xl">
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-4xl">
                    {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 sm:mt-0">
                {isOwnProfile ? (
                  <Button 
                    onClick={handleEditProfile}
                    variant="outline" 
                    className="rounded-full border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-500 transition-all duration-300"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleMessageUser}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-500 transition-all duration-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleAudioCall}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-2 border-green-300 hover:bg-green-50 hover:border-green-500 transition-all duration-300"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleVideoCall}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-500 transition-all duration-300"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <InteractiveHoverButton
                      text={isFollowing ? "Following" : "Follow"}
                      onClick={toggleFollow}
                      className={`rounded-full transition-all duration-300 ${
                        isFollowing 
                          ? 'bg-purple-600 hover:bg-red-500 text-white' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      }`}
                    >
                      {isFollowing ? <UserCheck className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                    </InteractiveHoverButton>
                  </>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {profile.display_name || profile.username}
                </h1>
                {isVerified && (
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                    <CheckCircle className="w-4 h-4" />
                  </Badge>
                )}
                {profile.premium_tier && profile.premium_tier !== 'free' && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {profile.premium_tier}
                  </Badge>
                )}
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-1">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Profile Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{profile.following_count}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">Following</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{profile.followers_count}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{profile.posts_count}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <div className="border-b border-purple-200 dark:border-purple-800 px-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger 
                value="gallery" 
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
              >
                Gallery ({galleryItems.length})
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
              >
                Media
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="gallery" className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Gallery
              </h2>
              {isOwnProfile && <GalleryUpload />}
            </div>
            
            {galleryLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : galleryItems.length > 0 ? (
              <InteractiveBentoGallery 
                mediaItems={transformToMediaItems(galleryItems)}
                title={`${profile.display_name || profile.username}'s Gallery`}
                description="Collection of photos and videos"
              />
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p>No gallery items yet</p>
                {isOwnProfile && (
                  <p className="text-sm mt-2">Share your photos and videos to get started!</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="p-6">
            <PostsList userId={userId} />
          </TabsContent>

          <TabsContent value="media" className="p-6">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p>Media posts will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
