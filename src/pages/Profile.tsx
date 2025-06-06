import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import PostsList from "@/components/PostsList";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Settings, Building, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  is_verified: boolean;
  premium_tier: string;
  created_at: string;
  followers_count: number;
  following_count: number;
}

export const Profile = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.id === id;
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [id, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const profileId = id || user?.id;

      if (!profileId) {
        console.log('No profile ID provided.');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      setProfile(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const profileId = id || user?.id;

      if (!profileId) {
        console.log('No profile ID provided.');
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      }

      setPosts(data || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile Not Found</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400">The requested profile could not be found.</p>
          <Button onClick={() => navigate('/')} className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const isVerified = profile?.is_verified || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex h-screen">
      <SidebarNav />
      
      <main className="flex-1 max-w-4xl mx-auto border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl sticky top-0 z-10 border-b border-purple-200 dark:border-purple-800 p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {profile?.display_name || profile?.username || 'Profile'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and manage your profile information.
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="w-24 h-24 ring-4 ring-white dark:ring-slate-800">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {profile?.display_name?.[0] || profile?.username?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {profile?.display_name || profile?.username || 'User'}
                  </h1>
                  {isVerified && (
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {profile?.premium_tier && profile.premium_tier !== 'free' && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <Crown className="w-4 h-4 mr-1" />
                      {profile.premium_tier}
                    </Badge>
                  )}
                </div>
                
                <p className="text-slate-600 dark:text-slate-400">
                  @{profile?.username}
                </p>
                
                {profile?.bio && (
                  <p className="text-slate-700 dark:text-slate-300 max-w-md">
                    {profile.bio}
                  </p>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined {formatDistanceToNow(new Date(profile?.created_at || Date.now()), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span><strong>{profile?.followers_count || 0}</strong> Followers</span>
                    <span><strong>{profile?.following_count || 0}</strong> Following</span>
                  </div>
                </div>
              </div>
            </div>
            
            {isOwnProfile && (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => navigate('/settings')}
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                
                <Button
                  onClick={() => navigate('/professional')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Professional Account
                </Button>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="posts" className="mt-8">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-slate-500">Loading posts...</p>
                </div>
              ) : (
                <PostsList posts={posts} />
              )}
            </TabsContent>
            <TabsContent value="about" className="mt-4">
              <div className="space-y-4">
                <div className="text-slate-700 dark:text-slate-300">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">About Me</h2>
                  {profile?.bio ? (
                    <p>{profile.bio}</p>
                  ) : (
                    <p>No bio available.</p>
                  )}
                </div>
                
                <div className="text-slate-700 dark:text-slate-300">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Contact Information</h2>
                  <p>Email: {user?.email}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <RightSidebar />
    </div>
  );
};

export default Profile;
