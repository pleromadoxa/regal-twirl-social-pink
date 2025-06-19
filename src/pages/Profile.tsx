
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Link as LinkIcon, Crown } from 'lucide-react';
import PostsList from '@/components/PostsList';
import ProfileActions from '@/components/ProfileActions';
import VerificationBadge from '@/components/VerificationBadge';
import ProfileEditDialog from '@/components/ProfileEditDialog';
import SubscriptionBadge from '@/components/SubscriptionBadge';
import UpgradeSubscriptionDialog from '@/components/UpgradeSubscriptionDialog';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { profile, loading } = useProfile(userId);

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
                  )}
                  {!isOwnProfile && (
                    <ProfileActions 
                      userId={profile.id}
                      username={profile.username}
                      isOwnProfile={isOwnProfile}
                    />
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {profile.display_name || profile.username}
                  </h1>
                  {profile.verification_level && (
                    <VerificationBadge level={profile.verification_level as any} />
                  )}
                  {isPremiumUser && (
                    <Crown className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
                  <SubscriptionBadge tier={profile.premium_tier || 'free'} showIcon={false} />
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
              <TabsTrigger value="replies" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                Replies
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                Media
              </TabsTrigger>
              <TabsTrigger value="likes" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none">
                Likes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-0">
              <PostsList userId={userId} />
            </TabsContent>

            <TabsContent value="replies" className="mt-0">
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Replies feature coming soon
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-0">
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Media gallery coming soon
              </div>
            </TabsContent>

            <TabsContent value="likes" className="mt-0">
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Liked posts coming soon
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Profile;
