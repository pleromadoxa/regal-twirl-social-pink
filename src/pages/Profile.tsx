
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, MapPin, Link as LinkIcon, Edit, MessageCircle, Save, X, Crown, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import SidebarNav from "@/components/SidebarNav";
import TrendingWidget from "@/components/TrendingWidget";
import ImageUpload from "@/components/ImageUpload";
import { format } from "date-fns";

const Profile = () => {
  const { userId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, isFollowing, toggleFollow, updateProfile } = useProfile(userId);
  const { posts, loading: postsLoading } = usePosts();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: '',
    banner_url: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        avatar_url: profile.avatar_url || '',
        banner_url: profile.banner_url || ''
      });
    }
  }, [profile]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const isOwnProfile = user.id === profile.id;
  const userPosts = posts.filter(post => post.user_id === profile.id);

  const handleStartConversation = () => {
    navigate(`/messages?user=${profile.id}`);
  };

  const handleSaveProfile = async () => {
    await updateProfile(editData);
    setIsEditing(false);
  };

  const handleAvatarUpload = (url: string) => {
    setEditData(prev => ({ ...prev, avatar_url: url }));
  };

  const handleBannerUpload = (url: string) => {
    setEditData(prev => ({ ...prev, banner_url: url }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {/* Enhanced Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  {profile.display_name || profile.username || 'Profile'}
                  {profile.is_verified && (
                    <Crown className="w-6 h-6 text-amber-500" />
                  )}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {profile.posts_count} posts
                  </p>
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>Engagement: 95%</span>
                  </div>
                </div>
              </div>
              {profile.premium_tier !== 'free' && (
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  {profile.premium_tier?.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>

          {/* Enhanced Profile Banner */}
          <div className="relative">
            {isEditing && isOwnProfile ? (
              <ImageUpload
                currentImageUrl={editData.banner_url}
                onImageUpload={handleBannerUpload}
                bucketName="profile-images"
                folder="banners"
                className="h-64"
              />
            ) : (
              <div className="h-64 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 relative overflow-hidden">
                {profile.banner_url ? (
                  <img
                    src={profile.banner_url}
                    alt="Profile banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-sm" />
                )}
                {/* Profile Stats Overlay */}
                <div className="absolute top-4 right-4 flex gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-white">{profile.posts_count}</div>
                    <div className="text-xs text-white/80">Posts</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-white">{profile.followers_count}</div>
                    <div className="text-xs text-white/80">Followers</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-white">{profile.following_count}</div>
                    <div className="text-xs text-white/80">Following</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Avatar */}
            <div className="absolute -bottom-16 left-6">
              {isEditing && isOwnProfile ? (
                <ImageUpload
                  currentImageUrl={editData.avatar_url}
                  onImageUpload={handleAvatarUpload}
                  bucketName="profile-images"
                  folder="avatars"
                  className="w-32 h-32"
                  isAvatar={true}
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden shadow-2xl">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                    </span>
                  )}
                  {profile.is_verified && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex justify-end p-6 pt-4">
              {isOwnProfile ? (
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="rounded-full border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transition-all duration-300"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="rounded-full border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-500 transition-all duration-300"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleStartConversation}
                    className="rounded-full border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-500 transition-all duration-300"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    onClick={toggleFollow}
                    className={`rounded-full px-6 transition-all duration-300 shadow-lg ${
                      isFollowing 
                        ? 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Profile Info */}
          <div className="px-6 pb-6 mt-16">
            {isEditing && isOwnProfile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Display Name
                    </label>
                    <Input
                      value={editData.display_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Your display name"
                      className="rounded-xl border-purple-200 dark:border-purple-700 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Location
                    </label>
                    <Input
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Where are you located?"
                      className="rounded-xl border-purple-200 dark:border-purple-700 focus:border-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Bio
                  </label>
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself"
                    className="rounded-xl border-purple-200 dark:border-purple-700 focus:border-purple-500"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Website
                  </label>
                  <Input
                    value={editData.website}
                    onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    className="rounded-xl border-purple-200 dark:border-purple-700 focus:border-purple-500"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {profile.display_name || profile.username || 'User'}
                    </h2>
                    {profile.is_verified && (
                      <Badge className="bg-blue-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {profile.premium_tier !== 'free' && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  {profile.username && (
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">@{profile.username}</p>
                  )}
                </div>

                {profile.bio && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <p className="text-slate-900 dark:text-slate-100 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-400 mb-6">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-purple-500" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline transition-colors">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                  </div>
                </div>

                <div className="flex gap-8 text-sm">
                  <div className="text-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                      {profile.following_count}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">Following</span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                      {profile.followers_count}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">Followers</span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                      {profile.posts_count}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">Posts</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Enhanced Posts Section */}
          <div className="border-t border-purple-200 dark:border-purple-800">
            <div className="p-6 border-b border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Posts & Activity
              </h3>
            </div>
            {postsLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : userPosts.length > 0 ? (
              <div>
                {userPosts.map((post) => (
                  <div key={post.id} className="border-b border-purple-200 dark:border-purple-800 p-6 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors">
                    <p className="text-slate-900 dark:text-slate-100 text-lg leading-relaxed mb-3">{post.content}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {format(new Date(post.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          ❤️ {post.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          🔄 {post.retweets_count}
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {post.replies_count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-purple-400" />
                </div>
                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No posts yet</p>
                <p className="text-slate-500 dark:text-slate-400">Start sharing your thoughts with the world!</p>
              </div>
            )}
          </div>
        </main>

        <aside className="w-80 p-6 space-y-6">
          <TrendingWidget onHashtagClick={() => {}} />
        </aside>
      </div>
    </div>
  );
};

export default Profile;
