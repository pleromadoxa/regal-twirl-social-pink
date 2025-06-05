
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, MapPin, Link as LinkIcon, Edit, MessageCircle, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6">
        <main className="flex-1 border-x border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 p-5 z-10">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {profile.display_name || profile.username || 'Profile'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {profile.posts_count} posts
            </p>
          </div>

          {/* Profile Banner */}
          <div className="relative">
            {isEditing && isOwnProfile ? (
              <ImageUpload
                currentImageUrl={editData.banner_url}
                onImageUpload={handleBannerUpload}
                bucketName="profile-images"
                folder="banners"
                className="h-48"
              />
            ) : (
              <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 relative">
                {profile.banner_url && (
                  <img
                    src={profile.banner_url}
                    alt="Profile banner"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
            
            {/* Avatar */}
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
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-slate-600 dark:text-slate-300">
                      {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end p-6 pt-4">
              {isOwnProfile ? (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="rounded-2xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="rounded-2xl bg-purple-600 hover:bg-purple-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="rounded-2xl"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleStartConversation}
                    className="rounded-2xl"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    onClick={toggleFollow}
                    className={`rounded-2xl ${
                      isFollowing 
                        ? 'bg-slate-600 hover:bg-slate-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 mt-12">
            {isEditing && isOwnProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Display Name
                  </label>
                  <Input
                    value={editData.display_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Your display name"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bio
                  </label>
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself"
                    className="rounded-xl"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <Input
                    value={editData.location}
                    onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Where are you located?"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Website
                  </label>
                  <Input
                    value={editData.website}
                    onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    className="rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {profile.display_name || profile.username || 'User'}
                  </h2>
                  {profile.username && (
                    <p className="text-slate-600 dark:text-slate-400">@{profile.username}</p>
                  )}
                  {profile.is_verified && (
                    <span className="inline-block ml-2 text-blue-500">✓</span>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-slate-900 dark:text-slate-100 mb-4">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{profile.following_count}</span>
                    <span className="text-slate-600 dark:text-slate-400 ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{profile.followers_count}</span>
                    <span className="text-slate-600 dark:text-slate-400 ml-1">Followers</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Posts */}
          <div className="border-t border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Posts</h3>
            </div>
            {postsLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : userPosts.length > 0 ? (
              <div>
                {userPosts.map((post) => (
                  <div key={post.id} className="border-b border-slate-200 dark:border-slate-700 p-6">
                    <p className="text-slate-900 dark:text-slate-100">{post.content}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {format(new Date(post.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">No posts yet</p>
              </div>
            )}
          </div>
        </main>

        <aside className="w-80 p-4">
          <TrendingWidget onHashtagClick={() => {}} />
        </aside>
      </div>
    </div>
  );
};

export default Profile;
