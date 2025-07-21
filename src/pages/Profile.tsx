import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Link as LinkIcon, Crown, Plus } from 'lucide-react';
import ProfilePostsList from '@/components/ProfilePostsList';
import ProfileReelsList from '@/components/ProfileReelsList';
import ProfileRepliesList from '@/components/ProfileRepliesList';
import ProfileActions from '@/components/ProfileActions';
import VerificationBadge from '@/components/VerificationBadge';
import ProfileEditDialog from '@/components/ProfileEditDialog';
import SubscriptionBadge from '@/components/SubscriptionBadge';
import UpgradeSubscriptionDialog from '@/components/UpgradeSubscriptionDialog';
import { useVerifiedStatus } from '@/hooks/useVerifiedStatus';
import RepliesSection from '@/components/RepliesSection';
import MediaPreview from '@/components/MediaPreview';
import GalleryUpload from '@/components/GalleryUpload';
import { useGallery } from '@/hooks/useGallery';
import { usePosts } from '@/hooks/usePosts';
import { usePinnedPosts } from '@/hooks/usePinnedPosts';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useState } from 'react';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, isFollowing, toggleFollow } = useProfile(userId);
  const { verificationLevel } = useVerifiedStatus(profile);
  const { galleryItems, loading: galleryLoading } = useGallery(userId);
  const { posts: allPosts, loading: postsLoading } = usePosts();
  const { pinnedPosts, loading: pinnedLoading } = usePinnedPosts();
  const { bookmarkedPosts, loading: bookmarksLoading } = useBookmarks();
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Filter posts for this specific user
  const userPosts = allPosts.filter(post => post.user_id === userId);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
        <SidebarNav />
        <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
          <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-32 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-20 w-20 bg-gray-300 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
              </div>
            </div>
          </main>
        </div>
        <RightSidebar />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
        <SidebarNav />
        <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
          <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
            <div className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profile not found</h2>
                <p className="text-gray-600 dark:text-gray-400">This user profile could not be loaded.</p>
              </div>
            </div>
          </main>
        </div>
        <RightSidebar />
      </div>
    );
  }

  const isOwnProfile = user.id === userId;
  const isPremiumUser = profile.premium_tier !== 'free';
  const canUpgrade = isOwnProfile && (profile.premium_tier === 'free' || profile.premium_tier === 'pro');

  // Get user's liked posts from their posts data
  const likedPosts = userPosts?.filter(post => post.user_liked) || [];

  // Get posts with media
  const mediaPosts = userPosts?.filter(post => post.image_urls && post.image_urls.length > 0) || [];

  const handleImageClick = (images: string[], index: number) => {
    setPreviewImages(images);
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const handleGalleryImageClick = (imageUrl: string) => {
    setPreviewImages([imageUrl]);
    setPreviewIndex(0);
    setPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          {/* Profile Header */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 relative">
              {profile.banner_url && (
                <img 
                  src={profile.banner_url} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex justify-between items-start -mt-16 relative z-10">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile.display_name?.[0] || profile.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-16 flex gap-2">
                  {isOwnProfile && (
                    <>
                      <Button
                        onClick={() => navigate('/?compose=true')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                      <ProfileEditDialog
                        trigger={
                          <Button
                            variant="outline"
                            className="border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          >
                            Edit Profile
                          </Button>
                        }
                      />
                    </>
                  )}
                  {!isOwnProfile && (
                    <ProfileActions 
                      userId={profile.id}
                      username={profile.username}
                      isOwnProfile={isOwnProfile}
                      isFollowing={isFollowing}
                      onFollowToggle={toggleFollow}
                    />
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {profile.display_name || profile.username}
                  </h1>
                  {verificationLevel && (
                    <VerificationBadge level={verificationLevel} />
                  )}
                  {isPremiumUser && (
                    <Crown className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
                  <SubscriptionBadge 
                    tier={profile.premium_tier || 'free'} 
                    showIcon={false} 
                    country={profile.country}
                  />
                  {canUpgrade && (
                    <UpgradeSubscriptionDialog 
                      currentTier={profile.premium_tier || 'free'}
                      trigger={
                        <Button variant="outline" size="sm" className="ml-2">
                          <Crown className="w-3 h-3 mr-1" />
                          Upgrade
                        </Button>
                      }
                    />
                  )}
                </div>
                
                {profile.bio && (
                  <p className="mt-3 text-gray-900 dark:text-gray-100">{profile.bio}</p>
                )}

                {/* Profile Stats */}
                <div className="flex gap-6 mt-4 text-sm">
                  {profile.location && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <LinkIcon className="w-4 h-4" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                         className="hover:text-purple-600 dark:hover:text-purple-400">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>

                {/* Follow counts */}
                <div className="flex gap-6 mt-4">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {profile.following_count}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">Following</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {profile.followers_count}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">Followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content Tabs */}
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start border-b border-purple-200 dark:border-purple-800 bg-transparent rounded-none p-0">
                <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="reels" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                  Reels
                </TabsTrigger>
                <TabsTrigger value="replies" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                  Replies
                </TabsTrigger>
                <TabsTrigger value="media" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                  Media
                </TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="pinned" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                  Pinned
                </TabsTrigger>
                <TabsTrigger value="bookmarks" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                  Bookmarks
                </TabsTrigger>
                <TabsTrigger value="likes" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                  Likes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-0">
                <ProfilePostsList userId={userId} />
              </TabsContent>

              <TabsContent value="reels" className="mt-0">
                <ProfileReelsList userId={userId} />
              </TabsContent>

            <TabsContent value="replies" className="mt-0">
              <ProfileRepliesList userId={userId} />
            </TabsContent>

            <TabsContent value="media" className="mt-0">
              <div className="p-4">
                {mediaPosts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaPosts.map((post) => 
                      post.image_urls?.map((imageUrl, index) => (
                        <div 
                          key={`${post.id}-${index}`}
                          className="aspect-square cursor-pointer group relative overflow-hidden rounded-lg"
                          onClick={() => handleImageClick(post.image_urls!, index)}
                        >
                          <img
                            src={imageUrl}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                              View
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    {postsLoading ? 'Loading media...' : 'No media posts yet'}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="mt-0">
              <div className="p-4">
                {isOwnProfile && (
                  <div className="mb-6 flex justify-center">
                    <GalleryUpload />
                  </div>
                )}
                
                {galleryLoading ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    Loading gallery...
                  </div>
                ) : galleryItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                    {galleryItems.map((item) => (
                      <div 
                        key={item.id}
                        className={`relative cursor-pointer group overflow-hidden rounded-lg ${item.span_config}`}
                        onClick={() => handleGalleryImageClick(item.file_url)}
                      >
                        {item.file_type === 'video' ? (
                          <video
                            src={item.file_url}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            muted
                          />
                        ) : (
                          <img
                            src={item.file_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end p-4">
                          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <h3 className="font-medium text-sm">{item.title}</h3>
                            {item.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    {isOwnProfile ? 'Upload your first gallery item!' : 'No gallery items yet'}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pinned" className="mt-0">
              <div className="space-y-4">
                {isOwnProfile ? (
                  pinnedLoading ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      Loading pinned posts...
                    </div>
                  ) : pinnedPosts.length > 0 ? (
                    pinnedPosts.map((post) => (
                      <div key={post.id} className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.profiles.avatar_url} />
                            <AvatarFallback>
                              {post.profiles.display_name?.[0] || post.profiles.username?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {post.profiles.display_name || post.profiles.username}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 text-sm">
                                @{post.profiles.username}
                              </span>
                              <span className="text-slate-400 dark:text-slate-500 text-sm">
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{post.content}</p>
                            {post.image_urls && post.image_urls.length > 0 && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {post.image_urls.slice(0, 2).map((imageUrl, index) => (
                                  <img
                                    key={index}
                                    src={imageUrl}
                                    alt={`Post image ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                    onClick={() => handleImageClick(post.image_urls!, index)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      No pinned posts yet
                    </div>
                  )
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    Pinned posts are private
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="mt-0">
              <div className="space-y-4">
                {isOwnProfile ? (
                  bookmarksLoading ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      Loading bookmarked posts...
                    </div>
                  ) : bookmarkedPosts.length > 0 ? (
                    bookmarkedPosts.map((post) => (
                      <div key={post.id} className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.profiles.avatar_url} />
                            <AvatarFallback>
                              {post.profiles.display_name?.[0] || post.profiles.username?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {post.profiles.display_name || post.profiles.username}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 text-sm">
                                @{post.profiles.username}
                              </span>
                              <span className="text-slate-400 dark:text-slate-500 text-sm">
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{post.content}</p>
                            {post.image_urls && post.image_urls.length > 0 && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {post.image_urls.slice(0, 2).map((imageUrl, index) => (
                                  <img
                                    key={index}
                                    src={imageUrl}
                                    alt={`Post image ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                    onClick={() => handleImageClick(post.image_urls!, index)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      No bookmarked posts yet
                    </div>
                  )
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    Bookmarks are private
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="likes" className="mt-0">
              <div className="space-y-4">
                {likedPosts.length > 0 ? (
                  likedPosts.map((post) => (
                    <div key={post.id} className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.profiles.avatar_url} />
                          <AvatarFallback>
                            {post.profiles.display_name?.[0] || post.profiles.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {post.profiles.display_name || post.profiles.username}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm">
                              @{post.profiles.username}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 text-sm">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{post.content}</p>
                          {post.image_urls && post.image_urls.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {post.image_urls.slice(0, 2).map((imageUrl, index) => (
                                <img
                                  key={index}
                                  src={imageUrl}
                                  alt={`Post image ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                  onClick={() => handleImageClick(post.image_urls!, index)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    {postsLoading ? 'Loading liked posts...' : 'No liked posts yet'}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <RightSidebar />

      {/* Media Preview */}
      <MediaPreview
        images={previewImages}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};

export default Profile;
